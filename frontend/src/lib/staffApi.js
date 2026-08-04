
import axiosInstance from './axiosInstance.js';

/**
 * List staff members for the authenticated society admin's society.
 * @param {{ page?: number, limit?: number }} [params]
 * @returns {Promise<{ success: boolean, message: string, data: { staff: object[], total: number, page: number, limit: number, totalPages: number } }>}
 */
export async function getAllStaff({ page = 1, limit = 20 } = {}) {
  const response = await axiosInstance.get('/api/staff', { params: { page, limit } });
  return response.data;
}
