import prisma from "../../config/prisma.js";
import { sendPushNotificationToUser } from "./push.service.js";

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  complaintId,
}) => {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, complaintId },
  });

  // Best-effort web push delivery. Fire-and-forget so a push failure can never
  // fail the notification record or the business operation that triggered it.
  try {
    sendPushNotificationToUser(userId, { title, message, complaintId }).catch(
      (error) => {
        console.error("Web push delivery failed:", error?.message || error);
      }
    );
  } catch (error) {
    console.error("Web push delivery failed:", error?.message || error);
  }

  return notification;
};

export const listUserNotifications = async (
  userId,
  { page = 1, limit = 20, read } = {}
) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const where = { userId };
  if (read === "true" || read === true) {
    where.isRead = true;
  } else if (read === "false" || read === false) {
    where.isRead = false;
  }

  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.notification.count({ where }),
    // `unread` is always the user's global unread count so the header badge
    // stays correct regardless of the current read/unread filter.
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    total,
    unread,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const markNotificationRead = async (id, userId) => {
  const existing = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) return { notFound: true };

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return { marked: true };
};

export const markAllNotificationsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { marked: true };
};
