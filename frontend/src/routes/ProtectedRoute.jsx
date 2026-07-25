/**
 * ProtectedRoute.jsx
 * Route guard for all authenticated pages.
 *
 * Behaviour:
 *  1. While the session check is in-flight (isLoading === true) → show a
 *     full-screen spinner so the user never sees a flash of the login page.
 *  2. Once loaded, if the user is NOT authenticated → redirect to /login.
 *  3. If the user IS authenticated → render the child <Outlet />.
 *
 * Optional prop `allowedRoles`:
 *  Pass an array of role strings to restrict access by role.
 *  If the authenticated user's role is not in the list they are redirected
 *  back to their own dashboard instead of /login.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
 *     <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
 *   </Route>
 */
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD_MAP } from '../context/AuthContext.jsx';

// ---------------------------------------------------------------------------
// Full-screen loading spinner
// ---------------------------------------------------------------------------
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      {/* Spinning ring */}
      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-sm text-gray-500 tracking-wide">Verifying session…</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------
export default function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Session check still in-flight → show spinner (no redirect yet)
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // 2. Not authenticated → send to login, preserve the attempted URL so we
  //    can redirect back after a successful login if needed.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role restriction check (optional)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect the user to their own dashboard — they are authenticated but
      // do not have permission for this specific route.
      const ownDashboard = ROLE_DASHBOARD_MAP[userRole] ?? '/login';
      return <Navigate to={ownDashboard} replace />;
    }
  }

  // 4. Authenticated (and role allowed) → render the nested route
  return <Outlet />;
}
