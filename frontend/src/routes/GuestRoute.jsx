/**
 * GuestRoute.jsx
 * Inverse of ProtectedRoute — only renders for unauthenticated visitors.
 *
 * Behaviour:
 *  1. While session is loading → show spinner (avoids flash of login page for
 *     users who are already authenticated).
 *  2. If the user IS authenticated → redirect them to their role dashboard.
 *  3. If the user is NOT authenticated → render the child <Outlet />.
 *
 * Use this wrapper around /login and /register-society so that authenticated
 * users who navigate to those public URLs are automatically bounced away.
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD_MAP } from '../context/AuthContext.jsx';

// Full-screen spinner (same visual style as ProtectedRoute)
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-sm text-gray-500 tracking-wide">Loading…</p>
    </div>
  );
}

export default function GuestRoute() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // 1. Still checking session — wait before deciding what to render
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // 2. Already authenticated → bounce to their dashboard
  if (isAuthenticated) {
    const role        = user?.role;
    const destination = ROLE_DASHBOARD_MAP[role] ?? '/';
    return <Navigate to={destination} replace />;
  }

  // 3. Guest — allow access to the public page
  return <Outlet />;
}
