import apiClient from './axios';
import { Notification } from '../types';

export const notificationApi = {
  getAllNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/api/notifications');
    return response.data;
  },

  getByRecipient: async (recipientId: string): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>(`/api/notifications/recipient/${recipientId}`);
    return response.data;
  },

  getUnreadByRecipient: async (recipientId: string): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>(`/api/notifications/recipient/${recipientId}/unread`);
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/api/notifications/${notificationId}`);
  },

  sendDeadlineReminder: async (params: {
    studentId: string;
    studentEmail?: string;
    assignmentTitle: string;
    deadline: string;
  }): Promise<Notification> => {
    const response = await apiClient.post<Notification>(
      '/api/notifications/reminders/send-deadline-reminder',
      null,
      { params }
    );
    return response.data;
  },
};
