import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    notifications: notificationReducer,
  },
});

export default store;