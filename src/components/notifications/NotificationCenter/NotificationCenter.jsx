import React, { useState, useEffect, useRef } from 'react';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Mock data - replace with actual API calls
  const mockNotifications = [
    {
      id: 1,
      type: 'purchase_order',
      title: 'Purchase Order Approved',
      message: 'PO #PO-2024-001 has been approved and sent to supplier.',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      read: false,
      priority: 'high',
      action: {
        type: 'view_po',
        label: 'View PO',
        data: { poId: 'PO-2024-001' }
      }
    },
    {
      id: 2,
      type: 'stock_alert',
      title: 'Low Stock Alert',
      message: 'Laptop Dell XPS 13 is running low. Current stock: 2 units.',
      timestamp: new Date('2024-01-15T10:15:00Z'),
      read: false,
      priority: 'critical',
      action: {
        type: 'create_po',
        label: 'Create PO',
        data: { productId: 'PROD-001', productName: 'Laptop Dell XPS 13' }
      }
    },
    {
      id: 3,
      type: 'supplier',
      title: 'New Supplier Registered',
      message: 'TechCorp Inc. has completed registration and is now active.',
      timestamp: new Date('2024-01-14T16:45:00Z'),
      read: true,
      priority: 'medium',
      action: {
        type: 'view_supplier',
        label: 'View Supplier',
        data: { supplierId: 'SUPP-005' }
      }
    },
    {
      id: 4,
      type: 'bidding',
      title: 'Bid Submission Reminder',
      message: 'RFQ #RFQ-2024-003 closes in 24 hours. 3 bids received so far.',
      timestamp: new Date('2024-01-14T09:20:00Z'),
      read: true,
      priority: 'medium',
      action: {
        type: 'view_rfq',
        label: 'View RFQ',
        data: { rfqId: 'RFQ-2024-003' }
      }
    },
    {
      id: 5,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Saturday, Jan 20th from 2:00 AM to 4:00 AM.',
      timestamp: new Date('2024-01-13T18:00:00Z'),
      read: true,
      priority: 'low'
    },
    {
      id: 6,
      type: 'approval',
      title: 'Approval Required',
      message: 'Requisition #REQ-2024-045 requires your approval.',
      timestamp: new Date('2024-01-13T14:15:00Z'),
      read: false,
      priority: 'high',
      action: {
        type: 'review_requisition',
        label: 'Review',
        data: { requisitionId: 'REQ-2024-045' }
      }
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch notifications
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In real implementation:
        // const response = await notificationsAPI.getNotifications();
        // setNotifications(response.data);
        
        setTimeout(() => {
          setNotifications(mockNotifications);
          updateUnreadCount(mockNotifications);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateUnreadCount = (notifs) => {
    const unread = notifs.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'purchase_order':
        return '📋';
      case 'stock_alert':
        return '⚠️';
      case 'supplier':
        return '🏢';
      case 'bidding':
        return '💰';
      case 'system':
        return '⚙️';
      case 'approval':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    updateUnreadCount(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const handleActionClick = (action, notificationId, event) => {
    event.stopPropagation();
    
    // Mark as read when action is taken
    handleNotificationClick(notificationId);

    // Handle different action types
    switch (action.type) {
      case 'view_po':
        console.log('Navigating to PO:', action.data.poId);
        // navigate(`/procurement/purchase-orders/${action.data.poId}`);
        break;
      case 'create_po':
        console.log('Creating PO for product:', action.data.productName);
        // navigate('/procurement/create-purchase-order', { state: { product: action.data } });
        break;
      case 'view_supplier':
        console.log('Viewing supplier:', action.data.supplierId);
        // navigate(`/suppliers/${action.data.supplierId}`);
        break;
      case 'view_rfq':
        console.log('Viewing RFQ:', action.data.rfqId);
        // navigate(`/procurement/rfq/${action.data.rfqId}`);
        break;
      case 'review_requisition':
        console.log('Reviewing requisition:', action.data.requisitionId);
        // navigate(`/procurement/requisitions/${action.data.requisitionId}`);
        break;
      default:
        console.log('Action:', action);
    }

    setIsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId, event) => {
    event.stopPropagation();
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    updateUnreadCount(notifications.filter(notif => notif.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    return notification.type === activeFilter;
  });

  const notificationTypes = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'purchase_order', label: 'Purchase Orders', count: notifications.filter(n => n.type === 'purchase_order').length },
    { key: 'stock_alert', label: 'Stock Alerts', count: notifications.filter(n => n.type === 'stock_alert').length },
    { key: 'bidding', label: 'Bidding', count: notifications.filter(n => n.type === 'bidding').length },
    { key: 'approval', label: 'Approvals', count: notifications.filter(n => n.type === 'approval').length }
  ];

  return (
    <div className="notification-center" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <div 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button 
                  className="btn-mark-all-read"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  className="btn-clear-all"
                  onClick={clearAllNotifications}
                  title="Clear all notifications"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notification Filters */}
          <div className="notification-filters">
            {notificationTypes.map(type => (
              <button
                key={type.key}
                className={`filter-btn ${activeFilter === type.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(type.key)}
              >
                {type.label}
                {type.count > 0 && (
                  <span className="filter-count">{type.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>No notifications</h4>
                <p>You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    {notification.action && (
                      <div className="notification-actions">
                        <button
                          className="btn-action"
                          onClick={(e) => handleActionClick(notification.action, notification.id, e)}
                        >
                          {notification.action.label}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="notification-controls">
                    {!notification.read && (
                      <div className="unread-indicator"></div>
                    )}
                    <button
                      className="btn-delete"
                      onClick={(e) => deleteNotification(notification.id, e)}
                      title="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="btn-view-all"
                onClick={() => {
                  // Navigate to full notifications page
                  console.log('Navigate to notifications page');
                  setIsOpen(false);
                }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;