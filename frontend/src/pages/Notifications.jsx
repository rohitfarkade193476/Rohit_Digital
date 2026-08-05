import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  CheckCheck,
  Loader2,
  AlertCircle,
  MailOpen,
} from "lucide-react";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../lib/notificationApi.js";
import { formatDateTime } from "../lib/format.js";
import { useAuth } from "../context/AuthContext.jsx";
import { complaintDeepLinkRoute } from "../lib/routes.js";

const PAGE_SIZE = 10;

const NOTIFICATION_TYPE_STYLES = {
  COMPLAINT_ASSIGNED: "bg-indigo-100 text-indigo-700",
  COMPLAINT_UPDATE: "bg-blue-100 text-blue-700",
  VENDOR_REGISTERED: "bg-emerald-100 text-emerald-700",
  DEFAULT: "bg-slate-100 text-slate-700",
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getNotifications({
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setNotifications(data.data?.notifications || []);
      setTotal(data.data?.total || 0);
      setUnread(data.data?.unread || 0);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    if (markingId) return;
    setMarkingId(id);
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore individual mark failures
    } finally {
      setMarkingId(null);
    }
  };

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

  const handleNotificationClick = async (notification) => {
    console.log("Notification clicked:", notification);
    console.log("Current user role:", user?.role);

    if (!notification?.complaintId) {
      if (!notification.isRead) {
        await handleMarkRead(notification.id);
      }
      return;
    }

    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }

    // Complaint-related notifications deep-link to the exact complaint/work
    // item using the user's existing role route. Notifications without a
    // complaintId simply stay on this page.
    const route = complaintDeepLinkRoute(user?.role, notification.complaintId);
    console.log("Notification deep-link route:", route);
    if (route) navigate(route);
  };

  const typeStyle = (type) =>
    NOTIFICATION_TYPE_STYLES[type] || NOTIFICATION_TYPE_STYLES.DEFAULT;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unread > 0
              ? `${unread} unread notification${unread === 1 ? "" : "s"}`
              : "You are all caught up."}
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={markingAll || unread === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {markingAll ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          <span>Mark All as Read</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <BellRing className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                  notification.isRead ? "bg-white" : "bg-indigo-50/50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeStyle(
                    notification.type,
                  )}`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {notification.title}
                    {!notification.isRead && (
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-600 align-middle" />
                    )}
                  </p>
                  {notification.message && (
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notification.id);
                    }}
                    disabled={markingId === notification.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title="Mark as read"
                  >
                    {markingId === notification.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MailOpen className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Read</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-sm text-slate-600">
          <span>
            Showing{" "}
            {notifications.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(currentPage * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
