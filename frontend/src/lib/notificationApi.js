
import axiosInstance from './axiosInstance.js';

/**
 * List the authenticated user's notifications.
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<{ success: boolean, message: string, data: { notifications: object[], total: number, unread: number, page: number, limit: number, totalPages: number } }>}
 */
export async function getNotifications({ page = 1, limit = 20 } = {}) {
  const response = await axiosInstance.get('/api/notifications', {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Mark a single notification as read.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function markNotificationRead(id) {
  const response = await axiosInstance.patch(`/api/notifications/${id}/read`);
  return response.data;
}

/**
 * Mark all of the user's notifications as read.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function markAllNotificationsRead() {
  const response = await axiosInstance.patch('/api/notifications/read-all');
  return response.data;
}
