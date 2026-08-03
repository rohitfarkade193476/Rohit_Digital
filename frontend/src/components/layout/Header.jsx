import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, CheckCheck, Loader2, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../lib/notificationApi.js';
import { formatDateTime } from '../../lib/format.js';

/**
 * Route path to user-friendly page title mapping.
 */
const PAGE_TITLES = {
  // Super Admin
  '/super-admin/dashboard': 'Super Admin Dashboard',
  '/super-admin/societies': 'Societies Management',
  '/super-admin/users': 'Users Directory',
  '/super-admin/reports': 'System Reports',
  '/super-admin/notifications': 'Notifications',
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
  '/society-admin/notifications': 'Notifications',
  '/society-admin/profile': 'Society Admin Profile',

  // Staff
  '/staff/dashboard': 'Staff Dashboard',
  '/staff/assigned-complaints': 'Assigned Complaints',
  '/staff/notifications': 'Notifications',
  '/staff/profile': 'Staff Profile',

  // Resident
  '/resident/dashboard': 'Resident Dashboard',
  '/resident/my-complaints': 'My Complaints',
  '/resident/complaints': 'My Complaints',
  '/resident/complaints/new': 'Raise a Complaint',
  '/resident/notices': 'Community Notices',
  '/resident/payments': 'Maintenance Payments',
  '/resident/notifications': 'Notifications',
  '/resident/profile': 'Resident Profile',

  // Vendor
  '/vendor/dashboard': 'Vendor Dashboard',
  '/vendor/assignments': 'My Assignments',
  '/vendor/assignments/': 'Assignment Details',
  '/vendor/notifications': 'Notifications',
  '/vendor/profile': 'Vendor Profile',

  // Public
  '/register-vendor': 'Vendor Registration',
};

const NOTIFICATION_ROUTE_BY_ROLE = {
  SUPER_ADMIN: '/super-admin/notifications',
  SOCIETY_ADMIN: '/society-admin/notifications',
  STAFF: '/staff/notifications',
  RESIDENT: '/resident/notifications',
  VENDOR: '/vendor/notifications',
};

const NOTIFICATION_TYPE_STYLES = {
  COMPLAINT_ASSIGNED: 'bg-indigo-100 text-indigo-700',
  COMPLAINT_UPDATE: 'bg-blue-100 text-blue-700',
  VENDOR_REGISTERED: 'bg-emerald-100 text-emerald-700',
  DEFAULT: 'bg-slate-100 text-slate-700',
};

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const data = await getNotifications({ page: 1, limit: 5 });
      setNotifications(data.data?.notifications || []);
      setUnread(data.data?.unread || 0);
    } catch {
      setNotifications([]);
      setUnread(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      fetchNotifications();
    }
  }, [dropdownOpen, fetchNotifications]);

  // Resolve dynamic paths (e.g. /vendor/assignments/:id)
  const resolveTitle = (path) => {
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    if (path.startsWith('/vendor/assignments/')) {
      return PAGE_TITLES['/vendor/assignments/'];
    }
    return 'Dashboard';
  };

  const title = resolveTitle(location.pathname);
  const fullName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'User';
  const initial = user?.firstName?.[0]?.toUpperCase() || 'U';

  const handleToggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleMarkAllRead = async () => {
    if (markingAll || unread === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleViewAll = () => {
    setDropdownOpen(false);
    const route = NOTIFICATION_ROUTE_BY_ROLE[user?.role];
    if (route) navigate(route);
  };

  const typeStyle = (type) =>
    NOTIFICATION_TYPE_STYLES[type] || NOTIFICATION_TYPE_STYLES.DEFAULT;

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
        {/* Notification Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleDropdown}
            className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-bold text-slate-800">Notifications</p>
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll || unread === 0}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 cursor-pointer"
                >
                  {markingAll ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Mark all read</span>
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Inbox className="w-8 h-8 mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleMarkRead(notification.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50 ${
                        notification.isRead ? 'bg-white' : 'bg-indigo-50/40'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeStyle(
                          notification.type
                        )}`}
                      >
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 py-1 cursor-pointer"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-sm font-medium transition-all ml-1 cursor-pointer"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
