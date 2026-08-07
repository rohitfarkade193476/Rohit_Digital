import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getNotifications,
  markNotificationRead as apiMarkNotificationRead,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
} from "../lib/notificationApi.js";

import { useAuth } from "./AuthContext.jsx";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [recentNotifications, setRecentNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  /**
   * Fetch the latest unread notifications for the Header dropdown.
   * Read notifications stay in the database but are excluded from the popup.
   */
  const fetchRecentNotifications = useCallback(async () => {
    if (!user) {
      setRecentNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoadingNotifications(true);

      const data = await getNotifications({
        page: 1,
        limit: 100,
        read: false,
      });

      setRecentNotifications(data.data?.notifications || []);
      setUnreadCount(data.data?.unread || 0);
    } catch {
      setRecentNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user]);

  /**
   * Fetch notifications whenever the authenticated user changes.
   */
  useEffect(() => {
    fetchRecentNotifications();
  }, [fetchRecentNotifications]);

  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type !== "NEW_NOTIFICATION") {
        return;
      }

      // A new notification exists on the backend.
      // Refresh the shared notification state.
      fetchRecentNotifications();
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage,
        );
      }
    };
  }, [fetchRecentNotifications]);
  /**
   * Mark one notification as read.
   * The notification stays in the database but is removed from the popup list.
   */
  const markNotificationRead = useCallback(async (id) => {
    await apiMarkNotificationRead(id);

    setRecentNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Mark all notifications as read.
   * Notifications stay in the database but are removed from the popup list.
   */
  const markAllNotificationsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    await apiMarkAllNotificationsRead();

    setRecentNotifications([]);

    setUnreadCount(0);
  }, [unreadCount]);

  /**
   * Add a newly received notification.
   *
   * This will be used when Web Push communicates
   * a new notification to the React application.
   */
  const addNotification = useCallback((notification) => {
    setRecentNotifications((prev) => {
      const exists = prev.some((item) => item.id === notification.id);

      if (exists) {
        return prev;
      }

      return [notification, ...prev].slice(0, 100);
    });

    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const value = {
    recentNotifications,
    unreadCount,
    isLoadingNotifications,

    fetchRecentNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
}
