import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import './UserSettings.css';

const UserSettings = () => {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    updatePreferences,
    uploadAvatar,
    loading 
  } = useAuth();
  
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    bio: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    theme: 'light',
    itemsPerPage: 25,
    autoRefresh: true,
    defaultView: 'dashboard'
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      // Initialize forms with user data
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        bio: user.bio || ''
      });

      setPreferencesForm({
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'UTC',
        dateFormat: user.preferences?.dateFormat || 'MM/DD/YYYY',
        timeFormat: user.preferences?.timeFormat || '12h',
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? false,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        theme: user.preferences?.theme || 'light',
        itemsPerPage: user.preferences?.itemsPerPage || 25,
        autoRefresh: user.preferences?.autoRefresh ?? true,
        defaultView: user.preferences?.defaultView || 'dashboard'
      });

      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const validateProfile = () => {
    const newErrors = {};

    if (!profileForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profileForm.phone && !/^\+?[\d\s-()]+$/.test(profileForm.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      addNotification('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(profileForm);
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to update profile: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      addNotification('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
      addNotification('Password changed successfully!', 'success');
    } catch (error) {
      addNotification('Failed to change password: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await updatePreferences(preferencesForm);
      addNotification('Preferences updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to update preferences: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      addNotification('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      addNotification('Image size must be less than 5MB', 'error');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    setIsLoading(true);
    try {
      await uploadAvatar(file);
      addNotification('Profile picture updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to upload profile picture: ' + error.message, 'error');
      setAvatarPreview(user.avatar); // Revert to previous avatar
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // This would typically call an API to delete the account
    addNotification('Account deletion feature would be implemented here', 'info');
    setShowDeleteModal(false);
  };

  const handleInputChange = (form, setForm) => (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];

    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '#e74c3c'
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  if (loading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="user-settings-container">
      <div className="settings-header">
        <h1>User Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              ⚙️ Preferences
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
            <button
              className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              💻 Sessions
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <p className="section-description">
                Update your personal information and profile details
              </p>

              <form onSubmit={handleProfileUpdate} className="settings-form">
                <div className="avatar-section">
                  <div className="avatar-upload">
                    <div className="avatar-preview">
                      <img
                        src={avatarPreview || '/default-avatar.png'}
                        alt="Profile"
                        className="avatar-image"
                      />
                      <div className="avatar-overlay">
                        <span>📷</span>
                        <span>Change Photo</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="avatar-input"
                    />
                  </div>
                  <div className="avatar-info">
                    <h4>Profile Picture</h4>
                    <p>Recommended: Square image, at least 200x200 pixels</p>
                    <p>Maximum file size: 5MB</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName" className="required">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleInputChange(profileForm, setProfileForm)}
                      className={errors.firstName ? 'error' : ''}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <span className="error-message">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="required">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleInputChange(profileForm, setProfileForm)}
                      className={errors.lastName ? 'error' : ''}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <span className="error-message">{errors.lastName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="required">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleInputChange(profileForm, setProfileForm)}
                      className={errors.email ? 'error' : ''}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleInputChange(profileForm, setProfileForm)}
                      className={errors.phone ? 'error' : ''}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      name="department"
                      value={profileForm.department}
                      onChange={handleInputChange(profileForm, setProfileForm)}
                    >
                      <option value="">Select Department</option>
                      <option value="procurement">Procurement</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                      <option value="it">IT</option>
                      <option value="hr">Human Resources</option>
                      <option value="management">Management</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="position">Position</label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={profileForm.position}
                      onChange={handleInputChange(profileForm, setProfileForm)}
                      placeholder="Your job title"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleInputChange(profileForm, setProfileForm)}
                      rows="4"
                      placeholder="Tell us a little about yourself..."
                      maxLength="500"
                    />
                    <div className="character-count">
                      {profileForm.bio.length}/500 characters
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Application Preferences</h2>
              <p className="section-description">
                Customize your experience with the application
              </p>

              <form onSubmit={handlePreferencesUpdate} className="settings-form">
                <div className="preferences-grid">
                  <div className="preference-group">
                    <h4>Regional Settings</h4>
                    
                    <div className="form-group">
                      <label htmlFor="language">Language</label>
                      <select
                        id="language"
                        name="language"
                        value={preferencesForm.language}
                        onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="timezone">Timezone</label>
                      <select
                        id="timezone"
                        name="timezone"
                        value={preferencesForm.timezone}
                        onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time (EST)</option>
                        <option value="CST">Central Time (CST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                        <option value="GMT">Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="dateFormat">Date Format</label>
                      <select
                        id="dateFormat"
                        name="dateFormat"
                        value={preferencesForm.dateFormat}
                        onChange={handleInputChange(preferencesForm, setPreferencesForm)}
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
                        name="timeFormat"
                        value={preferencesForm.timeFormat}
                        onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>

                  <div className="preference-group">
                    <h4>Display & Interface</h4>
                    
                    <div className="form-group">
                      <label htmlFor="theme">Theme</label>
                      <select
                        id="theme"
                        name="theme"
                        value={preferencesForm.theme}
                        onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="itemsPerPage">Items Per Page</label>
                      <select
                        id="itemsPerPage"
                        name="itemsPerPage"
                        value={preferencesForm.itemsPerPage}
                        onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                      >
                        <option value="10">10 items</option>
                        <option value="25">25 items</option>
                        <option value="50">50 items</option>
                        <option value="100">100 items</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="defaultView">Default View</label>
                      <select
                        id="defaultView"
                        name="defaultView"
                        value={preferencesForm.defaultView}
                        onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                      >
                        <option value="dashboard">Dashboard</option>
                        <option value="procurement">Procurement</option>
                        <option value="inventory">Inventory</option>
                        <option value="suppliers">Suppliers</option>
                      </select>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="autoRefresh"
                          checked={preferencesForm.autoRefresh}
                          onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                        />
                        <span className="checkmark"></span>
                        Enable Auto Refresh
                      </label>
                      <p className="checkbox-help">
                        Automatically refresh data every 5 minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-description">
                Manage your password and security preferences
              </p>

              <div className="security-actions">
                <div className="security-card">
                  <div className="security-info">
                    <h4>🔒 Password</h4>
                    <p>Last changed: {user?.passwordLastChanged ? new Date(user.passwordLastChanged).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="btn-secondary"
                  >
                    Change Password
                  </button>
                </div>

                <div className="security-card">
                  <div className="security-info">
                    <h4>🔑 Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn-outline">
                    {user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>

                <div className="security-card">
                  <div className="security-info">
                    <h4>📱 Recovery Options</h4>
                    <p>Set up account recovery methods</p>
                  </div>
                  <button className="btn-outline">
                    Manage Recovery
                  </button>
                </div>
              </div>

              <div className="danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-actions">
                  <div className="danger-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-danger"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">
                Choose how you want to be notified about important events
              </p>

              <form onSubmit={handlePreferencesUpdate} className="settings-form">
                <div className="notification-groups">
                  <div className="notification-group">
                    <h4>Notification Methods</h4>
                    
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={preferencesForm.emailNotifications}
                          onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                        />
                        <span className="checkmark"></span>
                        Email Notifications
                      </label>
                      <p className="checkbox-help">
                        Receive notifications via email
                      </p>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="pushNotifications"
                          checked={preferencesForm.pushNotifications}
                          onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                        />
                        <span className="checkmark"></span>
                        Push Notifications
                      </label>
                      <p className="checkbox-help">
                        Receive browser push notifications
                      </p>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={preferencesForm.smsNotifications}
                          onChange={handleInputChange(preferencesForm, setPreferencesForm)}
                        />
                        <span className="checkmark"></span>
                        SMS Notifications
                      </label>
                      <p className="checkbox-help">
                        Receive text message notifications
                      </p>
                    </div>
                  </div>

                  <div className="notification-group">
                    <h4>Notification Types</h4>
                    
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        Order Updates
                      </label>
                      <p className="checkbox-help">
                        Notifications about purchase order status
                      </p>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        Approval Requests
                      </label>
                      <p className="checkbox-help">
                        When approval is required for purchases
                      </p>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        Supplier Updates
                      </label>
                      <p className="checkbox-help">
                        Important updates from suppliers
                      </p>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        System Alerts
                      </label>
                      <p className="checkbox-help">
                        Important system notifications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="settings-section">
              <h2>Active Sessions</h2>
              <p className="section-description">
                Manage your active login sessions across different devices
              </p>

              <div className="sessions-list">
                <div className="session-card current">
                  <div className="session-info">
                    <h4>Current Session</h4>
                    <div className="session-details">
                      <span className="device">🖥️ Chrome on Windows</span>
                      <span className="location">New York, USA</span>
                      <span className="ip">IP: 192.168.1.1</span>
                      <span className="last-active">
                        Last active: Just now
                      </span>
                    </div>
                  </div>
                  <div className="session-status">
                    <span className="status-badge active">Active</span>
                  </div>
                </div>

                <div className="session-card">
                  <div className="session-info">
                    <h4>Mobile Session</h4>
                    <div className="session-details">
                      <span className="device">📱 Safari on iOS</span>
                      <span className="location">New York, USA</span>
                      <span className="ip">IP: 192.168.1.2</span>
                      <span className="last-active">
                        Last active: 2 hours ago
                      </span>
                    </div>
                  </div>
                  <button className="btn-outline btn-sm">
                    Revoke
                  </button>
                </div>

                <div className="session-card">
                  <div className="session-info">
                    <h4>Tablet Session</h4>
                    <div className="session-details">
                      <span className="device">📱 Chrome on Android</span>
                      <span className="location">Boston, USA</span>
                      <span className="ip">IP: 192.168.1.3</span>
                      <span className="last-active">
                        Last active: 1 day ago
                      </span>
                    </div>
                  </div>
                  <button className="btn-outline btn-sm">
                    Revoke
                  </button>
                </div>
              </div>

              <div className="session-actions">
                <button className="btn-secondary">
                  Revoke All Other Sessions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="required">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handleInputChange(passwordForm, setPasswordForm)}
              className={errors.currentPassword ? 'error' : ''}
              placeholder="Enter your current password"
            />
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="required">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handleInputChange(passwordForm, setPasswordForm)}
              className={errors.newPassword ? 'error' : ''}
              placeholder="Enter your new password"
            />
            {passwordForm.newPassword && (
              <div className="password-strength">
                <div 
                  className="strength-bar"
                  style={{
                    width: `${passwordStrength.strength}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
                <span className="strength-label">{passwordStrength.label}</span>
              </div>
            )}
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="required">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handleInputChange(passwordForm, setPasswordForm)}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="password-requirements">
            <h5>Password Requirements:</h5>
            <ul>
              <li className={passwordForm.newPassword.length >= 8 ? 'met' : ''}>
                At least 8 characters long
              </li>
              <li className={/(?=.*[a-z])/.test(passwordForm.newPassword) ? 'met' : ''}>
                One lowercase letter
              </li>
              <li className={/(?=.*[A-Z])/.test(passwordForm.newPassword) ? 'met' : ''}>
                One uppercase letter
              </li>
              <li className={/(?=.*\d)/.test(passwordForm.newPassword) ? 'met' : ''}>
                One number
              </li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="small"
      >
        <div className="delete-confirmation">
          <div className="warning-icon">⚠️</div>
          <h3>Are you sure you want to delete your account?</h3>
          <p>
            This action cannot be undone. This will permanently delete your account 
            and remove all your data from our servers.
          </p>
          
          <div className="delete-actions">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="btn-danger"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserSettings;