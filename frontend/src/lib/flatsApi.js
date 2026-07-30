import axiosInstance from './axiosInstance.js';

/**
 * Flat Management API service.
 * All requests use the shared axiosInstance (credentials: 'include').
 * societyId is resolved server-side from the authenticated Society Admin session.
 */

/**
 * Fetch all flats for the logged-in society.
 * @returns {Promise<{ flats: object[] }>}
 */
export async function getFlats(page = 1, limit = 10) {
  const response = await axiosInstance.get( `/api/flats?page=${page}&limit=${limit}`);
  return response.data;
}

/**
 * Fetch a single flat by ID.
 * @param {string} id
 * @returns {Promise<{ flat: object }>}
 */
export async function getFlatById(id) {
  const response = await axiosInstance.get(`/api/flats/${id}`);
  return response.data;
}

/**
 * Create a new flat.
 * societyId is automatically assigned by the backend from the session.
 * @param {{ flatNumber: string, wing: string, floor: string, type: string, status: string }} data
 * @returns {Promise<{ flat: object }>}
 */
export async function createFlat(data) {
  const response = await axiosInstance.post('/api/flats', data);
  return response.data;
}

/**
 * Update an existing flat by ID.
 * @param {string} id
 * @param {{ flatNumber?: string, wing?: string, floor?: string, type?: string, status?: string }} data
 * @returns {Promise<{ flat: object }>}
 */
export async function updateFlat(id, data) {
  const response = await axiosInstance.put(`/api/flats/${id}`, data);
  return response.data;
}

/**
 * Delete a flat by ID.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteFlat(id) {
  await axiosInstance.delete(`/api/flats/${id}`);
}

export async function uploadFlatsExcel(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axiosInstance.post(
    "/api/flats/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}