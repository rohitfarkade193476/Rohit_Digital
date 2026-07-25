import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth, ROLE_DASHBOARD_MAP } from './context/AuthContext.jsx';
import ProtectedRoute  from './routes/ProtectedRoute.jsx';
import GuestRoute      from './routes/GuestRoute.jsx';
import Login           from './pages/Login.jsx';
import RegisterSociety from './pages/RegisterSociety.jsx';

/**
 * App.jsx
 * Root component — defines all top-level routes.
 *
 * Route architecture:
 *
 *  <GuestRoute>          — Only unauthenticated users (auto-redirect authenticated
 *                          users to their role dashboard).
 *    /                   → Login
 *    /login              → Login
 *    /register-society   → RegisterSociety
 *
 *  <ProtectedRoute>      — Only authenticated users (redirect guests to /login).
 *    /super-admin/dashboard
 *    /society-admin/dashboard
 *    /staff/dashboard
 *    /resident/dashboard
 *    /vendor/dashboard
 *
 * NOTE: <AuthProvider> is placed INSIDE <BrowserRouter> so it can use
 *       useNavigate() internally.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public routes (unauthenticated only) ──────────────────── */}
          <Route element={<GuestRoute />}>
            <Route path="/"                 element={<Login />} />
            <Route path="/login"            element={<Login />} />
            <Route path="/register-society" element={<RegisterSociety />} />
          </Route>

          {/* ── Protected: SUPER_ADMIN ─────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route
              path="/super-admin/dashboard"
              element={<PlaceholderDashboard title="Super Admin Dashboard" />}
            />
          </Route>

          {/* ── Protected: SOCIETY_ADMIN ───────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['SOCIETY_ADMIN']} />}>
            <Route
              path="/society-admin/dashboard"
              element={<PlaceholderDashboard title="Society Admin Dashboard" />}
            />
          </Route>

          {/* ── Protected: STAFF ───────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
            <Route
              path="/staff/dashboard"
              element={<PlaceholderDashboard title="Staff Dashboard" />}
            />
          </Route>

          {/* ── Protected: RESIDENT ────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['RESIDENT']} />}>
            <Route
              path="/resident/dashboard"
              element={<PlaceholderDashboard title="Resident Dashboard" />}
            />
          </Route>

          {/* ── Protected: VENDOR ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['VENDOR']} />}>
            <Route
              path="/vendor/dashboard"
              element={<PlaceholderDashboard title="Vendor Dashboard" />}
            />
          </Route>

          {/* ── Catch-all ──────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// ---------------------------------------------------------------------------
// PlaceholderDashboard
// A minimal stub that confirms auth works until real dashboard pages are built.
// Replace each Route's `element` with the real dashboard component later.
// ---------------------------------------------------------------------------
function PlaceholderDashboard({ title }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 w-full max-w-md text-center space-y-4">
        <div className="text-4xl">🏠</div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">
          Logged in as{' '}
          <span className="font-medium text-gray-700">
            {user?.firstName} {user?.lastName}
          </span>{' '}
          <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
            {user?.role}
          </span>
        </p>
        <p className="text-xs text-gray-400">
          This is a placeholder. Replace with the real dashboard page.
        </p>
        <button
          onClick={logout}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
