
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
