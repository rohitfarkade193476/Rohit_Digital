
import axiosInstance from './axiosInstance.js';

/**
 * Public vendor self-registration.
 * @param {object} data { companyName, firstName, lastName, email, phone, category, contractType?, description?, address?, city?, state?, pincode? }
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function registerVendor(data) {
  const response = await axiosInstance.post('/api/vendors/register', data);
  return response.data;
}

/**
 * Fetch the authenticated vendor's own profile.
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function getMyVendorProfile() {
  const response = await axiosInstance.get('/api/vendors/me');
  return response.data;
}

/**
 * Update the authenticated vendor's own profile.
 * @param {object} data Partial vendor fields (companyName, firstName, lastName, phone, category, contractType, description, address, city, state, pincode, isAvailable).
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function updateMyVendorProfile(data) {
  const response = await axiosInstance.patch('/api/vendors/me', data);
  return response.data;
}

/**
 * Society Admin vendor discovery.
 * @param {{ page?: number, limit?: number, search?: string, category?: string, isAvailable?: string }} params
 * @returns {Promise<{ success: boolean, message: string, data: { vendors: object[], total: number, page: number, limit: number, totalPages: number } }>}
 */
export async function getAllVendors({
  page = 1,
  limit = 20,
  search = '',
  category = '',
  isAvailable = '',
} = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (category) params.category = category;
  if (isAvailable !== '' && isAvailable !== undefined) {
    params.isAvailable = isAvailable;
  }
  const response = await axiosInstance.get('/api/vendors', { params });
  return response.data;
}

/**
 * Fetch a single vendor (Society Admin).
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function getVendorById(id) {
  const response = await axiosInstance.get(`/api/vendors/${id}`);
  return response.data;
}
