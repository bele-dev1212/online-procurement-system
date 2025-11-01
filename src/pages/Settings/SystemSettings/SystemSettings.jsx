import React, { useState, useEffect } from 'react';
import { useSystem } from '../../../hooks/useSystem';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog/ConfirmDialog';
import './SystemSettings.css';

const SystemSettings = () => {
  const {
    systemConfig,
    loading,
    fetchSystemConfig,
    updateSystemConfig,
    testEmailConfig,
    clearCache,
    backupDatabase,
    restoreSystem,
    getSystemHealth
  } = useSystem();

  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [backupType, setBackupType] = useState('full');
  const [restoreFile, setRestoreFile] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  // System configuration state
  const [config, setConfig] = useState({
    // General Settings
    general: {
      siteName: '',
      siteUrl: '',
      timezone: 'UTC',
      defaultLanguage: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      itemsPerPage: 25,
      enableRegistration: true,
      requireEmailVerification: true,
      maintenanceMode: false
    },

    // Email Settings
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromName: '',
      fromEmail: '',
      testMode: false
    },

    // SMS Settings
    sms: {
      provider: 'twilio',
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
      fromNumber: '',
      testMode: false
    },

    // Security Settings
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 60,
      enable2FA: false,
      enableAuditLog: true,
      enableIPWhitelist: false,
      allowedIPs: []
    },

    // Procurement Settings
    procurement: {
      defaultCurrency: 'USD',
      autoApproveLimit: 1000,
      requireManagerApproval: 5000,
      requireDirectorApproval: 50000,
      defaultPaymentTerms: 'net30',
      enableBidManagement: true,
      autoCloseBidsAfter: 30,
      lowStockThreshold: 10,
      criticalStockThreshold: 5
    },

    // Notification Settings
    notifications: {
      emailOrderConfirmation: true,
      emailShipmentUpdates: true,
      emailPaymentReminders: true,
      emailLowStockAlerts: true,
      smsEmergencyAlerts: false,
      pushOrderUpdates: true,
      notifyOnLateDelivery: true,
      notifyOnQualityIssues: true
    },

    // Integration Settings
    integrations: {
      enableQuickBooks: false,
      quickBooksClientId: '',
      quickBooksClientSecret: '',
      enableSalesforce: false,
      salesforceClientId: '',
      salesforceClientSecret: '',
      enableSlack: false,
      slackWebhookUrl: '',
      enableAPI: true,
      apiRateLimit: 1000
    },

    // Backup Settings
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      retainBackups: 30,
      backupLocation: 'local',
      cloudStorageProvider: 'aws',
      awsAccessKey: '',
      awsSecretKey: '',
      awsBucketName: ''
    }
  });

  useEffect(() => {
    loadSystemData();
  }, []);

  useEffect(() => {
    if (systemConfig) {
      setConfig(prev => ({
        ...prev,
        ...systemConfig
      }));
    }
  }, [systemConfig]);

  const loadSystemData = async () => {
    try {
      await fetchSystemConfig();
      const health = await getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      addNotification('Failed to load system data: ' + error.message, 'error');
    }
  };

  const handleConfigUpdate = async (section) => {
    setIsLoading(true);
    try {
      await updateSystemConfig(section, config[section]);
      addNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully!`, 'success');
    } catch (error) {
      addNotification(`Failed to update ${section} settings: ` + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      addNotification('Please enter an email address to test', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await testEmailConfig(testEmail);
      addNotification('Test email sent successfully!', 'success');
      setShowTestEmailModal(false);
      setTestEmail('');
    } catch (error) {
      addNotification('Failed to send test email: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      await backupDatabase(backupType);
      addNotification('Backup completed successfully!', 'success');
      setShowBackupModal(false);
    } catch (error) {
      addNotification('Backup failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      addNotification('Please select a backup file', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await restoreSystem(restoreFile);
      addNotification('System restored successfully!', 'success');
      setShowRestoreModal(false);
      setRestoreFile(null);
    } catch (error) {
      addNotification('Restore failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await clearCache();
      addNotification('Cache cleared successfully!', 'success');
      setShowClearCacheModal(false);
    } catch (error) {
      addNotification('Failed to clear cache: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section, field) => (e) => {
    const { value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleArrayInputChange = (section, field, index, value) => {
    setConfig(prev => {
      const newArray = [...prev[section][field]];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (section, field, defaultValue = '') => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], defaultValue]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const renderHealthIndicator = (status) => {
    const statusConfig = {
      healthy: { color: '#27ae60', label: 'Healthy' },
      warning: { color: '#f39c12', label: 'Warning' },
      critical: { color: '#e74c3c', label: 'Critical' },
      unknown: { color: '#95a5a6', label: 'Unknown' }
    };

    const config = statusConfig[status] || statusConfig.unknown;

    return (
      <span className="health-indicator" style={{ color: config.color }}>
        ● {config.label}
      </span>
    );
  };

  if (loading && !systemConfig) {
    return <LoadingSpinner />;
  }

  return (
    <div className="system-settings-container">
      <div className="settings-header">
        <div className="header-content">
          <h1>System Settings</h1>
          <p>Configure and manage system-wide settings and preferences</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowClearCacheModal(true)}
          >
            Clear Cache
          </button>
          <button
            className="btn-primary"
            onClick={loadSystemData}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="system-health-overview">
        <h3>System Health</h3>
        <div className="health-grid">
          <div className="health-card">
            <div className="health-icon">💾</div>
            <div className="health-info">
              <div className="health-label">Database</div>
              <div className="health-value">
                {renderHealthIndicator(systemHealth?.database)}
              </div>
            </div>
          </div>
          <div className="health-card">
            <div className="health-icon">📧</div>
            <div className="health-info">
              <div className="health-label">Email Service</div>
              <div className="health-value">
                {renderHealthIndicator(systemHealth?.email)}
              </div>
            </div>
          </div>
          <div className="health-card">
            <div className="health-icon">🔒</div>
            <div className="health-info">
              <div className="health-label">Security</div>
              <div className="health-value">
                {renderHealthIndicator(systemHealth?.security)}
              </div>
            </div>
          </div>
          <div className="health-card">
            <div className="health-icon">⚡</div>
            <div className="health-info">
              <div className="health-label">Performance</div>
              <div className="health-value">
                {renderHealthIndicator(systemHealth?.performance)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ General
            </button>
            <button
              className={`nav-item ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              📧 Email
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
            <button
              className={`nav-item ${activeTab === 'procurement' ? 'active' : ''}`}
              onClick={() => setActiveTab('procurement')}
            >
              📊 Procurement
            </button>
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
            <button
              className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
            >
              🔗 Integrations
            </button>
            <button
              className={`nav-item ${activeTab === 'backup' ? 'active' : ''}`}
              onClick={() => setActiveTab('backup')}
            >
              💾 Backup
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <p className="section-description">
                Configure basic system settings and preferences
              </p>

              <form className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="siteName">Site Name</label>
                    <input
                      type="text"
                      id="siteName"
                      value={config.general.siteName}
                      onChange={handleInputChange('general', 'siteName')}
                      placeholder="Enter site name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="siteUrl">Site URL</label>
                    <input
                      type="url"
                      id="siteUrl"
                      value={config.general.siteUrl}
                      onChange={handleInputChange('general', 'siteUrl')}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timezone">Timezone</label>
                    <select
                      id="timezone"
                      value={config.general.timezone}
                      onChange={handleInputChange('general', 'timezone')}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">GMT</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="defaultLanguage">Default Language</label>
                    <select
                      id="defaultLanguage"
                      value={config.general.defaultLanguage}
                      onChange={handleInputChange('general', 'defaultLanguage')}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateFormat">Date Format</label>
                    <select
                      id="dateFormat"
                      value={config.general.dateFormat}
                      onChange={handleInputChange('general', 'dateFormat')}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeFormat">Time Format</label>
                    <select
                      id="timeFormat"
                      value={config.general.timeFormat}
                      onChange={handleInputChange('general', 'timeFormat')}
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="itemsPerPage">Items Per Page</label>
                    <select
                      id="itemsPerPage"
                      value={config.general.itemsPerPage}
                      onChange={handleInputChange('general', 'itemsPerPage')}
                    >
                      <option value="10">10 items</option>
                      <option value="25">25 items</option>
                      <option value="50">50 items</option>
                      <option value="100">100 items</option>
                    </select>
                  </div>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.general.enableRegistration}
                      onChange={handleInputChange('general', 'enableRegistration')}
                    />
                    <span className="checkmark"></span>
                    Enable User Registration
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.general.requireEmailVerification}
                      onChange={handleInputChange('general', 'requireEmailVerification')}
                    />
                    <span className="checkmark"></span>
                    Require Email Verification
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.general.maintenanceMode}
                      onChange={handleInputChange('general', 'maintenanceMode')}
                    />
                    <span className="checkmark"></span>
                    Maintenance Mode
                  </label>
                  <p className="checkbox-help">
                    When enabled, only administrators can access the system
                  </p>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate('general')}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save General Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <h2>Email Settings</h2>
              <p className="section-description">
                Configure SMTP settings for system emails and notifications
              </p>

              <form className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="smtpHost">SMTP Host</label>
                    <input
                      type="text"
                      id="smtpHost"
                      value={config.email.smtpHost}
                      onChange={handleInputChange('email', 'smtpHost')}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="smtpPort">SMTP Port</label>
                    <input
                      type="number"
                      id="smtpPort"
                      value={config.email.smtpPort}
                      onChange={handleInputChange('email', 'smtpPort')}
                      placeholder="587"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="smtpUsername">SMTP Username</label>
                    <input
                      type="text"
                      id="smtpUsername"
                      value={config.email.smtpUsername}
                      onChange={handleInputChange('email', 'smtpUsername')}
                      placeholder="your-email@gmail.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="smtpPassword">SMTP Password</label>
                    <input
                      type="password"
                      id="smtpPassword"
                      value={config.email.smtpPassword}
                      onChange={handleInputChange('email', 'smtpPassword')}
                      placeholder="Your SMTP password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="smtpEncryption">Encryption</label>
                    <select
                      id="smtpEncryption"
                      value={config.email.smtpEncryption}
                      onChange={handleInputChange('email', 'smtpEncryption')}
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fromName">From Name</label>
                    <input
                      type="text"
                      id="fromName"
                      value={config.email.fromName}
                      onChange={handleInputChange('email', 'fromName')}
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fromEmail">From Email</label>
                    <input
                      type="email"
                      id="fromEmail"
                      value={config.email.fromEmail}
                      onChange={handleInputChange('email', 'fromEmail')}
                      placeholder="noreply@company.com"
                    />
                  </div>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.email.testMode}
                      onChange={handleInputChange('email', 'testMode')}
                    />
                    <span className="checkmark"></span>
                    Test Mode
                  </label>
                  <p className="checkbox-help">
                    When enabled, emails will be logged but not actually sent
                  </p>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowTestEmailModal(true)}
                  >
                    Test Email Configuration
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate('email')}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save Email Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-description">
                Configure security policies and authentication settings
              </p>

              <form className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="passwordMinLength">Minimum Password Length</label>
                    <input
                      type="number"
                      id="passwordMinLength"
                      value={config.security.passwordMinLength}
                      onChange={handleInputChange('security', 'passwordMinLength')}
                      min="6"
                      max="32"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxLoginAttempts">Max Login Attempts</label>
                    <input
                      type="number"
                      id="maxLoginAttempts"
                      value={config.security.maxLoginAttempts}
                      onChange={handleInputChange('security', 'maxLoginAttempts')}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lockoutDuration">Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      id="lockoutDuration"
                      value={config.security.lockoutDuration}
                      onChange={handleInputChange('security', 'lockoutDuration')}
                      min="1"
                      max="1440"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      id="sessionTimeout"
                      value={config.security.sessionTimeout}
                      onChange={handleInputChange('security', 'sessionTimeout')}
                      min="5"
                      max="1440"
                    />
                  </div>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.security.passwordRequireUppercase}
                      onChange={handleInputChange('security', 'passwordRequireUppercase')}
                    />
                    <span className="checkmark"></span>
                    Require Uppercase Letters
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.security.passwordRequireLowercase}
                      onChange={handleInputChange('security', 'passwordRequireLowercase')}
                    />
                    <span className="checkmark"></span>
                    Require Lowercase Letters
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.security.passwordRequireNumbers}
                      onChange={handleInputChange('security', 'passwordRequireNumbers')}
                    />
                    <span className="checkmark"></span>
                    Require Numbers
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.security.passwordRequireSpecialChars}
                      onChange={handleInputChange('security', 'passwordRequireSpecialChars')}
                    />
                    <span className="checkmark"></span>
                    Require Special Characters
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.security.enable2FA}
                      onChange={handleInputChange('security', 'enable2FA')}
                    />
                    <span className="checkmark"></span>
                    Enable Two-Factor Authentication
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.security.enableAuditLog}
                      onChange={handleInputChange('security', 'enableAuditLog')}
                    />
                    <span className="checkmark"></span>
                    Enable Audit Logging
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.security.enableIPWhitelist}
                      onChange={handleInputChange('security', 'enableIPWhitelist')}
                    />
                    <span className="checkmark"></span>
                    Enable IP Whitelist
                  </label>
                </div>

                {config.security.enableIPWhitelist && (
                  <div className="array-input-group">
                    <label>Allowed IP Addresses</label>
                    {config.security.allowedIPs.map((ip, index) => (
                      <div key={index} className="array-input-item">
                        <input
                          type="text"
                          value={ip}
                          onChange={(e) => handleArrayInputChange('security', 'allowedIPs', index, e.target.value)}
                          placeholder="192.168.1.1"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('security', 'allowedIPs', index)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('security', 'allowedIPs', '')}
                      className="btn-add"
                    >
                      Add IP Address
                    </button>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate('security')}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save Security Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Procurement Settings */}
          {activeTab === 'procurement' && (
            <div className="settings-section">
              <h2>Procurement Settings</h2>
              <p className="section-description">
                Configure procurement workflow and approval settings
              </p>

              <form className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="defaultCurrency">Default Currency</label>
                    <select
                      id="defaultCurrency"
                      value={config.procurement.defaultCurrency}
                      onChange={handleInputChange('procurement', 'defaultCurrency')}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="autoApproveLimit">Auto-approve Limit ($)</label>
                    <input
                      type="number"
                      id="autoApproveLimit"
                      value={config.procurement.autoApproveLimit}
                      onChange={handleInputChange('procurement', 'autoApproveLimit')}
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="requireManagerApproval">Manager Approval Threshold ($)</label>
                    <input
                      type="number"
                      id="requireManagerApproval"
                      value={config.procurement.requireManagerApproval}
                      onChange={handleInputChange('procurement', 'requireManagerApproval')}
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="requireDirectorApproval">Director Approval Threshold ($)</label>
                    <input
                      type="number"
                      id="requireDirectorApproval"
                      value={config.procurement.requireDirectorApproval}
                      onChange={handleInputChange('procurement', 'requireDirectorApproval')}
                      min="0"
                      step="10000"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="defaultPaymentTerms">Default Payment Terms</label>
                    <select
                      id="defaultPaymentTerms"
                      value={config.procurement.defaultPaymentTerms}
                      onChange={handleInputChange('procurement', 'defaultPaymentTerms')}
                    >
                      <option value="net15">Net 15</option>
                      <option value="net30">Net 30</option>
                      <option value="net45">Net 45</option>
                      <option value="net60">Net 60</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
                    <input
                      type="number"
                      id="lowStockThreshold"
                      value={config.procurement.lowStockThreshold}
                      onChange={handleInputChange('procurement', 'lowStockThreshold')}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="criticalStockThreshold">Critical Stock Threshold</label>
                    <input
                      type="number"
                      id="criticalStockThreshold"
                      value={config.procurement.criticalStockThreshold}
                      onChange={handleInputChange('procurement', 'criticalStockThreshold')}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="autoCloseBidsAfter">Auto-close Bids After (days)</label>
                    <input
                      type="number"
                      id="autoCloseBidsAfter"
                      value={config.procurement.autoCloseBidsAfter}
                      onChange={handleInputChange('procurement', 'autoCloseBidsAfter')}
                      min="1"
                      max="90"
                    />
                  </div>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.procurement.enableBidManagement}
                      onChange={handleInputChange('procurement', 'enableBidManagement')}
                    />
                    <span className="checkmark"></span>
                    Enable Bid Management
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate('procurement')}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save Procurement Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="settings-section">
              <h2>Backup & Restore</h2>
              <p className="section-description">
                Configure automated backups and manage system restoration
              </p>

              <form className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="backupFrequency">Backup Frequency</label>
                    <select
                      id="backupFrequency"
                      value={config.backup.backupFrequency}
                      onChange={handleInputChange('backup', 'backupFrequency')}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="backupTime">Backup Time</label>
                    <input
                      type="time"
                      id="backupTime"
                      value={config.backup.backupTime}
                      onChange={handleInputChange('backup', 'backupTime')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="retainBackups">Retain Backups (days)</label>
                    <input
                      type="number"
                      id="retainBackups"
                      value={config.backup.retainBackups}
                      onChange={handleInputChange('backup', 'retainBackups')}
                      min="1"
                      max="365"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="backupLocation">Backup Location</label>
                    <select
                      id="backupLocation"
                      value={config.backup.backupLocation}
                      onChange={handleInputChange('backup', 'backupLocation')}
                    >
                      <option value="local">Local Server</option>
                      <option value="cloud">Cloud Storage</option>
                    </select>
                  </div>

                  {config.backup.backupLocation === 'cloud' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="cloudStorageProvider">Cloud Provider</label>
                        <select
                          id="cloudStorageProvider"
                          value={config.backup.cloudStorageProvider}
                          onChange={handleInputChange('backup', 'cloudStorageProvider')}
                        >
                          <option value="aws">AWS S3</option>
                          <option value="google">Google Cloud</option>
                          <option value="azure">Azure Blob</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="awsAccessKey">Access Key</label>
                        <input
                          type="text"
                          id="awsAccessKey"
                          value={config.backup.awsAccessKey}
                          onChange={handleInputChange('backup', 'awsAccessKey')}
                          placeholder="AWS Access Key"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="awsSecretKey">Secret Key</label>
                        <input
                          type="password"
                          id="awsSecretKey"
                          value={config.backup.awsSecretKey}
                          onChange={handleInputChange('backup', 'awsSecretKey')}
                          placeholder="AWS Secret Key"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="awsBucketName">Bucket Name</label>
                        <input
                          type="text"
                          id="awsBucketName"
                          value={config.backup.awsBucketName}
                          onChange={handleInputChange('backup', 'awsBucketName')}
                          placeholder="S3 Bucket Name"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.backup.autoBackup}
                      onChange={handleInputChange('backup', 'autoBackup')}
                    />
                    <span className="checkmark"></span>
                    Enable Automatic Backups
                  </label>
                </div>

                <div className="backup-actions">
                  <div className="action-group">
                    <h4>Manual Operations</h4>
                    <div className="action-buttons">
                      <button
                        type="button"
                        onClick={() => setShowBackupModal(true)}
                        className="btn-secondary"
                      >
                        Create Backup
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRestoreModal(true)}
                        className="btn-outline"
                      >
                        Restore System
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate('backup')}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save Backup Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Test Email Modal */}
      <Modal
        isOpen={showTestEmailModal}
        onClose={() => setShowTestEmailModal(false)}
        title="Test Email Configuration"
      >
        <div className="modal-content">
          <p>Enter an email address to test the SMTP configuration:</p>
          <div className="form-group">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="full-width"
            />
          </div>
          <div className="modal-actions">
            <button
              onClick={() => setShowTestEmailModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleTestEmail}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Send Test Email'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Backup Modal */}
      <Modal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        title="Create System Backup"
      >
        <div className="modal-content">
          <p>Select the type of backup you want to create:</p>
          <div className="form-group">
            <label>
              <input
                type="radio"
                value="full"
                checked={backupType === 'full'}
                onChange={(e) => setBackupType(e.target.value)}
              />
              Full Backup (Database + Files)
            </label>
            <label>
              <input
                type="radio"
                value="database"
                checked={backupType === 'database'}
                onChange={(e) => setBackupType(e.target.value)}
              />
              Database Only
            </label>
            <label>
              <input
                type="radio"
                value="files"
                checked={backupType === 'files'}
                onChange={(e) => setBackupType(e.target.value)}
              />
              Files Only
            </label>
          </div>
          <div className="modal-actions">
            <button
              onClick={() => setShowBackupModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleBackup}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Create Backup'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Restore Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Restore System"
      >
        <div className="modal-content">
          <p>Select a backup file to restore:</p>
          <div className="form-group">
            <input
              type="file"
              accept=".zip,.backup,.sql"
              onChange={(e) => setRestoreFile(e.target.files[0])}
              className="full-width"
            />
          </div>
          <div className="modal-actions">
            <button
              onClick={() => setShowRestoreModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleRestore}
              disabled={isLoading || !restoreFile}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Restore System'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear Cache Confirmation */}
      <ConfirmDialog
        isOpen={showClearCacheModal}
        onClose={() => setShowClearCacheModal(false)}
        onConfirm={handleClearCache}
        title="Clear System Cache"
        message="Are you sure you want to clear all system cache? This may temporarily affect performance while cache is rebuilt."
        confirmText="Clear Cache"
        confirmType="danger"
      />
    </div>
  );
};

export default SystemSettings;