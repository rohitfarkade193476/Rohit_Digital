
// Role-based routes used by notification navigation. Kept in one place so the
// header dropdown and the Notifications page deep-link to the same destinations.

export const NOTIFICATION_ROUTES_BY_ROLE = {
  SUPER_ADMIN: '/super-admin/notifications',
  SOCIETY_ADMIN: '/society-admin/notifications',
  STAFF: '/staff/notifications',
  RESIDENT: '/resident/notifications',
  VENDOR: '/vendor/notifications',
};

// Landing route that shows a role's complaint/work list. Complaint detail is
// opened through each page's existing UI mechanism (drawer / detail route),
// driven by the `complaint` query parameter.
export const COMPLAINT_LIST_ROUTES_BY_ROLE = {
  SOCIETY_ADMIN: '/society-admin/complaints',
  RESIDENT: '/resident/complaints',
  STAFF: '/staff/assigned-complaints',
  VENDOR: '/vendor/assignments',
};

/**
 * Build the deep-link URL that opens a specific complaint for a role.
 * Returns null when the role has no complaint page or no complaintId is given.
 * @param {string} role
 * @param {string|null} complaintId
 * @returns {string|null}
 */
export function complaintDeepLinkRoute(role, complaintId) {

  const normalizedRole = String(role || '').toUpperCase();
  const normalizedComplaintId = String(complaintId || '').trim();

  const base = COMPLAINT_LIST_ROUTES_BY_ROLE[normalizedRole];

  if (!base || !normalizedComplaintId) {
    console.warn('Notification deep link unavailable:', {
      role,
      complaintId,
    });
    return null;
  }
  // const base = COMPLAINT_LIST_ROUTES_BY_ROLE[role];
  // if (!base || !complaintId) return null;
  return `${base}?complaint=${encodeURIComponent(normalizedComplaintId)}`;
}
