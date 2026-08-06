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
   * Fetch the latest notifications for the Header dropdown.
   * Header only needs the most recent 5.
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
        limit: 5,
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
   */
  const markNotificationRead = useCallback(async (id) => {
    await apiMarkNotificationRead(id);

    setRecentNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Mark all notifications as read.
   */
  const markAllNotificationsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    await apiMarkAllNotificationsRead();

    setRecentNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

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

      return [notification, ...prev].slice(0, 5);
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
