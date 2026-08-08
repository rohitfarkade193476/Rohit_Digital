import axiosInstance from "./axiosInstance.js";

/**
 * Global dashboard statistics for the super admin.
 * @returns {Promise<{ success, message, data: { societies, users, residents, staff, vendors, complaints, priorityBreakdown } }>}
 */
export const getSuperAdminStats = async () => {
  const response = await axiosInstance.get("/api/super-admin/dashboard/stats");
  return response.data;
};

/**
 * List all societies with optional filters.
 * @param {{ search?: string, status?: 'ACTIVE'|'INACTIVE'|'SUSPENDED', page?: number, limit?: number }} params
 */
export const getSocieties = async ({
  search,
  status,
  page = 1,
  limit = 10,
} = {}) => {
  const response = await axiosInstance.get("/api/super-admin/societies", {
    params: { search, status, page, limit },
  });
  return response.data;
};

export const getSocietyById = async (id) => {
  const response = await axiosInstance.get(`/api/super-admin/societies/${id}`);
  return response.data;
};

/**
 * Change a society's status.
 * @param {string} id
 * @param {'ACTIVE'|'INACTIVE'|'SUSPENDED'} status
 */
export const updateSocietyStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `/api/super-admin/societies/${id}/status`,
    { status }
  );
  return response.data;
};

/**
 * List all users across the platform with optional filters.
 * @param {{ search?: string, role?: string, societyId?: string, page?: number, limit?: number }} params
 */
export const getUsers = async ({
  search,
  role,
  societyId,
  page = 1,
  limit = 10,
} = {}) => {
  const response = await axiosInstance.get("/api/super-admin/users", {
    params: { search, role, societyId, page, limit },
  });
  return response.data;
};

/**
 * Activate or deactivate a user account.
 * @param {string} id
 * @param {boolean} isActive
 */
export const updateUserStatus = async (id, isActive) => {
  const response = await axiosInstance.patch(
    `/api/super-admin/users/${id}/status`,
    { isActive }
  );
  return response.data;
};

/**
 * Global complaint analytics for the super admin.
 * @param {{ from?: string, to?: string }} [range] - ISO date strings (YYYY-MM-DD)
 */
export const getReportsOverview = async ({ from, to } = {}) => {
  const response = await axiosInstance.get("/api/super-admin/reports/overview", {
    params: { from, to },
  });
  return response.data;
};
