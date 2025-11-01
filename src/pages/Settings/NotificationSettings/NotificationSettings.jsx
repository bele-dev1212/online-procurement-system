import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import ToggleSwitch from '../../../components/common/ToggleSwitch/ToggleSwitch';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const {
    notificationSettings,
    loading,
    fetchNotificationSettings,
    updateNotificationSettings,
    testNotification,
    getNotificationLogs,
    clearNotificationLogs
  } = useNotifications();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('preferences');
  const [isLoading, setIsLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [testNotificationType, setTestNotificationType] = useState('email');
  const [testMessage, setTestMessage] = useState('');
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Notification settings state
  const [settings, setSettings] = useState({
    // Delivery Methods
    deliveryMethods: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      webhook: false
    },

    // Notification Categories
    categories: {
      // Order & Procurement
      orderUpdates: {
        enabled: true,
        email: true,
        push: true,
        sms: false,
        inApp: true
      },
      approvalRequests: {
        enabled: true,
        email: true,
        push: true,
        sms: true,
        inApp: true
      },
      bidUpdates: {
        enabled: true,
        email: true,
        push: false,
        sms: false,
        inApp: true
      },
      shipmentTracking: {
        enabled: true,
        email: true,
        push: true,
        sms: true,
        inApp: true
      },
      paymentReminders: {
        enabled: true,
        email: true,
        push: false,
        sms: false,
        inApp: true
      },

      // Inventory & Stock
      lowStockAlerts: {
        enabled: true,
        email: true,
        push: true,
        sms: true,
        inApp: true
      },
      outOfStockAlerts: {
        enabled: true,
        email: true,
        push: true,
        sms: true,
        inApp: true
      },
      inventoryUpdates: {
        enabled: true,
        email: false,
        push: false,
        sms: false,
        inApp: true
      },

      // Supplier Management
      supplierUpdates: {
        enabled: true,
        email: true,
        push: false,
        sms: false,
        inApp: true
      },
      contractExpiry: {
        enabled: true,
        email: true,
        push: true,
        sms: false,
        inApp: true
      },
      performanceAlerts: {
        enabled: true,
        email: true,
        push: true,
        sms: true,
        inApp: true
      },

      // System & Security
      systemAlerts: {
        enabled: true,
        email: true,
        push: true,
        sms: true,
        inApp: true
      },
      securityAlerts: {
        enabled: true,
        email: true,
        push: true,
        sms: true,
        inApp: true
      },
      maintenanceNotifications: {
        enabled: true,
        email: true,
        push: true,
        sms: false,
        inApp: true
      },

      // Reports & Analytics
      reportGeneration: {
        enabled: true,
        email: true,
        push: false,
        sms: false,
        inApp: true
      },
      kpiAlerts: {
        enabled: true,
        email: true,
        push: true,
        sms: false,
        inApp: true
      }
    },

    // Quiet Hours
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      days: ['saturday', 'sunday']
    },

    // Advanced Settings
    advanced: {
      groupSimilar: true,
      digestEmails: true,
      digestFrequency: 'daily',
      maxNotificationsPerDay: 50,
      autoClearRead: true,
      retainLogsDays: 30,
      enableSound: true,
      enableDesktop: true
    }
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    if (notificationSettings) {
      setSettings(prev => ({
        ...prev,
        ...notificationSettings
      }));
    }
  }, [notificationSettings]);

  const loadNotificationSettings = async () => {
    try {
      await fetchNotificationSettings();
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleSettingsUpdate = async (section) => {
    setIsLoading(true);
    try {
      await updateNotificationSettings(section, settings[section]);
      addNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully!`, 'success');
    } catch (error) {
      addNotification(`Failed to update ${section} settings: ` + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!testMessage.trim()) {
      addNotification('Please enter a test message', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await testNotification(testNotificationType, testMessage);
      addNotification('Test notification sent successfully!', 'success');
      setShowTestModal(false);
      setTestMessage('');
    } catch (error) {
      addNotification('Failed to send test notification: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadLogs = async () => {
    setLogsLoading(true);
    try {
      const logs = await getNotificationLogs();
      setNotificationLogs(logs);
      setShowLogsModal(true);
    } catch (error) {
      addNotification('Failed to load notification logs: ' + error.message, 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    setIsLoading(true);
    try {
      await clearNotificationLogs();
      setNotificationLogs([]);
      addNotification('Notification logs cleared successfully!', 'success');
    } catch (error) {
      addNotification('Failed to clear logs: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChange = (section, field, subField = null) => (value) => {
    setSettings(prev => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value
            }
          }
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
  };

  const handleArrayChange = (section, field, value, checked) => {
    setSettings(prev => {
      const currentArray = [...prev[section][field]];
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const addNotification = (message, type = 'info') => {
    // This would typically use the notification context
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const getNotificationStats = () => {
    const totalCategories = Object.keys(settings.categories).length;
    const enabledCategories = Object.values(settings.categories).filter(cat => cat.enabled).length;
    const deliveryMethods = Object.entries(settings.deliveryMethods).filter(([, enabled]) => enabled).length;

    return {
      totalCategories,
      enabledCategories,
      deliveryMethods,
      enabledPercentage: Math.round((enabledCategories / totalCategories) * 100)
    };
  };

  const stats = getNotificationStats();

  const renderDeliveryMethodIcon = (method) => {
    const icons = {
      email: '📧',
      push: '📱',
      sms: '💬',
      inApp: '🔔',
      webhook: '🔗'
    };
    return icons[method] || '❓';
  };

  const renderCategoryIcon = (category) => {
    const icons = {
      orderUpdates: '📦',
      approvalRequests: '✅',
      bidUpdates: '🏷️',
      shipmentTracking: '🚚',
      paymentReminders: '💰',
      lowStockAlerts: '📉',
      outOfStockAlerts: '❌',
      inventoryUpdates: '📊',
      supplierUpdates: '🏢',
      contractExpiry: '📄',
      performanceAlerts: '📈',
      systemAlerts: '⚙️',
      securityAlerts: '🔒',
      maintenanceNotifications: '🛠️',
      reportGeneration: '📋',
      kpiAlerts: '🎯'
    };
    return icons[category] || '🔔';
  };


  if (loading && !notificationSettings) {
    return <LoadingSpinner />;
  }

  return (
    <div className="notification-settings-container">
      <div className="settings-header">
        <div className="header-content">
          <h1>Notification Settings</h1>
          <p>Manage how and when you receive notifications from the system</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={handleLoadLogs}
            disabled={logsLoading}
          >
            {logsLoading ? <LoadingSpinner size="small" /> : 'View Logs'}
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowTestModal(true)}
          >
            Test Notifications
          </button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="notification-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.enabledCategories}/{stats.totalCategories}</div>
          <div className="stat-label">Active Categories</div>
          <div className="stat-progress">
            <div 
              className="progress-bar"
              style={{ width: `${stats.enabledPercentage}%` }}
            />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.deliveryMethods}</div>
          <div className="stat-label">Delivery Methods</div>
          <div className="stat-description">Active channels</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{settings.advanced.maxNotificationsPerDay}</div>
          <div className="stat-label">Daily Limit</div>
          <div className="stat-description">Max notifications per day</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {settings.quietHours.enabled ? '🕒 On' : '⏰ Off'}
          </div>
          <div className="stat-label">Quiet Hours</div>
          <div className="stat-description">
            {settings.quietHours.enabled ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              ⚙️ Preferences
            </button>
            <button
              className={`nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
            >
              📨 Delivery Methods
            </button>
            <button
              className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              📋 Categories
            </button>
            <button
              className={`nav-item ${activeTab === 'quiet-hours' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiet-hours')}
            >
              🕒 Quiet Hours
            </button>
            <button
              className={`nav-item ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              🔧 Advanced
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">
                Configure your overall notification preferences and global settings
              </p>

              <div className="preferences-overview">
                <div className="preference-card">
                  <h4>Global Notification Control</h4>
                  <div className="preference-control">
                    <label>Enable All Notifications</label>
                    <ToggleSwitch
                      checked={Object.values(settings.categories).every(cat => cat.enabled)}
                      onChange={(checked) => {
                        const updatedCategories = { ...settings.categories };
                        Object.keys(updatedCategories).forEach(key => {
                          updatedCategories[key].enabled = checked;
                        });
                        setSettings(prev => ({
                          ...prev,
                          categories: updatedCategories
                        }));
                      }}
                    />
                  </div>
                  <p className="preference-help">
                    Master switch for all notification categories
                  </p>
                </div>

                <div className="preference-card">
                  <h4>Urgency Settings</h4>
                  <div className="urgency-levels">
                    <div className="urgency-item">
                      <span className="urgency-icon">🔴</span>
                      <div className="urgency-info">
                        <div className="urgency-label">Critical Alerts</div>
                        <div className="urgency-description">
                          Always delivered immediately via all enabled methods
                        </div>
                      </div>
                    </div>
                    <div className="urgency-item">
                      <span className="urgency-icon">🟡</span>
                      <div className="urgency-info">
                        <div className="urgency-label">Important Updates</div>
                        <div className="urgency-description">
                          Delivered via email and in-app notifications
                        </div>
                      </div>
                    </div>
                    <div className="urgency-item">
                      <span className="urgency-icon">🔵</span>
                      <div className="urgency-info">
                        <div className="urgency-label">Regular Updates</div>
                        <div className="urgency-description">
                          Can be bundled in daily digest emails
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => handleSettingsUpdate('categories')}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Delivery Methods Tab */}
          {activeTab === 'delivery' && (
            <div className="settings-section">
              <h2>Delivery Methods</h2>
              <p className="section-description">
                Choose how you want to receive notifications across different channels
              </p>

              <div className="delivery-methods-grid">
                {Object.entries(settings.deliveryMethods).map(([method, enabled]) => (
                  <div key={method} className="delivery-method-card">
                    <div className="method-header">
                      <div className="method-icon">
                        {renderDeliveryMethodIcon(method)}
                      </div>
                      <div className="method-info">
                        <h4>{method.charAt(0).toUpperCase() + method.slice(1)}</h4>
                        <p>{getDeliveryMethodDescription(method)}</p>
                      </div>
                      <ToggleSwitch
                        checked={enabled}
                        onChange={handleToggleChange('deliveryMethods', method)}
                      />
                    </div>
                    
                    {enabled && (
                      <div className="method-settings">
                        {method === 'email' && (
                          <div className="method-setting">
                            <span>Delivery to: {user?.email}</span>
                          </div>
                        )}
                        {method === 'sms' && (
                          <div className="method-setting">
                            <span>Phone number: {user?.phone || 'Not set'}</span>
                            {!user?.phone && (
                              <button className="btn-link">Add phone number</button>
                            )}
                          </div>
                        )}
                        {method === 'push' && (
                          <div className="method-setting">
                            <span>Browser notifications enabled</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  onClick={() => handleSettingsUpdate('deliveryMethods')}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : 'Save Delivery Methods'}
                </button>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="settings-section">
              <h2>Notification Categories</h2>
              <p className="section-description">
                Fine-tune which types of notifications you want to receive
              </p>

              <div className="categories-grid">
                {Object.entries(settings.categories).map(([category, config]) => (
                  <div key={category} className="category-card">
                    <div className="category-header">
                      <div className="category-icon">
                        {renderCategoryIcon(category)}
                      </div>
                      <div className="category-info">
                        <h4>{formatCategoryName(category)}</h4>
                        <p>{getCategoryDescription(category)}</p>
                      </div>
                      <ToggleSwitch
                        checked={config.enabled}
                        onChange={handleToggleChange('categories', category, 'enabled')}
                      />
                    </div>

                    {config.enabled && (
                      <div className="category-channels">
                        <div className="channels-label">Delivery Channels:</div>
                        <div className="channel-toggles">
                          {Object.entries(config).filter(([key]) => key !== 'enabled').map(([channel, channelEnabled]) => (
                            <div key={channel} className="channel-toggle">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={channelEnabled}
                                  onChange={(e) => handleToggleChange('categories', category, channel)(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                {renderDeliveryMethodIcon(channel)} {channel}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  onClick={() => handleSettingsUpdate('categories')}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : 'Save Categories'}
                </button>
              </div>
            </div>
          )}

          {/* Quiet Hours Tab */}
          {activeTab === 'quiet-hours' && (
            <div className="settings-section">
              <h2>Quiet Hours</h2>
              <p className="section-description">
                Set periods when you don't want to receive non-urgent notifications
              </p>

              <div className="quiet-hours-settings">
                <div className="quiet-hours-toggle">
                  <div className="toggle-info">
                    <h4>Enable Quiet Hours</h4>
                    <p>Pause non-urgent notifications during specified times</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.quietHours.enabled}
                    onChange={handleToggleChange('quietHours', 'enabled')}
                  />
                </div>

                {settings.quietHours.enabled && (
                  <div className="quiet-hours-config">
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="startTime">Start Time</label>
                        <input
                          type="time"
                          id="startTime"
                          value={settings.quietHours.startTime}
                          onChange={(e) => handleToggleChange('quietHours', 'startTime')(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="endTime">End Time</label>
                        <input
                          type="time"
                          id="endTime"
                          value={settings.quietHours.endTime}
                          onChange={(e) => handleToggleChange('quietHours', 'endTime')(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="days-selection">
                      <label>Apply to these days:</label>
                      <div className="days-grid">
                        {[
                          { value: 'monday', label: 'Mon' },
                          { value: 'tuesday', label: 'Tue' },
                          { value: 'wednesday', label: 'Wed' },
                          { value: 'thursday', label: 'Thu' },
                          { value: 'friday', label: 'Fri' },
                          { value: 'saturday', label: 'Sat' },
                          { value: 'sunday', label: 'Sun' }
                        ].map(day => (
                          <label key={day.value} className="day-checkbox">
                            <input
                              type="checkbox"
                              checked={settings.quietHours.days.includes(day.value)}
                              onChange={(e) => handleArrayChange('quietHours', 'days', day.value, e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            {day.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="quiet-hours-note">
                      <p>💡 <strong>Note:</strong> Critical alerts will still be delivered during quiet hours</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  onClick={() => handleSettingsUpdate('quietHours')}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : 'Save Quiet Hours'}
                </button>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="settings-section">
              <h2>Advanced Settings</h2>
              <p className="section-description">
                Configure advanced notification behavior and preferences
              </p>

              <div className="advanced-settings-grid">
                <div className="advanced-card">
                  <h4>Notification Behavior</h4>
                  
                  <div className="advanced-setting">
                    <div className="setting-info">
                      <label>Group Similar Notifications</label>
                      <p>Combine multiple similar notifications into a single message</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.advanced.groupSimilar}
                      onChange={handleToggleChange('advanced', 'groupSimilar')}
                    />
                  </div>

                  <div className="advanced-setting">
                    <div className="setting-info">
                      <label>Daily Digest Emails</label>
                      <p>Receive a summary of non-urgent notifications once per day</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.advanced.digestEmails}
                      onChange={handleToggleChange('advanced', 'digestEmails')}
                    />
                  </div>

                  {settings.advanced.digestEmails && (
                    <div className="form-group">
                      <label htmlFor="digestFrequency">Digest Frequency</label>
                      <select
                        id="digestFrequency"
                        value={settings.advanced.digestFrequency}
                        onChange={(e) => handleToggleChange('advanced', 'digestFrequency')(e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  )}

                  <div className="advanced-setting">
                    <div className="setting-info">
                      <label>Auto-clear Read Notifications</label>
                      <p>Automatically remove read notifications after 7 days</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.advanced.autoClearRead}
                      onChange={handleToggleChange('advanced', 'autoClearRead')}
                    />
                  </div>
                </div>

                <div className="advanced-card">
                  <h4>Limits & Retention</h4>
                  
                  <div className="form-group">
                    <label htmlFor="maxNotificationsPerDay">Maximum Notifications Per Day</label>
                    <input
                      type="number"
                      id="maxNotificationsPerDay"
                      value={settings.advanced.maxNotificationsPerDay}
                      onChange={(e) => handleToggleChange('advanced', 'maxNotificationsPerDay')(parseInt(e.target.value))}
                      min="1"
                      max="1000"
                    />
                    <p className="input-help">Limit the number of notifications you receive daily</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="retainLogsDays">Retain Notification Logs (Days)</label>
                    <input
                      type="number"
                      id="retainLogsDays"
                      value={settings.advanced.retainLogsDays}
                      onChange={(e) => handleToggleChange('advanced', 'retainLogsDays')(parseInt(e.target.value))}
                      min="1"
                      max="365"
                    />
                    <p className="input-help">How long to keep notification history</p>
                  </div>
                </div>

                <div className="advanced-card">
                  <h4>Desktop & Sound</h4>
                  
                  <div className="advanced-setting">
                    <div className="setting-info">
                      <label>Desktop Notifications</label>
                      <p>Show browser notifications when available</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.advanced.enableDesktop}
                      onChange={handleToggleChange('advanced', 'enableDesktop')}
                    />
                  </div>

                  <div className="advanced-setting">
                    <div className="setting-info">
                      <label>Notification Sounds</label>
                      <p>Play sound for new notifications</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.advanced.enableSound}
                      onChange={handleToggleChange('advanced', 'enableSound')}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => handleSettingsUpdate('advanced')}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : 'Save Advanced Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Notification Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Test Notification"
      >
        <div className="modal-content">
          <p>Send a test notification to verify your settings:</p>
          
          <div className="form-group">
            <label>Notification Type</label>
            <select
              value={testNotificationType}
              onChange={(e) => setTestNotificationType(e.target.value)}
            >
              <option value="email">Email</option>
              <option value="push">Push Notification</option>
              <option value="inApp">In-App Notification</option>
            </select>
          </div>

          <div className="form-group">
            <label>Test Message</label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button
              onClick={() => setShowTestModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleTestNotification}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Send Test'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Notification Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Notification Logs"
        size="large"
      >
        <div className="modal-content">
          <div className="logs-header">
            <p>Recent notification delivery history</p>
            <button
              onClick={handleClearLogs}
              disabled={isLoading}
              className="btn-outline btn-sm"
            >
              Clear Logs
            </button>
          </div>

          <div className="logs-list">
            {notificationLogs.length === 0 ? (
              <div className="no-logs">No notification logs found</div>
            ) : (
              notificationLogs.map((log, index) => (
                <div key={index} className="log-item">
                  <div className="log-icon">
                    {renderDeliveryMethodIcon(log.channel)}
                  </div>
                  <div className="log-content">
                    <div className="log-message">{log.message}</div>
                    <div className="log-meta">
                      <span className="log-channel">{log.channel}</span>
                      <span className="log-time">{log.timestamp}</span>
                      <span className={`log-status ${log.status}`}>{log.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper functions
const getDeliveryMethodDescription = (method) => {
  const descriptions = {
    email: 'Receive notifications via email',
    push: 'Browser push notifications',
    sms: 'Text message notifications',
    inApp: 'Notifications within the application',
    webhook: 'Send notifications to external services'
  };
  return descriptions[method] || 'Notification delivery method';
};

const formatCategoryName = (category) => {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
};

const getCategoryDescription = (category) => {
  const descriptions = {
    orderUpdates: 'Updates on purchase orders and status changes',
    approvalRequests: 'Requests for approval on purchases',
    bidUpdates: 'Updates on bidding processes and RFQs',
    shipmentTracking: 'Shipment status and delivery updates',
    paymentReminders: 'Payment due dates and reminders',
    lowStockAlerts: 'Alerts when inventory reaches low levels',
    outOfStockAlerts: 'Critical alerts for out-of-stock items',
    inventoryUpdates: 'Regular inventory level updates',
    supplierUpdates: 'Supplier information and performance updates',
    contractExpiry: 'Contract expiration reminders',
    performanceAlerts: 'Supplier performance issues',
    systemAlerts: 'System maintenance and updates',
    securityAlerts: 'Security-related notifications',
    maintenanceNotifications: 'Scheduled maintenance alerts',
    reportGeneration: 'Report completion notifications',
    kpiAlerts: 'Key performance indicator alerts'
  };
  return descriptions[category] || 'Notification category';
};

export default NotificationSettings;