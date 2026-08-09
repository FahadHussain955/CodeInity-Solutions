import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { notificationsService } from '@/services/settingsService';

const initialState = {
  items: [],
  unreadCount: 0,
  status: 'idle',
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/list',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationsService.list({ limit: 20 });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unread',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationsService.unreadCount();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationsService.markRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.markAllRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await notificationsService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload?.items || [];
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload?.count ?? action.payload?.unreadCount ?? 0;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const wasUnread = state.items.find((n) => n.id === id && !n.isRead);
        state.items = state.items.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        if (wasUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const removed = state.items.find((n) => n.id === id);
        state.items = state.items.filter((n) => n.id !== id);
        if (removed && !removed.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export default notificationsSlice.reducer;
