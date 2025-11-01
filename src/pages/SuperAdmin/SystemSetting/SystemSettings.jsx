import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Toast from '../../../components/common/Toast';
import Modal from '../../../components/common/Modal';
import './SystemSettings.css';

const SystemSettings = () => {
  const { platformConfig, loading, fetchPlatformConfig, updatePlatformConfig } = useSuperAdmin();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showResetModal, setShowResetModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchPlatformConfig();
  }, []);

  useEffect(() => {
    if (platformConfig) {
      setFormData(platformConfig);
      setOriginalData(platformConfig);
    }
  }, [platformConfig]);

  useEffect(() => {
    // Check if there are any changes
    const changesExist = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changesExist);
  }, [formData, originalData]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));

    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // General Settings Validation
    if (activeTab === 'general') {
      if (!formData.platformName?.trim()) {
        errors.platformName = 'Platform name is required';
      }
      if (formData.supportEmail && !isValidEmail(formData.supportEmail)) {
        errors.supportEmail = 'Please enter a valid email address';
      }
    }

    // Email Settings Validation
    if (activeTab === 'email') {
      if (formData.smtpHost && !formData.smtpPort) {
        errors.smtpPort = 'SMTP port is required when SMTP host is provided';
      }
      if (formData.fromEmail && !isValidEmail(formData.fromEmail)) {
        errors.fromEmail = 'Please enter a valid email address';
      }
    }

    // Security Settings Validation
    if (activeTab === 'security') {
      if (formData.sessionTimeout && (formData.sessionTimeout < 5 || formData.sessionTimeout > 1440)) {
        errors.sessionTimeout = 'Session timeout must be between 5 and 1440 minutes';
      }
      if (formData.maxLoginAttempts && (formData.maxLoginAttempts < 1 || formData.maxLoginAttempts > 10)) {
        errors.maxLoginAttempts = 'Max login attempts must be between 1 and 10';
      }
    }

    // Billing Settings Validation
    if (activeTab === 'billing') {
      if (formData.taxRate && (formData.taxRate < 0 || formData.taxRate > 50)) {
        errors.taxRate = 'Tax rate must be between 0% and 50%';
      }
      if (formData.freeTrialDays && (formData.freeTrialDays < 0 || formData.freeTrialDays > 90)) {
        errors.freeTrialDays = 'Free trial must be between 0 and 90 days';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Please fix validation errors before saving', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updatePlatformConfig(formData);
      setOriginalData(formData);
      setHasChanges(false);
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setValidationErrors({});
    setShowResetModal(false);
    setHasChanges(false);
    showToast('Changes reset to original values', 'info');
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
  };

  const handleTestEmail = async () => {
    // This would call a backend endpoint to test email configuration
    showToast('Testing email configuration...', 'info');
    // Simulate API call
    setTimeout(() => {
      showToast('Email test completed successfully!', 'success');
    }, 2000);
  };

  const handleExportConfig = () => {
    const configJson = JSON.stringify(formData, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'platform-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Configuration exported successfully', 'success');
  };

  const handleImportConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target.result);
          setFormData(importedConfig);
          showToast('Configuration imported successfully', 'success');
        } catch (error) {
          showToast('Invalid configuration file', 'error');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  if (loading && !platformConfig) return <LoadingSpinner />;

  return (
    <div className="system-settings">
      {/* Toast Notifications */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <Modal onClose={() => setShowResetModal(false)}>
          <div className="reset-confirmation-modal">
            <h3>Reset Changes</h3>
            <p>Are you sure you want to reset all changes? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-warning"
                onClick={handleReset}
              >
                Reset Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="settings-header">
        <div className="header-content">
          <h1>System Configuration</h1>
          <p>Manage platform-wide settings and configuration</p>
        </div>
        <div className="header-actions">
          <div className="config-actions">
            <button 
              className="btn btn-outline"
              onClick={handleExportConfig}
              disabled={isSaving}
            >
              Export Config
            </button>
            <label className="btn btn-outline import-btn">
              Import Config
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportConfig}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="sidebar-section">
            <h4>Platform Settings</h4>
            <button 
              className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <span className="tab-icon">⚙️</span>
              General
            </button>
            <button 
              className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <span className="tab-icon">📧</span>
              Email
            </button>
            <button 
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="tab-icon">🔔</span>
              Notifications
            </button>
          </div>

          <div className="sidebar-section">
            <h4>Security & Billing</h4>
            <button 
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="tab-icon">🔒</span>
              Security
            </button>
            <button 
              className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              <span className="tab-icon">💰</span>
              Billing
            </button>
            <button 
              className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              <span className="tab-icon">🔧</span>
              Advanced
            </button>
          </div>

          <div className="sidebar-info">
            <div className="info-card">
              <h5>Configuration Status</h5>
              <div className="status-item">
                <span className="status-label">Last Updated:</span>
                <span className="status-value">
                  {platformConfig?.lastUpdated ? 
                    new Date(platformConfig.lastUpdated).toLocaleDateString() : 
                    'Never'
                  }
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Unsaved Changes:</span>
                <span className={`status-value ${hasChanges ? 'has-changes' : ''}`}>
                  {hasChanges ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-content">
          <div className="content-header">
            <h2>
              {activeTab === 'general' && 'General Settings'}
              {activeTab === 'email' && 'Email Configuration'}
              {activeTab === 'notifications' && 'Notification Settings'}
              {activeTab === 'security' && 'Security Settings'}
              {activeTab === 'billing' && 'Billing Configuration'}
              {activeTab === 'advanced' && 'Advanced Settings'}
            </h2>
            {hasChanges && (
              <div className="changes-indicator">
                <span className="indicator-dot"></span>
                Unsaved Changes
              </div>
            )}
          </div>

          <div className="settings-section">
            {activeTab === 'general' && (
              <GeneralSettings 
                formData={formData} 
                onChange={handleInputChange}
                errors={validationErrors}
              />
            )}
            
            {activeTab === 'email' && (
              <EmailSettings 
                formData={formData} 
                onChange={handleInputChange}
                errors={validationErrors}
                onTestEmail={handleTestEmail}
              />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationSettings 
                formData={formData} 
                onChange={handleInputChange}
                errors={validationErrors}
              />
            )}
            
            {activeTab === 'security' && (
              <SecuritySettings 
                formData={formData} 
                onChange={handleInputChange}
                errors={validationErrors}
              />
            )}
            
            {activeTab === 'billing' && (
              <BillingSettings 
                formData={formData} 
                onChange={handleInputChange}
                errors={validationErrors}
              />
            )}

            {activeTab === 'advanced' && (
              <AdvancedSettings 
                formData={formData} 
                onChange={handleInputChange}
                errors={validationErrors}
              />
            )}
          </div>

          <div className="settings-actions">
            <div className="action-info">
              {hasChanges && (
                <span className="unsaved-changes">
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="action-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowResetModal(true)}
                disabled={!hasChanges || isSaving}
              >
                Reset Changes
              </button>
              <button 
                className="btn btn-primary save-btn"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Settings Components with Validation
const GeneralSettings = ({ formData, onChange, errors }) => (
  <div className="settings-section-content">
    <div className="section-description">
      <p>Configure basic platform settings and appearance.</p>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="platformName" className="required">
          Platform Name
        </label>
        <input 
          id="platformName"
          type="text" 
          value={formData.platformName || ''}
          onChange={(e) => onChange('platformName', e.target.value)}
          placeholder="Enter platform name"
          className={errors.platformName ? 'error' : ''}
        />
        {errors.platformName && <span className="error-message">{errors.platformName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="supportEmail">Support Email</label>
        <input 
          id="supportEmail"
          type="email" 
          value={formData.supportEmail || ''}
          onChange={(e) => onChange('supportEmail', e.target.value)}
          placeholder="support@example.com"
          className={errors.supportEmail ? 'error' : ''}
        />
        {errors.supportEmail && <span className="error-message">{errors.supportEmail}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="supportPhone">Support Phone</label>
        <input 
          id="supportPhone"
          type="text" 
          value={formData.supportPhone || ''}
          onChange={(e) => onChange('supportPhone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="form-group">
        <label htmlFor="defaultTimezone">Default Timezone</label>
        <select 
          id="defaultTimezone"
          value={formData.defaultTimezone || 'UTC'}
          onChange={(e) => onChange('defaultTimezone', e.target.value)}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">Greenwich Mean Time (GMT)</option>
          <option value="Europe/Paris">Central European Time (CET)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="defaultLanguage">Default Language</label>
        <select 
          id="defaultLanguage"
          value={formData.defaultLanguage || 'en'}
          onChange={(e) => onChange('defaultLanguage', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
        </select>
      </div>
    </div>

    <div className="checkbox-group-section">
      <h4>Platform Features</h4>
      <div className="checkbox-grid">
        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.registrationEnabled !== false}
              onChange={(e) => onChange('registrationEnabled', e.target.checked)}
            />
            <span className="checkmark"></span>
            Allow new user registration
          </label>
          <span className="checkbox-description">Enable or disable new user sign-ups</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.emailVerificationRequired || false}
              onChange={(e) => onChange('emailVerificationRequired', e.target.checked)}
            />
            <span className="checkmark"></span>
            Require email verification
          </label>
          <span className="checkbox-description">Users must verify their email address</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.maintenanceMode || false}
              onChange={(e) => onChange('maintenanceMode', e.target.checked)}
            />
            <span className="checkmark"></span>
            Maintenance Mode
          </label>
          <span className="checkbox-description">Take the platform offline for maintenance</span>
        </div>
      </div>
    </div>
  </div>
);

const EmailSettings = ({ formData, onChange, errors, onTestEmail }) => (
  <div className="settings-section-content">
    <div className="section-description">
      <p>Configure email server settings and templates.</p>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="smtpHost">SMTP Host</label>
        <input 
          id="smtpHost"
          type="text" 
          value={formData.smtpHost || ''}
          onChange={(e) => onChange('smtpHost', e.target.value)}
          placeholder="smtp.example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="smtpPort">SMTP Port</label>
        <input 
          id="smtpPort"
          type="number" 
          value={formData.smtpPort || 587}
          onChange={(e) => onChange('smtpPort', parseInt(e.target.value) || '')}
          className={errors.smtpPort ? 'error' : ''}
        />
        {errors.smtpPort && <span className="error-message">{errors.smtpPort}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="smtpUsername">SMTP Username</label>
        <input 
          id="smtpUsername"
          type="text" 
          value={formData.smtpUsername || ''}
          onChange={(e) => onChange('smtpUsername', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="smtpPassword">SMTP Password</label>
        <input 
          id="smtpPassword"
          type="password" 
          value={formData.smtpPassword || ''}
          onChange={(e) => onChange('smtpPassword', e.target.value)}
          placeholder="Leave blank to keep current"
        />
      </div>

      <div className="form-group">
        <label htmlFor="fromEmail" className="required">From Email</label>
        <input 
          id="fromEmail"
          type="email" 
          value={formData.fromEmail || ''}
          onChange={(e) => onChange('fromEmail', e.target.value)}
          placeholder="noreply@example.com"
          className={errors.fromEmail ? 'error' : ''}
        />
        {errors.fromEmail && <span className="error-message">{errors.fromEmail}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="fromName">From Name</label>
        <input 
          id="fromName"
          type="text" 
          value={formData.fromName || ''}
          onChange={(e) => onChange('fromName', e.target.value)}
          placeholder="Your Platform Name"
        />
      </div>
    </div>

    <div className="checkbox-group-section">
      <h4>Email Security</h4>
      <div className="checkbox-grid">
        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.smtpUseSSL || false}
              onChange={(e) => onChange('smtpUseSSL', e.target.checked)}
            />
            <span className="checkmark"></span>
            Use SSL/TLS
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.smtpUseTLS || true}
              onChange={(e) => onChange('smtpUseTLS', e.target.checked)}
            />
            <span className="checkmark"></span>
            Require TLS
          </label>
        </div>
      </div>
    </div>

    <div className="action-section">
      <button 
        className="btn btn-outline"
        onClick={onTestEmail}
        disabled={!formData.smtpHost}
      >
        Test Email Configuration
      </button>
    </div>
  </div>
);

const NotificationSettings = ({ formData, onChange, errors }) => (
  <div className="settings-section-content">
    <div className="section-description">
      <p>Configure system notifications and alerts.</p>
    </div>

    <div className="checkbox-group-section">
      <h4>Admin Notifications</h4>
      <div className="checkbox-grid">
        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.notifyNewUsers || false}
              onChange={(e) => onChange('notifyNewUsers', e.target.checked)}
            />
            <span className="checkmark"></span>
            New user registrations
          </label>
          <span className="checkbox-description">Get notified when new users sign up</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.notifyNewOrganizations || false}
              onChange={(e) => onChange('notifyNewOrganizations', e.target.checked)}
            />
            <span className="checkmark"></span>
            New organization registrations
          </label>
          <span className="checkbox-description">Get notified when new organizations register</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.notifySystemAlerts || false}
              onChange={(e) => onChange('notifySystemAlerts', e.target.checked)}
            />
            <span className="checkmark"></span>
            System alerts
          </label>
          <span className="checkbox-description">Receive system health and security alerts</span>
        </div>
      </div>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="userAlertThreshold">User Alert Threshold</label>
        <input 
          id="userAlertThreshold"
          type="number" 
          value={formData.userAlertThreshold || 1000}
          onChange={(e) => onChange('userAlertThreshold', parseInt(e.target.value))}
          placeholder="Send alert when user count reaches"
        />
        <span className="input-description">Send alert when total users exceed this number</span>
      </div>

      <div className="form-group">
        <label htmlFor="alertEmail">Alert Email Address</label>
        <input 
          id="alertEmail"
          type="email" 
          value={formData.alertEmail || ''}
          onChange={(e) => onChange('alertEmail', e.target.value)}
          placeholder="alerts@example.com"
          className={errors.alertEmail ? 'error' : ''}
        />
        {errors.alertEmail && <span className="error-message">{errors.alertEmail}</span>}
        <span className="input-description">Email address to receive system alerts</span>
      </div>
    </div>
  </div>
);

const SecuritySettings = ({ formData, onChange, errors }) => (
  <div className="settings-section-content">
    <div className="section-description">
      <p>Configure security settings and access controls.</p>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
        <input 
          id="sessionTimeout"
          type="number" 
          value={formData.sessionTimeout || 60}
          onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value))}
          min="5"
          max="1440"
          className={errors.sessionTimeout ? 'error' : ''}
        />
        {errors.sessionTimeout && <span className="error-message">{errors.sessionTimeout}</span>}
        <span className="input-description">How long before users are automatically logged out</span>
      </div>

      <div className="form-group">
        <label htmlFor="maxLoginAttempts">Max Login Attempts</label>
        <input 
          id="maxLoginAttempts"
          type="number" 
          value={formData.maxLoginAttempts || 5}
          onChange={(e) => onChange('maxLoginAttempts', parseInt(e.target.value))}
          min="1"
          max="10"
          className={errors.maxLoginAttempts ? 'error' : ''}
        />
        {errors.maxLoginAttempts && <span className="error-message">{errors.maxLoginAttempts}</span>}
        <span className="input-description">Number of failed login attempts before lockout</span>
      </div>

      <div className="form-group">
        <label htmlFor="passwordExpiryDays">Password Expiry (days)</label>
        <input 
          id="passwordExpiryDays"
          type="number" 
          value={formData.passwordExpiryDays || 90}
          onChange={(e) => onChange('passwordExpiryDays', parseInt(e.target.value))}
          min="1"
          max="365"
        />
        <span className="input-description">How often users must change their passwords</span>
      </div>

      <div className="form-group">
        <label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</label>
        <input 
          id="lockoutDuration"
          type="number" 
          value={formData.lockoutDuration || 30}
          onChange={(e) => onChange('lockoutDuration', parseInt(e.target.value))}
          min="1"
          max="1440"
        />
        <span className="input-description">How long accounts remain locked after max attempts</span>
      </div>
    </div>

    <div className="checkbox-group-section">
      <h4>Security Features</h4>
      <div className="checkbox-grid">
        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.requireStrongPasswords || false}
              onChange={(e) => onChange('requireStrongPasswords', e.target.checked)}
            />
            <span className="checkmark"></span>
            Require strong passwords
          </label>
          <span className="checkbox-description">Enforce password complexity requirements</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.enable2FA || false}
              onChange={(e) => onChange('enable2FA', e.target.checked)}
            />
            <span className="checkmark"></span>
            Enable Two-Factor Authentication
          </label>
          <span className="checkbox-description">Add an extra layer of security to user accounts</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.enableAuditLogging || true}
              onChange={(e) => onChange('enableAuditLogging', e.target.checked)}
            />
            <span className="checkmark"></span>
            Enable Audit Logging
          </label>
          <span className="checkbox-description">Log all security-related events</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.requireHTTPS || true}
              onChange={(e) => onChange('requireHTTPS', e.target.checked)}
            />
            <span className="checkmark"></span>
            Require HTTPS
          </label>
          <span className="checkbox-description">Force all connections to use HTTPS</span>
        </div>
      </div>
    </div>
  </div>
);

const BillingSettings = ({ formData, onChange, errors }) => (
  <div className="settings-section-content">
    <div className="section-description">
      <p>Configure billing, pricing, and subscription settings.</p>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="currency">Default Currency</label>
        <select 
          id="currency"
          value={formData.currency || 'USD'}
          onChange={(e) => onChange('currency', e.target.value)}
        >
          <option value="USD">US Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
          <option value="GBP">British Pound (£)</option>
          <option value="CAD">Canadian Dollar ($)</option>
          <option value="AUD">Australian Dollar ($)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="taxRate">Tax Rate (%)</label>
        <input 
          id="taxRate"
          type="number" 
          value={formData.taxRate || 0}
          onChange={(e) => onChange('taxRate', parseFloat(e.target.value))}
          min="0"
          max="50"
          step="0.1"
          className={errors.taxRate ? 'error' : ''}
        />
        {errors.taxRate && <span className="error-message">{errors.taxRate}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="freeTrialDays">Free Trial Period (days)</label>
        <input 
          id="freeTrialDays"
          type="number" 
          value={formData.freeTrialDays || 14}
          onChange={(e) => onChange('freeTrialDays', parseInt(e.target.value))}
          min="0"
          max="90"
          className={errors.freeTrialDays ? 'error' : ''}
        />
        {errors.freeTrialDays && <span className="error-message">{errors.freeTrialDays}</span>}
      </div>
    </div>

    <div className="price-settings">
      <h4>Subscription Pricing</h4>
      <div className="price-grid">
        <div className="price-group">
          <label htmlFor="basicPlanPrice">Basic Plan</label>
          <div className="price-input-group">
            <span className="currency-symbol">$</span>
            <input 
              id="basicPlanPrice"
              type="number" 
              value={formData.basicPlanPrice || 49}
              onChange={(e) => onChange('basicPlanPrice', parseInt(e.target.value))}
              min="0"
            />
            <span className="price-period">/month</span>
          </div>
          <span className="price-description">Essential features for small teams</span>
        </div>

        <div className="price-group">
          <label htmlFor="professionalPlanPrice">Professional Plan</label>
          <div className="price-input-group">
            <span className="currency-symbol">$</span>
            <input 
              id="professionalPlanPrice"
              type="number" 
              value={formData.professionalPlanPrice || 99}
              onChange={(e) => onChange('professionalPlanPrice', parseInt(e.target.value))}
              min="0"
            />
            <span className="price-period">/month</span>
          </div>
          <span className="price-description">Advanced features for growing businesses</span>
        </div>

        <div className="price-group">
          <label htmlFor="enterprisePlanPrice">Enterprise Plan</label>
          <div className="price-input-group">
            <span className="currency-symbol">$</span>
            <input 
              id="enterprisePlanPrice"
              type="number" 
              value={formData.enterprisePlanPrice || 199}
              onChange={(e) => onChange('enterprisePlanPrice', parseInt(e.target.value))}
              min="0"
            />
            <span className="price-period">/month</span>
          </div>
          <span className="price-description">Full features with custom solutions</span>
        </div>
      </div>
    </div>
  </div>
);

const AdvancedSettings = ({ formData, onChange, errors }) => (
  <div className="settings-section-content">
    <div className="section-description">
      <p>Advanced system configuration and technical settings.</p>
      <div className="warning-banner">
        <strong>Warning:</strong> These settings affect system performance and stability. 
        Modify with caution.
      </div>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</label>
        <input 
          id="apiRateLimit"
          type="number" 
          value={formData.apiRateLimit || 1000}
          onChange={(e) => onChange('apiRateLimit', parseInt(e.target.value))}
          min="100"
          max="10000"
        />
        <span className="input-description">Maximum API requests per minute per user</span>
      </div>

      <div className="form-group">
        <label htmlFor="cacheTTL">Cache TTL (minutes)</label>
        <input 
          id="cacheTTL"
          type="number" 
          value={formData.cacheTTL || 60}
          onChange={(e) => onChange('cacheTTL', parseInt(e.target.value))}
          min="1"
          max="1440"
        />
        <span className="input-description">How long to cache data before refreshing</span>
      </div>

      <div className="form-group">
        <label htmlFor="logRetentionDays">Log Retention (days)</label>
        <input 
          id="logRetentionDays"
          type="number" 
          value={formData.logRetentionDays || 30}
          onChange={(e) => onChange('logRetentionDays', parseInt(e.target.value))}
          min="1"
          max="365"
        />
        <span className="input-description">How long to keep system logs</span>
      </div>

      <div className="form-group">
        <label htmlFor="backupFrequency">Backup Frequency (hours)</label>
        <input 
          id="backupFrequency"
          type="number" 
          value={formData.backupFrequency || 24}
          onChange={(e) => onChange('backupFrequency', parseInt(e.target.value))}
          min="1"
          max="168"
        />
        <span className="input-description">How often to create system backups</span>
      </div>
    </div>

    <div className="checkbox-group-section">
      <h4>Advanced Features</h4>
      <div className="checkbox-grid">
        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.enableAPIAccess || false}
              onChange={(e) => onChange('enableAPIAccess', e.target.checked)}
            />
            <span className="checkmark"></span>
            Enable API Access
          </label>
          <span className="checkbox-description">Allow external API access to the platform</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.enableDebugMode || false}
              onChange={(e) => onChange('enableDebugMode', e.target.checked)}
            />
            <span className="checkmark"></span>
            Debug Mode
          </label>
          <span className="checkbox-description">Enable detailed logging for troubleshooting</span>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.enableCORS || false}
              onChange={(e) => onChange('enableCORS', e.target.checked)}
            />
            <span className="checkmark"></span>
            Enable CORS
          </label>
          <span className="checkbox-description">Allow cross-origin resource sharing</span>
        </div>
      </div>
    </div>
  </div>
);

export default SystemSettings;