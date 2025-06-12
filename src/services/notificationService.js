import { api } from '@/utils/api';
import { createApiService } from './commonService';

const NOTIFICATION_ENDPOINT = '/notifications';

export const notificationServices = createApiService(NOTIFICATION_ENDPOINT, {
  // Custom methods specific to notifications
  getNotifications: async (page = 1, limit = 10, filter = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filter
    }).toString();

    return api.get(`${NOTIFICATION_ENDPOINT}?${queryParams}`);
  },

  markAsRead: async (notificationId) => {
    return api.put(`${NOTIFICATION_ENDPOINT}/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return api.put(`${NOTIFICATION_ENDPOINT}/mark-all-read`);
  },

  getUnreadCount: async () => {
    return api.get(`${NOTIFICATION_ENDPOINT}/unread-count`);
  },

  createNotification: async (data) => {
    return api.post(NOTIFICATION_ENDPOINT, data);
  }
});