import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isGlobalLoading: false,       // full-page loading spinner
  sidebarCollapsed: false,      // sidebar open/closed state
  notifications: [],            // [ { id, message, type, read } ]
  theme: "light",               // 'light' | 'dark'
  language: "en",               // app locale
  toastMessage: null,           // { type: 'success'|'error'|'info', text: '' }
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setGlobalLoading: (state, action) => {
      state.isGlobalLoading = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },

    addNotification: (state, action) => {
      state.notifications.push({ ...action.payload, read: false });
    },

    markNotificationRead: (state, action) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    setTheme: (state, action) => {
      state.theme = action.payload; // 'light' | 'dark'
    },

    setLanguage: (state, action) => {
      state.language = action.payload;
    },

    showToast: (state, action) => {
      state.toastMessage = action.payload; // { type, text }
    },

    clearToast: (state) => {
      state.toastMessage = null;
    },
  },
});

export const {
  setGlobalLoading,
  toggleSidebar,
  setSidebarCollapsed,
  addNotification,
  markNotificationRead,
  clearNotifications,
  setTheme,
  setLanguage,
  showToast,
  clearToast,
} = globalSlice.actions;

export const selectGlobalLoading = (state) => state.global.isGlobalLoading;
export const selectSidebarCollapsed = (state) => state.global.sidebarCollapsed;
export const selectNotifications = (state) => state.global.notifications;
export const selectUnreadCount = (state) =>
  state.global.notifications.filter((n) => !n.read).length;
export const selectTheme = (state) => state.global.theme;
export const selectLanguage = (state) => state.global.language;
export const selectToastMessage = (state) => state.global.toastMessage;

export default globalSlice.reducer;
