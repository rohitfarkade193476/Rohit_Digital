import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import RegisterSociety from "./pages/RegisterSociety.jsx";
import ActivateAccount from "./pages/ActivateAccount.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";

// Society Admin Pages
import Dashboard from "./pages/Dashboard";
import FlatManagement from "./pages/FlatManagement.jsx";
import ResidentManagement from "./pages/ResidentManagement.jsx";
import ComplaintManagement from "./pages/ComplaintManagement.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";

// Resident Pages
import ResidentDashboard from "./components/dashboards/ResidentDashboard.jsx";
import ResidentComplaints from "./pages/resident/ResidentComplaints.jsx";
import RaiseComplaint from "./pages/resident/RaiseComplaint.jsx";

export default function App() {
  return (
    <Routes>

      {/* Public route — accessible before login (e.g. from invitation email) */}
      <Route path="/activate-account" element={<ActivateAccount />} />

      {/* Guest Routes — redirect to dashboard if already authenticated */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-society" element={<RegisterSociety />} />
      </Route>

      {/* Society Admin */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["SOCIETY_ADMIN"]} />
        }
      >
        <Route path="/society-admin" element={<DashboardLayout />}>

          <Route path="dashboard" element={<Dashboard />} />

          <Route path="flats" element={<FlatManagement />} />

          <Route path="residents" element={<ResidentManagement />} />

          <Route path="staff" element={<StaffManagement />} />

          <Route path="complaints" element={<ComplaintManagement />} />

        </Route>
      </Route>

      {/* Resident */}
      <Route element={<ProtectedRoute allowedRoles={["RESIDENT"]} />}>
        <Route path="/resident" element={<DashboardLayout />}>

          <Route path="dashboard" element={<ResidentDashboard />} />

          <Route path="complaints" element={<ResidentComplaints />} />

          <Route path="complaints/new" element={<RaiseComplaint />} />

        </Route>
      </Route>

      {/* TEMPORARY — UI preview only */}
<Route path="/resident-dashboard-preview" element={<DashboardLayout />}>
  <Route index element={<ResidentDashboard />} />
</Route>


<Route path="/resident-complaints-preview" element={<DashboardLayout />}>
  <Route index element={<ResidentComplaints />} />
</Route>

<Route path="/raise-complaint-preview" element={<DashboardLayout />}>
  <Route index element={<RaiseComplaint />} />
</Route>

    </Routes>
  );
}