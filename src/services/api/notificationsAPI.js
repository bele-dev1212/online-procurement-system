// Mock notifications API service
export const notificationsAPI = {
  // Get notifications
  async getNotifications(limit = 50) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'info',
            message: 'System maintenance scheduled for tonight at 10 PM',
            timestamp: new Date().toISOString(),
            read: false,
            data: { category: 'system' }
          },
          {
            id: '2',
            type: 'success',
            message: 'Purchase order PO-001 has been approved',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true,
            data: { poNumber: 'PO-001', category: 'procurement' }
          },
          {
            id: '3',
            type: 'warning',
            message: 'Low stock alert: Product "Laptop Dell XPS"',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false,
            data: { productId: '123', category: 'inventory' }
          }
        ].slice(0, limit));
      }, 500);
    });
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: notificationId });
      }, 300);
    });
  },

  // Mark all notifications as read
  async markAllAsRead() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },

  // Delete notification
  async deleteNotification(notificationId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: notificationId });
      }, 300);
    });
  },

  // Clear all notifications
  async clearAllNotifications() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },

  // Get notification settings
  async getNotificationSettings() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          email: {
            enabled: true,
            orderConfirmation: true,
            shipmentUpdates: true,
            paymentReminders: true,
            lowStockAlerts: true
          },
          push: {
            enabled: false,
            emergencyAlerts: true,
            orderUpdates: true
          },
          sms: {
            enabled: false,
            emergencyAlerts: false
          },
          deliveryMethods: {
            email: true,
            push: false,
            sms: false
          }
        });
      }, 300);
    });
  },

  // Update notification settings
  async updateNotificationSettings(section, settingsData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          section, 
          settings: settingsData 
        });
      }, 300);
    });
  },

  // Test notification
  async testNotification(type, message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          type, 
          message, 
          timestamp: new Date().toISOString() 
        });
      }, 300);
    });
  },

  // Get notification logs
  async getNotificationLogs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          logs: [
            {
              id: 'log-1',
              type: 'email',
              status: 'sent',
              recipient: 'user@example.com',
              subject: 'Order Confirmation',
              timestamp: new Date().toISOString()
            }
          ],
          total: 1
        });
      }, 300);
    });
  },

  // Clear notification logs
  async clearNotificationLogs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },

  // Subscribe to push notifications
  async subscribeToPush() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          subscription: { 
            endpoint: 'https://fcm.googleapis.com/fcm/send/example',
            keys: {
              p256dh: 'example_key',
              auth: 'example_auth'
            }
          } 
        });
      }, 500);
    });
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },

  // Get notification statistics
  async getNotificationStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: 150,
          read: 120,
          unread: 30,
          byType: {
            info: 50,
            success: 40,
            warning: 35,
            error: 25
          },
          deliveryStats: {
            email: { sent: 100, failed: 5 },
            push: { sent: 30, failed: 2 },
            sms: { sent: 20, failed: 1 }
          }
        });
      }, 300);
    });
  }
};