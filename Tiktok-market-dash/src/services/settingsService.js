import { axiosPrivate } from '@/lib/axios';
import { getApiErrorMessage, unwrapApiData } from '@/utils/apiHelpers';

export const settingsService = {
  async get() {
    try {
      const response = await axiosPrivate.get('/settings');
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load settings.'));
    }
  },

  async updateStore(payload) {
    try {
      const response = await axiosPrivate.patch('/settings/store', payload);
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to save store settings.'));
    }
  },

  async updateNotifications(payload) {
    try {
      const response = await axiosPrivate.patch('/settings/notifications', payload);
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to save notification preferences.'));
    }
  },

  async updateInventory(payload) {
    try {
      const response = await axiosPrivate.patch('/settings/inventory', payload);
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to save inventory settings.'));
    }
  },

  async billing() {
    try {
      const response = await axiosPrivate.get('/settings/billing');
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load billing.'));
    }
  },

  async security() {
    try {
      const response = await axiosPrivate.get('/settings/security');
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load security info.'));
    }
  },
};

export const notificationsService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/notifications', { params });
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load notifications.'));
    }
  },

  async unreadCount() {
    try {
      const response = await axiosPrivate.get('/notifications/unread-count');
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load unread count.'));
    }
  },

  async markRead(id) {
    try {
      const response = await axiosPrivate.patch(`/notifications/${id}/read`);
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to mark as read.'));
    }
  },

  async markAllRead() {
    try {
      const response = await axiosPrivate.post('/notifications/read-all');
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to mark all as read.'));
    }
  },

  async remove(id) {
    try {
      const response = await axiosPrivate.delete(`/notifications/${id}`);
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to delete notification.'));
    }
  },
};

export const activityService = {
  async list(params = {}) {
    try {
      const response = await axiosPrivate.get('/activity', { params });
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load activity.'));
    }
  },
};

export const uploadsService = {
  async uploadAvatar(file) {
    try {
      const form = new FormData();
      form.append('avatar', file);
      const response = await axiosPrivate.post('/uploads/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to upload avatar.'));
    }
  },

  async deleteAvatar() {
    try {
      const response = await axiosPrivate.delete('/uploads/avatar');
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to remove avatar.'));
    }
  },

  async uploadImage(file, folder = 'products') {
    try {
      const form = new FormData();
      form.append('image', file);
      const response = await axiosPrivate.post('/uploads/image', form, {
        params: { folder },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrapApiData(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to upload image.'));
    }
  },
};
