
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

export async function createStaff(data) {
  const response = await axiosInstance.post('/api/staff', data);
  return response.data;
}

export async function updateStaff(id, data) {
  const response = await axiosInstance.put(`/api/staff/${id}`, data);
  return response.data;
}

export async function deleteStaff(id) {
  const response = await axiosInstance.delete(`/api/staff/${id}`);
  return response.data;
}

/**
 * Validate an Excel file of staff without creating any records.
 * @param {File} file - .xlsx / .xls file
 * @returns {Promise<{ success, message, data: { total, valid, invalid, rows } }>}
 */
export async function previewStaffExcel(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(
    '/api/staff/upload/preview',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data;
}

/**
 * Import an Excel file of staff members (valid rows only).
 * @param {File} file - .xlsx / .xls file
 * @returns {Promise<{ success, message, data: { total, imported, failed, invited, invitationFailed, errors } }>}
 */
export async function importStaffExcel(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(
    '/api/staff/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data;
}

