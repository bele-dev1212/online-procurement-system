import React, { useState, useEffect } from 'react';
import './RecentActivity.css';

const RecentActivity = ({
  maxItems = 10,
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 30000,
  onActivityClick,
  className = '',
  showViewAll = true
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Activity types with icons and colors
  const activityTypes = {
    purchase_order: { label: 'Purchase Order', icon: '📋', color: 'blue' },
    rfq: { label: 'RFQ', icon: '📝', color: 'green' },
    supplier: { label: 'Supplier', icon: '👥', color: 'purple' },
    bid: { label: 'Bid', icon: '🏷️', color: 'orange' },
    approval: { label: 'Approval', icon: '✅', color: 'teal' },
    payment: { label: 'Payment', icon: '💰', color: 'indigo' },
    inventory: { label: 'Inventory', icon: '📦', color: 'cyan' },
    system: { label: 'System', icon: '⚙️', color: 'gray' }
  };

  // Priority levels
  const priorityLevels = {
    low: { label: 'Low', color: 'gray' },
    medium: { label: 'Medium', color: 'blue' },
    high: { label: 'High', color: 'orange' },
    critical: { label: 'Critical', color: 'red' }
  };

  // Mock data generator
  const generateMockActivities = (count = 10) => {
    const users = [
      'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 
      'David Wilson', 'Lisa Brown', 'Robert Taylor', 'Maria Garcia'
    ];
    
    const departments = ['Procurement', 'Finance', 'IT', 'Operations', 'HR'];
    const statuses = ['completed', 'pending', 'in_progress', 'cancelled', 'approved', 'rejected'];
    
    const mockActivities = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const typeKeys = Object.keys(activityTypes);
      const typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
      
      const priorityKeys = Object.keys(priorityLevels);
      const priorityKey = priorityKeys[Math.floor(Math.random() * priorityKeys.length)];
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      
      // Random time between now and 7 days ago
      const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      mockActivities.push({
        id: `activity-${i}`,
        type: typeKey,
        title: generateActivityTitle(typeKey, status),
        description: generateActivityDescription(typeKey, user, department),
        user,
        department,
        timestamp,
        status,
        priority: priorityKey,
        metadata: generateActivityMetadata(typeKey),
        isRead: Math.random() > 0.7,
        requiresAction: Math.random() > 0.6 && status === 'pending'
      });
    }
    
    return mockActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const generateActivityTitle = (type, status) => {
    const titles = {
      purchase_order: {
        completed: 'Purchase Order Completed',
        pending: 'Purchase Order Requires Approval',
        in_progress: 'Purchase Order in Process',
        approved: 'Purchase Order Approved',
        rejected: 'Purchase Order Rejected'
      },
      rfq: {
        completed: 'RFQ Sent to Suppliers',
        pending: 'New RFQ Created',
        in_progress: 'RFQ Responses Received',
        approved: 'RFQ Awarded'
      },
      supplier: {
        completed: 'Supplier Profile Updated',
        pending: 'New Supplier Registration',
        in_progress: 'Supplier Evaluation in Progress',
        approved: 'Supplier Approved'
      },
      bid: {
        completed: 'Bid Submitted',
        pending: 'New Bid Received',
        in_progress: 'Bid Under Review',
        approved: 'Bid Accepted'
      },
      approval: {
        completed: 'Approval Process Completed',
        pending: 'Approval Required',
        in_progress: 'Approval in Progress'
      },
      payment: {
        completed: 'Payment Processed',
        pending: 'Payment Awaiting Approval',
        in_progress: 'Payment in Process'
      },
      inventory: {
        completed: 'Inventory Updated',
        pending: 'Low Stock Alert',
        in_progress: 'Stock Count in Progress'
      },
      system: {
        completed: 'System Update Completed',
        pending: 'System Maintenance Scheduled',
        in_progress: 'System Backup in Progress'
      }
    };
    
    return titles[type]?.[status] || `${activityTypes[type]?.label} ${status}`;
  };

  const generateActivityDescription = (type, user, department) => {
    const descriptions = {
      purchase_order: `${user} from ${department} department`,
      rfq: `Managed by ${user} for ${department}`,
      supplier: `Registered by ${user}`,
      bid: `Submitted to ${department} RFQ`,
      approval: `Initiated by ${user}`,
      payment: `Processed for ${department}`,
      inventory: `Updated by ${user}`,
      system: `Automated system activity`
    };
    
    return descriptions[type] || `Activity by ${user}`;
  };

  const generateActivityMetadata = (type) => {
    const metadata = {
      purchase_order: {
        poNumber: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: `$${(Math.random() * 10000).toFixed(2)}`,
        supplier: `Supplier-${Math.floor(100 + Math.random() * 900)}`
      },
      rfq: {
        rfqNumber: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        responses: Math.floor(1 + Math.random() * 10)
      },
      supplier: {
        supplierName: `Supplier Corp ${Math.floor(100 + Math.random() * 900)}`,
        category: ['Electronics', 'Office Supplies', 'Services', 'Raw Materials'][Math.floor(Math.random() * 4)],
        rating: (3 + Math.random() * 2).toFixed(1)
      },
      bid: {
        bidAmount: `$${(Math.random() * 5000).toFixed(2)}`,
        supplier: `Supplier-${Math.floor(100 + Math.random() * 900)}`,
        deliveryDays: Math.floor(1 + Math.random() * 30)
      },
      approval: {
        documentType: ['PO', 'RFQ', 'Contract', 'Payment'][Math.floor(Math.random() * 4)],
        documentId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        approver: `Approver-${Math.floor(1 + Math.random() * 5)}`
      },
      payment: {
        invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: `$${(Math.random() * 5000).toFixed(2)}`,
        method: ['Wire Transfer', 'Check', 'Credit Card'][Math.floor(Math.random() * 3)]
      },
      inventory: {
        product: `Product-${Math.floor(1000 + Math.random() * 9000)}`,
        quantity: Math.floor(1 + Math.random() * 100),
        location: ['Warehouse A', 'Warehouse B', 'Main Store'][Math.floor(Math.random() * 3)]
      },
      system: {
        component: ['Database', 'API', 'UI', 'Backup'][Math.floor(Math.random() * 4)],
        duration: `${Math.floor(1 + Math.random() * 60)} minutes`,
        status: 'Completed'
      }
    };
    
    return metadata[type] || {};
  };

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockActivities = generateMockActivities(15);
        resolve({
          activities: mockActivities,
          lastUpdated: new Date()
        });
      }, 800);
    });
  };

  useEffect(() => {
    const loadActivities = async () => {
      const data = await fetchActivities();
      setActivities(data.activities);
      setLastUpdated(data.lastUpdated);
      setLoading(false);
    };

    loadActivities();

    // Set up auto-refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadActivities, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = async () => {
    const data = await fetchActivities();
    setActivities(data.activities);
    setLastUpdated(data.lastUpdated);
  };

  const handleActivityClick = (activity) => {
    // Mark as read
    setActivities(prev => 
      prev.map(a => 
        a.id === activity.id ? { ...a, isRead: true } : a
      )
    );
    
    onActivityClick?.(activity);
  };

  const handleMarkAllAsRead = () => {
    setActivities(prev => 
      prev.map(activity => ({ ...activity, isRead: true }))
    );
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Filter activities based on current filter
  const filteredActivities = activities
    .filter(activity => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !activity.isRead;
      if (filter === 'action_required') return activity.requiresAction;
      return activity.type === filter;
    })
    .slice(0, maxItems);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      completed: 'green',
      pending: 'orange',
      in_progress: 'blue',
      approved: 'teal',
      rejected: 'red',
      cancelled: 'gray'
    };
    
    return statusColors[status] || 'gray';
  };

  const getUnreadCount = () => {
    return activities.filter(activity => !activity.isRead).length;
  };

  const getActionRequiredCount = () => {
    return activities.filter(activity => activity.requiresAction).length;
  };

  return (
    <div className={`recent-activity ${className}`}>
      {/* Header */}
      <div className="activity-header">
        <div className="header-left">
          <h2 className="activity-title">Recent Activity</h2>
          <div className="activity-subtitle">
            {getUnreadCount() > 0 && (
              <span className="unread-count">{getUnreadCount()} unread</span>
            )}
            {getActionRequiredCount() > 0 && (
              <span className="action-count">{getActionRequiredCount()} require action</span>
            )}
            <span className="last-updated">
              Updated {getTimeAgo(lastUpdated)}
            </span>
          </div>
        </div>
        
        <div className="header-controls">
          <button
            className={`refresh-button ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh activities"
          >
            {loading ? '🔄' : '🔄'}
          </button>
          
          {getUnreadCount() > 0 && (
            <button
              className="mark-read-button"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="activity-filters">
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => handleFilterChange('unread')}
            >
              Unread
            </button>
            <button
              className={`filter-button ${filter === 'action_required' ? 'active' : ''}`}
              onClick={() => handleFilterChange('action_required')}
            >
              Action Required
            </button>
            
            {/* Type filters */}
            {Object.entries(activityTypes).map(([key, type]) => (
              <button
                key={key}
                className={`filter-button ${filter === key ? 'active' : ''}`}
                onClick={() => handleFilterChange(key)}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="activity-list">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="activity-item-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-content">
                <div className="skeleton-line large"></div>
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line small"></div>
              </div>
            </div>
          ))
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`activity-item ${!activity.isRead ? 'unread' : ''} ${
                activity.requiresAction ? 'action-required' : ''
              }`}
              onClick={() => handleActivityClick(activity)}
            >
              {/* Activity Icon */}
              <div className={`activity-icon activity-${activity.type}`}>
                {activityTypes[activity.type]?.icon}
              </div>

              {/* Activity Content */}
              <div className="activity-content">
                <div className="activity-header-row">
                  <h3 className="activity-item-title">{activity.title}</h3>
                  <span className="activity-time">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>
                
                <p className="activity-description">
                  {activity.description}
                </p>
                
                {/* Activity Metadata */}
                <div className="activity-metadata">
                  <span className={`activity-status status-${getStatusColor(activity.status)}`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                  
                  <span className={`activity-priority priority-${activity.priority}`}>
                    {priorityLevels[activity.priority]?.label}
                  </span>
                  
                  {activity.metadata && Object.entries(activity.metadata).map(([key, value]) => (
                    <span key={key} className="activity-meta">
                      {key}: {value instanceof Date ? value.toLocaleDateString() : value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Activity Actions */}
              <div className="activity-actions">
                {!activity.isRead && (
                  <div className="unread-indicator"></div>
                )}
                
                {activity.requiresAction && (
                  <div className="action-required-indicator" title="Action required">
                    ⚡
                  </div>
                )}
                
                <button className="activity-more" title="More actions">
                  ⋮
                </button>
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3 className="empty-title">No activities found</h3>
            <p className="empty-description">
              {filter === 'all' 
                ? 'No recent activities to display'
                : `No ${filter.replace('_', ' ')} activities found`
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="activity-footer">
        {showViewAll && (
          <button className="view-all-button">
            View All Activities →
          </button>
        )}
        
        <div className="activity-stats">
          <span className="stat">
            Total: {activities.length}
          </span>
          <span className="stat">
            Unread: {getUnreadCount()}
          </span>
          <span className="stat">
            Actions: {getActionRequiredCount()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Individual Activity Item Component for reuse
export const ActivityItem = ({
  type,
  title,
  description,
  user,
  timestamp,
  status,
  priority = 'medium',
  metadata = {},
  isRead = true,
  requiresAction = false,
  onClick,
  className = ''
}) => {
  const activityTypes = {
    purchase_order: { icon: '📋', color: 'blue' },
    rfq: { icon: '📝', color: 'green' },
    supplier: { icon: '👥', color: 'purple' },
    bid: { icon: '🏷️', color: 'orange' },
    approval: { icon: '✅', color: 'teal' },
    payment: { icon: '💰', color: 'indigo' },
    inventory: { icon: '📦', color: 'cyan' },
    system: { icon: '⚙️', color: 'gray' }
  };

  const priorityLevels = {
    low: { label: 'Low', color: 'gray' },
    medium: { label: 'Medium', color: 'blue' },
    high: { label: 'High', color: 'orange' },
    critical: { label: 'Critical', color: 'red' }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      completed: 'green',
      pending: 'orange',
      in_progress: 'blue',
      approved: 'teal',
      rejected: 'red',
      cancelled: 'gray'
    };
    
    return statusColors[status] || 'gray';
  };

  return (
    <div
      className={`activity-item ${!isRead ? 'unread' : ''} ${
        requiresAction ? 'action-required' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className={`activity-icon activity-${type}`}>
        {activityTypes[type]?.icon}
      </div>

      <div className="activity-content">
        <div className="activity-header-row">
          <h3 className="activity-item-title">{title}</h3>
          <span className="activity-time">
            {getTimeAgo(timestamp)}
          </span>
        </div>
        
        <p className="activity-description">
          {description || `Activity by ${user}`}
        </p>
        
        <div className="activity-metadata">
          <span className={`activity-status status-${getStatusColor(status)}`}>
            {status.replace('_', ' ')}
          </span>
          
          <span className={`activity-priority priority-${priority}`}>
            {priorityLevels[priority]?.label}
          </span>
          
          {Object.entries(metadata).map(([key, value]) => (
            <span key={key} className="activity-meta">
              {key}: {value instanceof Date ? value.toLocaleDateString() : value}
            </span>
          ))}
        </div>
      </div>

      <div className="activity-actions">
        {!isRead && <div className="unread-indicator"></div>}
        {requiresAction && (
          <div className="action-required-indicator" title="Action required">
            ⚡
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;