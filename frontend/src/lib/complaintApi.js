
import axiosInstance from './axiosInstance.js';

/**
 * List complaints (RESIDENT sees own, SOCIETY_ADMIN sees society-wide).
 * @param {{ page?: number, limit?: number, status?: string, category?: string, priority?: string }} params
 * @returns {Promise<{ success: boolean, message: string, data: { complaints: object[], total: number, page: number, limit: number, totalPages: number } }>}
 */
export async function getComplaints({
  page = 1,
  limit = 20,
  status = '',
  category = '',
  priority = '',
} = {}) {
  const params = { page, limit };
  if (status) params.status = status;
  if (category) params.category = category;
  if (priority) params.priority = priority;
  const response = await axiosInstance.get('/api/complaints', { params });
  return response.data;
}

/**
 * Fetch a single complaint by id.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function getComplaintById(id) {
  const response = await axiosInstance.get(`/api/complaints/${id}`);
  return response.data;
}

/**
 * Create a complaint. Residents may omit residentId (derived server-side);
 * Society Admins must pass a residentId belonging to their society.
 * @param {object} data { title, description?, category, priority?, residentId? }
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function createComplaint(data) {
  const response = await axiosInstance.post('/api/complaints', data);
  return response.data;
}

/**
 * Create a complaint with an image attachment (multipart/form-data).
 * @param {FormData} formData - must include at minimum: title, category, priority. May include: image
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function createComplaintWithImage(formData) {
  const response = await axiosInstance.post('/api/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Get the status-change history for a complaint.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string, data: { history: object[] } }>}
 */
export async function getComplaintHistory(id) {
  const response = await axiosInstance.get(`/api/complaints/${id}/history`);
  return response.data;
}

/**
 * Reopen a resolved/closed complaint (RESIDENT only).
 * @param {string} id
 * @param {object} [body] - optional { note }
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function reopenComplaint(id, body = {}) {
  const response = await axiosInstance.post(`/api/complaints/${id}/reopen`, body);
  return response.data;
}

/**
 * Change complaint status directly (SOCIETY_ADMIN only).
 * @param {string} id
 * @param {string} status
 * @param {string} [note]
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function changeComplaintStatus(id, status, note) {
  const response = await axiosInstance.patch(`/api/complaints/${id}/status`, { status, note });
  return response.data;
}

/**
 * Record resident satisfaction for a resolved/closed complaint (RESIDENT only).
 * @param {string} id
 * @param {object} [body] - optional { note }
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function markSatisfied(id, body = {}) {
  const response = await axiosInstance.post(`/api/complaints/${id}/satisfaction`, body);
  return response.data;
}
