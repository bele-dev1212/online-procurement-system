import { useState, useContext, useCallback, useEffect } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { notificationsAPI } from '../services/api/notificationsAPI';

export const useNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { 
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    notificationSettings,
    setNotificationSettings
  } = useContext(NotificationContext);

  // Real-time notifications setup
  useEffect(() => {
    const setupRealTimeNotifications = async () => {
      // This would set up WebSocket or SSE connection for real-time notifications
      // For now, we'll use polling or leave it to the parent component
    };

    setupRealTimeNotifications();

    return () => {
      // Cleanup real-time connection
    };
  }, []);

 const addNotification = useCallback((...args) => {
  // Handle both formats: object or separate parameters
  let message, type = 'info', data = null;
  
  if (typeof args[0] === 'object') {
    // Object format: { message, type, title, data }
    const notificationData = args[0];
    message = notificationData.message || notificationData.title;
    type = notificationData.type || 'info';
    data = notificationData.data || null;
  } else {
    // Separate parameters format: (message, type, data)
    message = args[0];
    type = args[1] || 'info';
    data = args[2] || null;
  }

  const newNotification = {
    id: Date.now().toString(),
    message,
    type,
    data,
    timestamp: new Date().toISOString(),
    read: false
  };

  setNotifications(prev => [newNotification, ...prev]);
  setUnreadCount(prev => prev + 1);

  // Show browser notification if permitted and settings allow
  if (Notification.permission === 'granted' && notificationSettings?.deliveryMethods?.push) {
    new Notification('Procurement System', {
      body: message,
      icon: '/favicon.ico'
    });
  }
}, [setNotifications, setUnreadCount, notificationSettings]);

  const fetchNotifications = useCallback(async (limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const notificationsData = await notificationsAPI.getNotifications(limit);
      setNotifications(notificationsData);
      
      // Calculate unread count
      const unread = notificationsData.filter(notification => !notification.read).length;
      setUnreadCount(unread);
      
      return notificationsData;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load notifications.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setNotifications, setUnreadCount]);

  const markAsRead = async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => prev.map(notification =>
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark notification as read.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    setError(null);
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        read: true
      })));
      setUnreadCount(0);
      addNotification('All notifications marked as read.', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark all notifications as read.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      await notificationsAPI.deleteNotification(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete notification.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      await notificationsAPI.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      addNotification('All notifications cleared.', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear notifications.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await notificationsAPI.getNotificationSettings();
      setNotificationSettings(settings);
      return settings;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load notification settings.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setNotificationSettings]);

  const updateNotificationSettings = async (section, settingsData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSettings = await notificationsAPI.updateNotificationSettings(section, settingsData);
      setNotificationSettings(prev => ({
        ...prev,
        [section]: settingsData
      }));
      addNotification('Notification settings updated successfully!', 'success');
      return updatedSettings;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update notification settings.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async (type, message) => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsAPI.testNotification(type, message);
      addNotification('Test notification sent successfully!', 'success');
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to send test notification.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNotificationLogs = async (limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const logs = await notificationsAPI.getNotificationLogs(limit);
      return logs;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load notification logs.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearNotificationLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      await notificationsAPI.clearNotificationLogs();
      addNotification('Notification logs cleared successfully!', 'success');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear notification logs.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      addNotification('Browser does not support notifications.', 'warning');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      addNotification('Notification permission denied. Please enable it in browser settings.', 'error');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      addNotification('Push notifications enabled!', 'success');
      return true;
    } else {
      addNotification('Push notification permission denied.', 'warning');
      return false;
    }
  };

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      const subscription = await notificationsAPI.subscribeToPush();
      addNotification('Push notifications subscribed successfully!', 'success');
      return subscription;
    } catch (err) {
      const errorMessage = err.message || 'Failed to subscribe to push notifications.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      await notificationsAPI.unsubscribeFromPush();
      addNotification('Push notifications unsubscribed.', 'info');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to unsubscribe from push notifications.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNotificationStats = useCallback(async () => {
    try {
      const stats = await notificationsAPI.getNotificationStats();
      return stats;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load notification statistics.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const filterNotifications = useCallback((filters = {}) => {
    let filtered = [...notifications];

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === filters.type);
    }

    if (filters.read !== undefined) {
      filtered = filtered.filter(notification => notification.read === filters.read);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.timestamp);
        return notificationDate >= new Date(filters.startDate) && 
               notificationDate <= new Date(filters.endDate);
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.message.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [notifications]);

  return {
    // State
    loading,
    error,
    notifications,
    unreadCount,
    notificationSettings,

    // Notification actions
    addNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,

    // Settings
    fetchNotificationSettings,
    updateNotificationSettings,

    // Testing & Logs
    testNotification,
    getNotificationLogs,
    clearNotificationLogs,

    // Push Notifications
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,

    // Data & Analytics
    getNotificationStats,
    filterNotifications,

    // Utility
    clearError: () => setError(null)
  };
};