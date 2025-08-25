import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isNotificationCenterOpen: false,
  permissionRequested: false,
  permissionGranted: false,
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearOldNotifications: (state) => {
      // Keep only last 50 notifications
      const toRemove = state.notifications.slice(50);
      const unreadToRemove = toRemove.filter(n => !n.read).length;
      state.notifications = state.notifications.slice(0, 50);
      state.unreadCount = Math.max(0, state.unreadCount - unreadToRemove);
    },
    setNotificationCenterOpen: (state, action) => {
      state.isNotificationCenterOpen = action.payload;
    },
    setPermissionRequested: (state, action) => {
      state.permissionRequested = action.payload;
    },
    setPermissionGranted: (state, action) => {
      state.permissionGranted = action.payload;
    },
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  clearOldNotifications, 
  setNotificationCenterOpen,
  setPermissionRequested,
  setPermissionGranted
} = notificationSlice.actions;

export default notificationSlice.reducer;