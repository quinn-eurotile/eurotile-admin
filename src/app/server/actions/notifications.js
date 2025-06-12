'use server';

import { notificationServices } from '@/services/notificationService';

export async function getNotifications({ page, limit, filter }) {
  try {
    const response = await notificationServices.getNotifications(page, limit, filter);
    // Ensure we're returning the expected structure
    return {
      notifications: response.data.data || [], // Handle the case where data might be null
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.page || page,
      total: response.data.total || 0
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return a safe default value
    return {
      notifications: [],
      totalPages: 1,
      currentPage: page,
      total: 0
    };
  }
}

export async function createNotification(data) {
  try {
    const response = await notificationServices.createNotification(data);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

export async function markNotificationAsRead(id) {
  try {
    const response = await notificationServices.markAsRead(id);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const response = await notificationServices.markAllAsRead();
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
}

export async function getUnreadNotificationCount() {
  try {
    const response = await notificationServices.getUnreadCount();
    return {
      count: response.data.count || 0
    };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { count: 0 };
  }
}
