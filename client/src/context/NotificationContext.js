import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

const NotificationContext = createContext();
const notificationAPI = api.notifications; 
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    email: true,
    push: true,
    sms: false,
    courseUpdates: true,
    newEnrollments: true,
    paymentAlerts: true,
    systemUpdates: true
  }
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        isLoading: false,
        error: null
      };
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      };
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(notification =>
        notification._id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };
    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification._id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await notificationAPI.getNotifications();
      if (response.success) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.notifications });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Create new notification (usually called by system)
  const createNotification = useCallback(async (notificationData) => {
    try {
      const response = await notificationAPI.createNotification(notificationData);
      if (response.success) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: response.notification });
        return { success: true, notification: response.notification };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  // Add notification to local state (for real-time notifications)
  const addNotification = useCallback((notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      if (response.success) {
        dispatch({ type: 'MARK_AS_READ', payload: notificationId });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        dispatch({ type: 'MARK_ALL_AS_READ' });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);
      if (response.success) {
        dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      const response = await notificationAPI.clearAllNotifications();
      if (response.success) {
        dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Fetch notification settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await notificationAPI.getSettings();
      if (response.success) {
        dispatch({ type: 'SET_SETTINGS', payload: response.settings });
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  }, []);

  // Update notification settings
  const updateSettings = useCallback(async (settingsData) => {
    try {
      const response = await notificationAPI.updateSettings(settingsData);
      if (response.success) {
        dispatch({ type: 'SET_SETTINGS', payload: settingsData });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Show toast notification (for UI feedback)
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const toastNotification = {
      _id: Date.now().toString(),
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      isToast: true
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: toastNotification });

    // Auto remove toast after duration
    setTimeout(() => {
      dispatch({ type: 'DELETE_NOTIFICATION', payload: toastNotification._id });
    }, duration);
  }, []);

  // Send push notification (if supported)
  const sendPushNotification = useCallback(async (title, body, data = {}) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          registration.showNotification(title, {
            body,
            icon: '/logo192.png',
            badge: '/logo192.png',
            data,
            actions: [
              {
                action: 'view',
                title: 'View'
              },
              {
                action: 'dismiss',
                title: 'Dismiss'
              }
            ]
          });
        }
      } catch (error) {
        console.error('Push notification failed:', error);
      }
    }
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return state.notifications.filter(notification => notification.type === type);
  }, [state.notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(notification => !notification.read);
  }, [state.notifications]);

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    fetchNotifications,
    createNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchSettings,
    updateSettings,
    showToast,
    sendPushNotification,
    getNotificationsByType,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;