import React, { createContext, useState, useCallback, useContext } from 'react';

// Create the context
const NotificationContext = createContext();

// Export the hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Export the provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Remove a notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      timestamp: new Date(),
      read: false,
      action: notification.action,
      duration: notification.duration || 5000,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove notification after duration if provided
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }, [removeNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Clear all read notifications
  const clearRead = useCallback(() => {
    setNotifications(prev => prev.filter(notification => !notification.read));
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  // Toggle notification center
  const toggleNotificationCenter = useCallback(() => {
    setShowNotificationCenter(prev => !prev);
  }, []);

  // Predefined notification methods
  const notifySuccess = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyError = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  }, [addNotification]);

  const notifyWarning = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyInfo = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  // System alerts (non-dismissible, important notifications)
  const addSystemAlert = useCallback((alert) => {
    return addNotification({
      type: 'alert',
      title: alert.title,
      message: alert.message,
      duration: 0, // Don't auto-dismiss
      persistent: true,
      priority: 'high',
      ...alert
    });
  }, [addNotification]);

  // Procurement-specific notifications
  const notifyPurchaseOrderCreated = useCallback((poNumber) => {
    return notifySuccess(
      'Purchase Order Created',
      `Purchase order ${poNumber} has been created successfully`,
      {
        action: {
          label: 'View PO',
          onClick: () => console.log(`Navigate to PO ${poNumber}`)
        }
      }
    );
  }, [notifySuccess]);

  const notifyPurchaseOrderApproved = useCallback((poNumber) => {
    return notifySuccess(
      'Purchase Order Approved',
      `Purchase order ${poNumber} has been approved`
    );
  }, [notifySuccess]);

  const notifyPurchaseOrderRejected = useCallback((poNumber, reason) => {
    return notifyWarning(
      'Purchase Order Rejected',
      `Purchase order ${poNumber} has been rejected${reason ? `: ${reason}` : ''}`
    );
  }, [notifyWarning]);

  const notifySupplierApproved = useCallback((supplierName) => {
    return notifySuccess(
      'Supplier Approved',
      `Supplier ${supplierName} has been approved and is now active`
    );
  }, [notifySuccess]);

  const notifyLowStock = useCallback((productName, currentStock) => {
    return notifyWarning(
      'Low Stock Alert',
      `Product "${productName}" is running low. Current stock: ${currentStock}`,
    );
  }, [notifyWarning]);

  const notifyBidSubmitted = useCallback((bidReference) => {
    return notifySuccess(
      'Bid Submitted',
      `Your bid ${bidReference} has been submitted successfully`
    );
  }, [notifySuccess]);

  const notifyBidWon = useCallback((bidReference) => {
    return notifySuccess(
      'Bid Won',
      `Congratulations! Your bid ${bidReference} has been accepted`
    );
  }, [notifySuccess]);

  const value = {
    // State
    notifications,
    unreadCount,
    showNotificationCenter,

    // Basic Actions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearRead,

    // Getters
    getNotificationsByType,
    getUnreadNotifications,

    // UI Controls
    toggleNotificationCenter,
    setShowNotificationCenter,

    // Predefined Notification Types
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    addSystemAlert,

    // Domain-specific Notifications
    notifyPurchaseOrderCreated,
    notifyPurchaseOrderApproved,
    notifyPurchaseOrderRejected,
    notifySupplierApproved,
    notifyLowStock,
    notifyBidSubmitted,
    notifyBidWon
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Export the context for direct access if needed
export { NotificationContext };