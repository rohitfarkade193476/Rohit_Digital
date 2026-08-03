import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileBarChart,
  Home,
  UserCheck,
  UserCog,
  Briefcase,
  AlertCircle,
  Wrench,
  Bell,
  BellRing,
  User,
  ClipboardList,
  CreditCard,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Menu configuration keyed by user role.
 */
const ROLE_MENUS = {
  SUPER_ADMIN: [
    {
      label: "Dashboard",
      path: "/super-admin/dashboard",
      icon: LayoutDashboard,
    },
    { label: "Societies", path: "/super-admin/societies", icon: Building2 },
    { label: "Users", path: "/super-admin/users", icon: Users },
    { label: "Reports", path: "/super-admin/reports", icon: FileBarChart },
    {
      label: "Notifications",
      path: "/super-admin/notifications",
      icon: BellRing,
    },
    { label: "Profile", path: "/super-admin/profile", icon: User },
  ],
  SOCIETY_ADMIN: [
    {
      label: "Dashboard",
      path: "/society-admin/dashboard",
      icon: LayoutDashboard,
    },
    { label: "Flats", path: "/society-admin/flats", icon: Home },
    { label: "Residents", path: "/society-admin/residents", icon: UserCheck },
    { label: "Staff", path: "/society-admin/staff", icon: UserCog },
    { label: "Vendors", path: "/society-admin/vendors", icon: Briefcase },
    {
      label: "Complaints",
      path: "/society-admin/complaints",
      icon: AlertCircle,
    },
    { label: "Maintenance", path: "/society-admin/maintenance", icon: Wrench },
    { label: "Notices", path: "/society-admin/notices", icon: Bell },
    {
      label: "Notifications",
      path: "/society-admin/notifications",
      icon: BellRing,
    },
    { label: "Profile", path: "/society-admin/profile", icon: User },
  ],
  STAFF: [
    { label: "Dashboard", path: "/staff/dashboard", icon: LayoutDashboard },
    {
      label: "Assigned Complaints",
      path: "/staff/assigned-complaints",
      icon: ClipboardList,
    },
    {
      label: "Notifications",
      path: "/staff/notifications",
      icon: BellRing,
    },
    { label: "Profile", path: "/staff/profile", icon: User },
  ],
  RESIDENT: [
    { label: "Dashboard", path: "/resident/dashboard", icon: LayoutDashboard },
    { label: "My Complaints", path: "/resident/complaints", icon: AlertCircle },
    { label: "Notices", path: "/resident/notices", icon: Bell },
    { label: "Payments", path: "/resident/payments", icon: CreditCard },
    {
      label: "Notifications",
      path: "/resident/notifications",
      icon: BellRing,
    },
    { label: "Profile", path: "/resident/profile", icon: User },
  ],
  VENDOR: [
    { label: "Dashboard", path: "/vendor/dashboard", icon: LayoutDashboard },
    { label: "Assignments", path: "/vendor/assignments", icon: Briefcase },
    {
      label: "Notifications",
      path: "/vendor/notifications",
      icon: BellRing,
    },
    { label: "Profile", path: "/vendor/profile", icon: User },
  ],
};

const ROLE_BADGES = {
  SUPER_ADMIN: "Super Admin",
  SOCIETY_ADMIN: "Society Admin",
  STAFF: "Staff Member",
  RESIDENT: "Resident",
  VENDOR: "Vendor",
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const userRole = user?.role || "RESIDENT";
  const menuItems = ROLE_MENUS[userRole] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 shrink-0 px-6 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-white tracking-wide text-base block leading-tight truncate">
                Housing Portal
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider truncate block">
                {ROLE_BADGES[userRole] || userRole}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto min-h-0">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Navigation Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info inside sidebar */}
        <div className="shrink-0 p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
              {user?.firstName?.[0] || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.firstName
                  ? `${user.firstName} ${user?.lastName || ""}`
                  : "User Account"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || "user@society.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
