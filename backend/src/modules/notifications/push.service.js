import webpush from "web-push";

import prisma from "../../config/prisma.js";
import { env } from "../../config/env.js";

const DASHBOARD_ROUTES = {
  SUPER_ADMIN: "/super-admin/dashboard",
  SOCIETY_ADMIN: "/society-admin/dashboard",
  STAFF: "/staff/dashboard",
  RESIDENT: "/resident/dashboard",
  VENDOR: "/vendor/dashboard",
};

// Landing route that shows a role's complaint/work list (kept in sync with the
// frontend COMPLAINT_LIST_ROUTES_BY_ROLE). The complaint detail is opened
// through each page's existing deep-link UI via the `complaint` query param.
const COMPLAINT_LIST_ROUTES = {
  SOCIETY_ADMIN: "/society-admin/complaints",
  RESIDENT: "/resident/complaints",
  STAFF: "/staff/assigned-complaints",
  VENDOR: "/vendor/assignments",
};

if (env.VAPID_SUBJECT && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

export const isPushConfigured = () =>
  Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT);

export const getVapidPublicKey = () => env.VAPID_PUBLIC_KEY;

/**
 * Persist a browser PushSubscription for a user. The user id is always the
 * authenticated user's id from the session — never taken from the body.
 */
export const savePushSubscription = async (userId, subscription) => {
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!endpoint || !p256dh || !auth) return { invalid: true };

  await prisma.pushSubscription.upsert({
    where: { userId_endpoint: { userId, endpoint } },
    update: { p256dh, auth },
    create: { userId, endpoint, p256dh, auth },
  });

  return { saved: true };
};

export const deletePushSubscription = async (userId, endpoint) => {
  if (!endpoint) return { deleted: false };

  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });

  return { deleted: true };
};

/**
 * Best-effort web push delivery to every subscription of a user. Never throws:
 * push failures are logged and stale subscriptions (HTTP 404/410) are pruned
 * so delivery does not break the underlying business operation.
 */
export const sendPushNotificationToUser = async (userId, payload) => {
  if (!isPushConfigured()) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
    include: { user: { select: { role: true } } },
  });
  if (subscriptions.length === 0) return;

  const role = subscriptions[0]?.user?.role;

  // Deep-link straight to the complaint (if any) using the role's existing
  // complaint page, otherwise land on the role dashboard.
  let notificationUrl;
  if (payload.complaintId && COMPLAINT_LIST_ROUTES[role]) {
    notificationUrl = `${COMPLAINT_LIST_ROUTES[role]}?complaint=${encodeURIComponent(
      payload.complaintId
    )}`;
  } else {
    notificationUrl = DASHBOARD_ROUTES[role] || "/";
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.message,
    data: {
      url: notificationUrl,
      complaintId: payload.complaintId || null,
    },
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body
      );
    } catch (error) {
      const statusCode = error?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.deleteMany({
          where: { userId, endpoint: sub.endpoint },
        });
      } else {
        console.error("Web push delivery failed:", error?.message || error);
      }
    }
  }
};
