import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";

import Login from "./pages/Login.jsx";
import RegisterSociety from "./pages/RegisterSociety.jsx";
import ActivateAccount from "./pages/ActivateAccount.jsx";
import RegisterVendor from "./pages/vendor/RegisterVendor.jsx";
import Notifications from "./pages/Notifications.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";

// Common Pages
import Dashboard from "./pages/Dashboard.jsx";
import Notices from "./pages/Notices.jsx";
import Profile from "./pages/Profile.jsx";

// Society Admin Pages
import FlatManagement from "./pages/FlatManagement.jsx";
import ResidentManagement from "./pages/ResidentManagement.jsx";
import ComplaintManagement from "./pages/ComplaintManagement.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";
import VendorManagement from "./pages/VendorManagement.jsx";
import MaintenanceManagement from "./pages/MaintenanceManagement.jsx";

// Resident Pages
import ResidentDashboard from "./components/dashboards/ResidentDashboard.jsx";
import ResidentComplaints from "./pages/resident/ResidentComplaints.jsx";
import RaiseComplaint from "./pages/resident/RaiseComplaint.jsx";
import ResidentPayments from "./pages/resident/ResidentPayments.jsx";

// Staff Pages
import StaffDashboard from "./components/dashboards/StaffDashboard.jsx";
import StaffAssignedComplaints from "./pages/staff/StaffAssignedComplaints.jsx";

// Vendor Pages
import VendorDashboard from "./components/dashboards/VendorDashboard.jsx";
import VendorAssignments from "./pages/vendor/VendorAssignments.jsx";
import VendorAssignmentDetail from "./pages/vendor/VendorAssignmentDetail.jsx";
import VendorProfile from "./pages/vendor/VendorProfile.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public route — accessible before login (e.g. from invitation email) */}
      <Route path="/activate-account" element={<ActivateAccount />} />

      {/* Public route — vendor self-registration */}
      <Route path="/register-vendor" element={<RegisterVendor />} />

      {/* Guest Routes — redirect to role dashboard if already authenticated */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-society" element={<RegisterSociety />} />
      </Route>

      {/* Society Admin Scope */}
      <Route element={<ProtectedRoute allowedRoles={["SOCIETY_ADMIN"]} />}>
        <Route path="/society-admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="flats" element={<FlatManagement />} />
          <Route path="residents" element={<ResidentManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="maintenance" element={<MaintenanceManagement />} />
          <Route path="notices" element={<Notices />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Resident Scope */}
      <Route element={<ProtectedRoute allowedRoles={["RESIDENT"]} />}>
        <Route path="/resident" element={<DashboardLayout />}>
          <Route path="dashboard" element={<ResidentDashboard />} />
          <Route path="complaints" element={<ResidentComplaints />} />
          <Route path="complaints/new" element={<RaiseComplaint />} />
          <Route path="notices" element={<Notices />} />
          <Route path="payments" element={<ResidentPayments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Staff Scope */}
      <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
        <Route path="/staff" element={<DashboardLayout />}>
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="assigned-complaints" element={<StaffAssignedComplaints />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Vendor Scope */}
      <Route element={<ProtectedRoute allowedRoles={["VENDOR"]} />}>
        <Route path="/vendor" element={<DashboardLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="assignments" element={<VendorAssignments />} />
          <Route path="assignments/:id" element={<VendorAssignmentDetail />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>
      </Route>

      {/* Super Admin Scope */}
      <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
        <Route path="/super-admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="societies" element={<Dashboard />} />
          <Route path="users" element={<Dashboard />} />
          <Route path="reports" element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}