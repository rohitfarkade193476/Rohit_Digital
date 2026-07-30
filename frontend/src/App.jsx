import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import RegisterSociety from "./pages/RegisterSociety.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";

// Society Admin Pages
import Dashboard from "./pages/Dashboard";
import FlatManagement from "./pages/FlatManagement.jsx";
import ResidentManagement from "./pages/ResidentManagement.jsx";
import ComplaintManagement from "./pages/ComplaintManagement.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";

export default function App() {
  return (
    <Routes>

      {/* Guest Routes */}
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

          <Route path="dashboard" element={<Dashboard  />} />

          <Route path="flats" element={<FlatManagement />} />

          <Route path="residents" element={<ResidentManagement />} />

          <Route path="staff" element={<StaffManagement />} />

          <Route path="complaints" element={<ComplaintManagement />} />

        </Route>
      </Route>

    </Routes>
  );
}