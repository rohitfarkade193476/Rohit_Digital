import prisma from "../../config/prisma.js";

export const createNotification = async ({ userId, type, title, message }) => {
  return prisma.notification.create({
    data: { userId, type, title, message },
  });
};

export const listUserNotifications = async (
  userId,
  { page = 1, limit = 20 } = {}
) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.notification.count({ where: { userId } }),
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
