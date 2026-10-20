import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { info } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const data = await notificationApi.getByRecipient(user.userId);
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
      setUnreadCount(sorted.filter((n) => !n.read).length);
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.userId]);

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for live updates
    const interval = setInterval(() => {
      if (isAuthenticated && user?.userId) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated, user?.userId]);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadList = notifications.filter((n) => !n.read);
      await Promise.all(unreadList.map((n) => notificationApi.markAsRead(n.notificationId)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      info('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => {
        const item = prev.find((n) => n.notificationId === id);
        if (item && !item.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.notificationId !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
