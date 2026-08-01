import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Route path to user-friendly page title mapping.
 */
const PAGE_TITLES = {
  // Super Admin
  '/super-admin/dashboard': 'Super Admin Dashboard',
  '/super-admin/societies': 'Societies Management',
  '/super-admin/users': 'Users Directory',
  '/super-admin/reports': 'System Reports',
  '/super-admin/profile': 'Super Admin Profile',

  // Society Admin
  '/society-admin/dashboard': 'Society Admin Dashboard',
  '/society-admin/flats': 'Flats Management',
  '/society-admin/residents': 'Residents Directory',
  '/society-admin/staff': 'Staff Directory',
  '/society-admin/vendors': 'Vendors Management',
  '/society-admin/complaints': 'Complaints Management',
  '/society-admin/maintenance': 'Maintenance Records',
  '/society-admin/notices': 'Society Notices',
  '/society-admin/profile': 'Society Admin Profile',

  // Staff
  '/staff/dashboard': 'Staff Dashboard',
  '/staff/assigned-complaints': 'Assigned Complaints',
  '/staff/profile': 'Staff Profile',

  // Resident
  '/resident/dashboard': 'Resident Dashboard',
  '/resident/my-complaints': 'My Complaints',
  '/resident/complaints': 'My Complaints',
  '/resident/complaints/new': 'Raise a Complaint',
  '/resident/notices': 'Community Notices',
  '/resident/payments': 'Maintenance Payments',
  '/resident/profile': 'Resident Profile',

  // Vendor
  '/vendor/dashboard': 'Vendor Dashboard',
  '/vendor/assigned-work': 'Assigned Work',
  '/vendor/profile': 'Vendor Profile',
};

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'Dashboard';
  const fullName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'User';
  const initial = user?.firstName?.[0]?.toUpperCase() || 'U';

  return (
    <header className="bg-white border-b border-slate-200/80 shrink-0 z-20 h-16 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left section: Hamburger button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right section: Notifications, User Info & Logout */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Notification Icon */}
        <button
          className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-sm border border-indigo-200 shadow-sm">
            {initial}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {fullName}
            </p>
            <p className="text-[11px] text-slate-500 capitalize">
              {user?.role?.replace('_', ' ').toLowerCase() || 'Member'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-sm font-medium transition-all ml-1"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
