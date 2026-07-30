import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD_MAP } from '../context/AuthContext.jsx';

function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-sm text-gray-500 tracking-wide">Verifying session…</p>
    </div>
  );
}

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!allowedRoles.includes(userRole)) {
      const ownDashboard = ROLE_DASHBOARD_MAP[userRole] ?? '/login';
      return <Navigate to={ownDashboard} replace />;
    }
  }

  return <Outlet />;
}
