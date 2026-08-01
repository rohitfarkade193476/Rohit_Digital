import {
  listUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notification.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getMyNotificationsHandler = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await listUserNotifications(req.user.id, { page, limit });

  return successResponse(res, 200, "Notifications fetched successfully", result);
});

export const markNotificationReadHandler = asyncHandler(async (req, res) => {
  const result = await markNotificationRead(req.params.id, req.user.id);

  if (result.notFound) {
    return errorResponse(res, 404, "Notification not found");
  }

  return successResponse(res, 200, "Notification marked as read");
});

export const markAllNotificationsReadHandler = asyncHandler(async (req, res) => {
  await markAllNotificationsRead(req.user.id);

  return successResponse(res, 200, "All notifications marked as read");
});
