export const PERMISSIONS = {
  SUPER_ADMIN: [
    'viewSocieties',
    'viewSubscriptionPlans',
  ],
  SOCIETY_ADMIN: [
    'manageFlats',
    'manageResidents',
    'manageStaff',
    'manageVendors',
    'manageComplaints',
  ],
  RESIDENT: [
    'raiseComplaint',
    'viewOwnComplaints',
  ],
  STAFF: [
    'viewAssignedJobs',
    'updateJobStatus',
  ],
  VENDOR: [
    'viewAssignedJobs',
    'updateJobStatus',
    'respondToRequests',
  ],
};
