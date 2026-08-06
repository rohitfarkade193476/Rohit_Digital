
import axiosInstance from './axiosInstance.js';

/**
 * List all assignments for the authenticated vendor.
 * @returns {Promise<{ success: boolean, message: string, data: { assignments: object[] } }>}
 */
export async function getMyAssignments() {
  const response = await axiosInstance.get('/api/vendor/assignments');
  return response.data;
}

/**
 * Fetch a single assignment belonging to the authenticated vendor.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string, data: { assignment: object } }>}
 */
export async function getMyAssignmentById(id) {
  const response = await axiosInstance.get(`/api/vendor/assignments/${id}`);
  return response.data;
}

/**
 * Update an assignment status (ASSIGNED -> ACCEPTED/CANCELLED -> IN_PROGRESS -> COMPLETED).
 * When completing with an after-resolution image, pass the selected File so it
 * is uploaded once with the status update and persisted by the backend.
 * @param {string} id
 * @param {string} status
 * @param {File|null|undefined} [afterImageFile]
 * @returns {Promise<{ success: boolean, message: string, data: { assignment: object } }>}
 */
export async function updateMyAssignmentStatus(id, status, afterImageFile) {
  if (afterImageFile) {
    const formData = new FormData();
    formData.append('status', status);
    formData.append('afterImage', afterImageFile);
    const response = await axiosInstance.patch(
      `/api/vendor/assignments/${id}/status`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }
  const response = await axiosInstance.patch(
    `/api/vendor/assignments/${id}/status`,
    { status }
  );
  return response.data;
}

/**
 * Society Admin assigns a vendor to a complaint.
 * @param {string} complaintId
 * @param {string} vendorId
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function assignVendorToComplaint(complaintId, vendorId) {
  const response = await axiosInstance.post(
    `/api/complaints/${complaintId}/assign-vendor`,
    { vendorId }
  );
  return response.data;
}

/**
 * Society Admin assigns a staff member to a complaint.
 * @param {string} complaintId
 * @param {string} staffId
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export async function assignStaffToComplaint(complaintId, staffId) {
  const response = await axiosInstance.post(
    `/api/complaints/${complaintId}/assign-staff`,
    { staffId }
  );
  return response.data;
}

/**
 * Fetch the assignment history of a complaint (Society Admin).
 * @param {string} complaintId
 * @returns {Promise<{ success: boolean, message: string, data: { assignments: object[] } }>}
 */
export async function getComplaintAssignments(complaintId) {
  const response = await axiosInstance.get(`/api/complaints/${complaintId}/assignments`);
  return response.data;
}
