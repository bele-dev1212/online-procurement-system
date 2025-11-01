import React, { useState, useEffect, useCallback } from 'react';
import './AlertSystem.css';

const AlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    soundEnabled: true,
    desktopNotifications: true,
    emailAlerts: false,
    autoDismiss: true,
    dismissDelay: 5000
  });
  const [newAlert, setNewAlert] = useState({
    type: 'info',
    title: '',
    message: '',
    priority: 'medium',
    autoDismiss: true
  });

  // Mock data - replace with actual API calls
  const mockAlerts = [
    {
      id: 1,
      type: 'critical',
      title: 'System Maintenance Required',
      message: 'Database server requires immediate maintenance. Performance may be degraded.',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      priority: 'critical',
      acknowledged: false,
      autoDismiss: false,
      source: 'system',
      actions: [
        { label: 'Acknowledge', type: 'acknowledge', variant: 'primary' },
        { label: 'Schedule Maintenance', type: 'schedule', variant: 'secondary' }
      ]
    },
    {
      id: 2,
      type: 'warning',
      title: 'High Server Load',
      message: 'CPU usage has exceeded 85% for the last 15 minutes. Consider scaling resources.',
      timestamp: new Date('2024-01-15T13:15:00Z'),
      priority: 'high',
      acknowledged: true,
      autoDismiss: true,
      source: 'monitoring',
      actions: [
        { label: 'View Metrics', type: 'view_metrics', variant: 'primary' },
        { label: 'Dismiss', type: 'dismiss', variant: 'secondary' }
      ]
    },
    {
      id: 3,
      type: 'info',
      title: 'New Feature Available',
      message: 'Advanced reporting features are now available in the analytics dashboard.',
      timestamp: new Date('2024-01-15T10:45:00Z'),
      priority: 'low',
      acknowledged: false,
      autoDismiss: true,
      source: 'product',
      actions: [
        { label: 'Explore', type: 'explore', variant: 'primary' },
        { label: 'Remind Later', type: 'snooze', variant: 'secondary' }
      ]
    },
    {
      id: 4,
      type: 'success',
      title: 'Backup Completed',
      message: 'System backup completed successfully. All data has been secured.',
      timestamp: new Date('2024-01-15T09:20:00Z'),
      priority: 'low',
      acknowledged: false,
      autoDismiss: true,
      source: 'system',
      actions: [
        { label: 'View Report', type: 'view_report', variant: 'primary' }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch alerts
    const fetchAlerts = async () => {
      try {
        // In real implementation:
        // const response = await alertsAPI.getAlerts();
        // setAlerts(response.data);
        
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        showAlert('error', 'Failed to load alerts', 'Unable to retrieve alert data from server.');
      }
    };

    fetchAlerts();

    // Simulate real-time alerts
    const interval = setInterval(() => {
      simulateRealTimeAlert();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const simulateRealTimeAlert = () => {
    const alertTypes = ['info', 'warning', 'success'];
    const sources = ['monitoring', 'system', 'security'];
    const messages = [
      'New user registration detected',
      'Inventory levels updated',
      'Supplier performance metrics calculated',
      'Scheduled task completed',
      'API response time normal'
    ];

    const randomAlert = {
      id: Date.now(),
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      title: 'System Update',
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      priority: 'low',
      acknowledged: false,
      autoDismiss: true,
      source: sources[Math.floor(Math.random() * sources.length)],
      actions: [
        { label: 'View', type: 'view', variant: 'primary' },
        { label: 'Dismiss', type: 'dismiss', variant: 'secondary' }
      ]
    };

    setAlerts(prev => [randomAlert, ...prev]);
    
    // Play sound if enabled
    if (alertSettings.soundEnabled) {
      playAlertSound(randomAlert.type);
    }

    // Show desktop notification if enabled
    if (alertSettings.desktopNotifications && Notification.permission === 'granted') {
      new Notification(`Alert: ${randomAlert.title}`, {
        body: randomAlert.message,
        icon: '/favicon.ico',
        tag: 'procurement-alert'
      });
    }
  };

  const playAlertSound = (type) => {
    // In a real implementation, you would play different sounds based on alert type
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different alert types
    const frequencies = {
      critical: 800,
      warning: 600,
      info: 400,
      success: 300
    };

    oscillator.frequency.value = frequencies[type] || 500;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const showAlert = useCallback((type, title, message, options = {}) => {
    const newAlert = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date(),
      priority: options.priority || 'medium',
      acknowledged: false,
      autoDismiss: options.autoDismiss !== false,
      source: options.source || 'system',
      actions: options.actions || []
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Auto-dismiss if enabled
    if (newAlert.autoDismiss && alertSettings.autoDismiss) {
      setTimeout(() => {
        dismissAlert(newAlert.id);
      }, alertSettings.dismissDelay);
    }
  }, [alertSettings.autoDismiss, alertSettings.dismissDelay]);

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const handleAction = (alertId, actionType) => {
    
    switch (actionType) {
      case 'acknowledge':
        acknowledgeAlert(alertId);
        break;
      case 'dismiss':
        dismissAlert(alertId);
        break;
      case 'view_metrics':
        console.log('Navigating to metrics for alert:', alertId);
        // navigate('/monitoring/metrics');
        break;
      case 'schedule':
        console.log('Scheduling maintenance for alert:', alertId);
        // openMaintenanceScheduler(alert);
        break;
      case 'explore':
        console.log('Exploring new features for alert:', alertId);
        // navigate('/analytics');
        break;
      case 'snooze':
        console.log('Snoozing alert:', alertId);
        // Implement snooze logic
        break;
      case 'view_report':
        console.log('Viewing report for alert:', alertId);
        // navigate('/reports/backup');
        break;
      default:
        console.log('Action:', actionType, 'for alert:', alertId);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };

  const getSourceBadge = (source) => {
    const sourceConfig = {
      system: { label: 'System', class: 'source-system' },
      monitoring: { label: 'Monitoring', class: 'source-monitoring' },
      security: { label: 'Security', class: 'source-security' },
      product: { label: 'Product', class: 'source-product' },
      user: { label: 'User', class: 'source-user' }
    };

    const config = sourceConfig[source] || { label: source, class: 'source-default' };
    
    return (
      <span className={`source-badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showAlert('success', 'Notifications Enabled', 'You will now receive desktop notifications for important alerts.');
      }
    }
  };

  const updateAlertSettings = (key, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const createManualAlert = () => {
    if (!newAlert.title.trim() || !newAlert.message.trim()) {
      showAlert('warning', 'Validation Error', 'Please provide both title and message for the alert.');
      return;
    }

    showAlert(newAlert.type, newAlert.title, newAlert.message, {
      priority: newAlert.priority,
      autoDismiss: newAlert.autoDismiss,
      source: 'manual'
    });

    // Reset form
    setNewAlert({
      type: 'info',
      title: '',
      message: '',
      priority: 'medium',
      autoDismiss: true
    });
  };

  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical' && !alert.acknowledged);
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="alert-system">
      {/* Alert Header */}
      <div className="alert-header">
        <div className="header-content">
          <h2>Alert System</h2>
          <div className="alert-stats">
            <div className="stat-item critical">
              <span className="stat-count">{criticalAlerts.length}</span>
              <span className="stat-label">Critical</span>
            </div>
            <div className="stat-item unacknowledged">
              <span className="stat-count">{unacknowledgedAlerts.length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item total">
              <span className="stat-count">{alerts.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-expand"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'} All
          </button>
          <button 
            className="btn-settings"
            onClick={() => showAlert('info', 'Settings', 'Alert system settings would open here.')}
          >
            Settings
          </button>
          <button 
            className="btn-test-alert"
            onClick={() => showAlert('info', 'Test Alert', 'This is a test alert to verify the system is working properly.')}
          >
            Test Alert
          </button>
        </div>
      </div>

      {/* Alert Settings Panel */}
      <div className="alert-settings-panel">
        <h4>Alert Preferences</h4>
        <div className="settings-grid">
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={alertSettings.soundEnabled}
                onChange={(e) => updateAlertSettings('soundEnabled', e.target.checked)}
              />
              Enable Sound Alerts
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={alertSettings.desktopNotifications}
                onChange={(e) => updateAlertSettings('desktopNotifications', e.target.checked)}
              />
              Desktop Notifications
            </label>
            {alertSettings.desktopNotifications && Notification.permission !== 'granted' && (
              <button 
                className="btn-permission"
                onClick={requestNotificationPermission}
              >
                Grant Permission
              </button>
            )}
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={alertSettings.autoDismiss}
                onChange={(e) => updateAlertSettings('autoDismiss', e.target.checked)}
              />
              Auto-dismiss Alerts
            </label>
          </div>
          <div className="setting-item">
            <label>
              Dismiss Delay:
              <select
                value={alertSettings.dismissDelay}
                onChange={(e) => updateAlertSettings('dismissDelay', parseInt(e.target.value))}
              >
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={15000}>15 seconds</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Create Alert Form */}
      <div className="create-alert-panel">
        <h4>Create Manual Alert</h4>
        <div className="alert-form">
          <div className="form-row">
            <select
              value={newAlert.type}
              onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
            </select>
            
            <select
              value={newAlert.priority}
              onChange={(e) => setNewAlert(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <input
            type="text"
            placeholder="Alert title..."
            value={newAlert.title}
            onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
            className="alert-title-input"
          />
          
          <textarea
            placeholder="Alert message..."
            value={newAlert.message}
            onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
            className="alert-message-input"
            rows="3"
          />
          
          <div className="form-actions">
            <label>
              <input
                type="checkbox"
                checked={newAlert.autoDismiss}
                onChange={(e) => setNewAlert(prev => ({ ...prev, autoDismiss: e.target.checked }))}
              />
              Auto-dismiss
            </label>
            <button 
              className="btn-create-alert"
              onClick={createManualAlert}
            >
              Create Alert
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-container">
        {unacknowledgedAlerts.length > 0 && (
          <div className="alerts-section">
            <h3>Active Alerts ({unacknowledgedAlerts.length})</h3>
            <div className="alerts-list">
              {unacknowledgedAlerts.map(alert => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAction={handleAction}
                  onDismiss={dismissAlert}
                  onAcknowledge={acknowledgeAlert}
                  isExpanded={isExpanded}
                  getPriorityIcon={getPriorityIcon}
                  getTypeIcon={getTypeIcon}
                  getSourceBadge={getSourceBadge}
                  formatTimestamp={formatTimestamp}
                />
              ))}
            </div>
          </div>
        )}

        {acknowledgedAlerts.length > 0 && (
          <div className="alerts-section">
            <h3>Acknowledged Alerts ({acknowledgedAlerts.length})</h3>
            <div className="alerts-list">
              {acknowledgedAlerts.map(alert => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAction={handleAction}
                  onDismiss={dismissAlert}
                  onAcknowledge={acknowledgeAlert}
                  isExpanded={isExpanded}
                  getPriorityIcon={getPriorityIcon}
                  getTypeIcon={getTypeIcon}
                  getSourceBadge={getSourceBadge}
                  formatTimestamp={formatTimestamp}
                />
              ))}
            </div>
          </div>
        )}

        {alerts.length === 0 && (
          <div className="no-alerts">
            <div className="no-alerts-icon">🎉</div>
            <h3>No Active Alerts</h3>
            <p>All systems are operating normally.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Separate Alert Item Component for better organization
const AlertItem = ({ 
  alert, 
  onAction, 
  onDismiss, 
  onAcknowledge, 
  isExpanded,
  getPriorityIcon,
  getTypeIcon,
  getSourceBadge,
  formatTimestamp 
}) => {
  const [isItemExpanded, setIsItemExpanded] = useState(isExpanded);

  useEffect(() => {
    setIsItemExpanded(isExpanded);
  }, [isExpanded]);

  return (
    <div className={`alert-item ${alert.type} ${alert.priority} ${alert.acknowledged ? 'acknowledged' : 'active'}`}>
      <div className="alert-header" onClick={() => setIsItemExpanded(!isItemExpanded)}>
        <div className="alert-main">
          <div className="alert-icons">
            <span className="priority-icon">{getPriorityIcon(alert.priority)}</span>
            <span className="type-icon">{getTypeIcon(alert.type)}</span>
          </div>
          <div className="alert-content">
            <h4 className="alert-title">{alert.title}</h4>
            <p className="alert-preview">{alert.message}</p>
          </div>
        </div>
        
        <div className="alert-meta">
          {getSourceBadge(alert.source)}
          <span className="alert-time">{formatTimestamp(alert.timestamp)}</span>
          <button 
            className={`btn-expand-toggle ${isItemExpanded ? 'expanded' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsItemExpanded(!isItemExpanded);
            }}
          >
            {isItemExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isItemExpanded && (
        <div className="alert-details">
          <div className="alert-message">
            {alert.message}
          </div>
          
          {alert.actions.length > 0 && (
            <div className="alert-actions">
              {alert.actions.map((action, index) => (
                <button
                  key={index}
                  className={`btn-action ${action.variant}`}
                  onClick={() => onAction(alert.id, action.type)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          <div className="alert-controls">
            {!alert.acknowledged && (
              <button 
                className="btn-acknowledge"
                onClick={() => onAcknowledge(alert.id)}
              >
                Acknowledge
              </button>
            )}
            <button 
              className="btn-dismiss"
              onClick={() => onDismiss(alert.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;