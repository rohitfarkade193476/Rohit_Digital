import axiosInstance from './axiosInstance.js';

/**
 * Society Admin — list all vendor connections for their own society.
 * @returns {Promise<{ success: boolean, message: string, data: { connections: object[] } }>}
 */
export async function getSocietyConnections() {
  const response = await axiosInstance.get('/api/vendor-connections/society');
  return response.data;
}

/**
 * Society Admin — send a connection request to a vendor.
 * @param {string} vendorId
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function sendConnectionRequest(vendorId) {
  const response = await axiosInstance.post('/api/vendor-connections', {
    vendorId,
  });
  return response.data;
}

/**
 * Society Admin — remove an accepted connection with a vendor.
 * @param {string} connectionId
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function removeConnection(connectionId) {
  const response = await axiosInstance.delete(
    `/api/vendor-connections/${connectionId}`,
  );
  return response.data;
}

/**
 * Vendor — list all connections for their company.
 * @returns {Promise<{ success: boolean, message: string, data: { connections: object[] } }>}
 */
export async function getMyConnections() {
  const response = await axiosInstance.get('/api/vendor-connections/vendor');
  return response.data;
}

/**
 * Vendor — list pending connection requests from societies.
 * @returns {Promise<{ success: boolean, message: string, data: { connections: object[] } }>}
 */
export async function getMyPendingConnections() {
  const response = await axiosInstance.get(
    '/api/vendor-connections/vendor/pending',
  );
  return response.data;
}

/**
 * Vendor — accept or reject a pending connection request.
 * @param {string} connectionId
 * @param {'ACCEPTED' | 'REJECTED'} status
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function respondToConnection(connectionId, status) {
  const response = await axiosInstance.patch(
    `/api/vendor-connections/${connectionId}/respond`,
    { status },
  );
  return response.data;
}
