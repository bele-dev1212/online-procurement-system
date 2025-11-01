import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import './OrganizationSettings.css';

const OrganizationSettings = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${user.organization}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
        setOriginalData(data);
      } else {
        addNotification('error', 'Failed to load organization data');
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
      addNotification('error', 'Error loading organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (!organization) return;
    
    const updatedOrg = { ...organization, [field]: value };
    setOrganization(updatedOrg);
    
    // Check if there are changes
    const hasChanges = JSON.stringify(updatedOrg) !== JSON.stringify(originalData);
    setHasChanges(hasChanges);
  };

  const handleSave = async () => {
    if (!hasChanges || !organization) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/organizations/${user.organization}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organization)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setOriginalData(updatedData);
        setHasChanges(false);
        addNotification('success', 'Organization settings updated successfully');
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.message || 'Failed to update organization settings');
      }
    } catch (error) {
      console.error('Error saving organization settings:', error);
      addNotification('error', 'Error saving organization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setOrganization(originalData);
    setHasChanges(false);
  };

  const validateForm = () => {
    if (!organization) return ['Organization data not loaded'];
    
    const errors = [];
    if (!organization.name?.trim()) errors.push('Company name is required');
    if (!organization.email?.trim()) errors.push('Email is required');
    if (organization.email && !/\S+@\S+\.\S+/.test(organization.email)) {
      errors.push('Valid email is required');
    }
    return errors;
  };

  if (loading) {
    return (
      <div className="organization-settings">
        <div className="loading-spinner"></div>
        <p>Loading organization settings...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="organization-settings">
        <div className="error-state">
          <h2>Unable to load organization settings</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button onClick={loadOrganizationData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formErrors = validateForm();
  const canSave = hasChanges && formErrors.length === 0;

  return (
    <div className="organization-settings">
      <div className="settings-header">
        <h1>Organization Settings</h1>
        <p>Manage your company profile and preferences</p>
      </div>

      <div className="settings-content">
        {/* Company Information Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Company Information</h2>
            <div className="section-badge">Required</div>
          </div>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={organization.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter company name"
                  className={!organization.name ? 'error' : ''}
                />
                {!organization.name && (
                  <div className="error-message">Company name is required</div>
                )}
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  value={organization.industry || ''}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  placeholder="Enter industry"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company Size</label>
                <input
                  type="text"
                  value={organization.size || ''}
                  onChange={(e) => handleChange('size', e.target.value)}
                  placeholder="Enter company size"
                />
              </div>
              <div className="form-group">
                <label>Primary Currency</label>
                <input
                  type="text"
                  value={organization.currency || ''}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  placeholder="Enter currency code"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={organization.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter company address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tax ID / VAT Number</label>
                <input
                  type="text"
                  value={organization.taxId || ''}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  placeholder="Enter tax identification number"
                />
              </div>
              <div className="form-group">
                <label>Business Registration Number</label>
                <input
                  type="text"
                  value={organization.registrationNumber || ''}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  placeholder="Enter registration number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Contact Information</h2>
            <div className="section-badge">Required</div>
          </div>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={organization.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={organization.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={organization.email && !/\S+@\S+\.\S+/.test(organization.email) ? 'error' : ''}
                />
                {organization.email && !/\S+@\S+\.\S+/.test(organization.email) && (
                  <div className="error-message">Please enter a valid email address</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={organization.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>System Preferences</h2>
            <div className="section-badge">Optional</div>
          </div>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Default Language</label>
                <input
                  type="text"
                  value={organization.language || ''}
                  onChange={(e) => handleChange('language', e.target.value)}
                  placeholder="Enter language code"
                />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <input
                  type="text"
                  value={organization.timezone || ''}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  placeholder="Enter timezone"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <div className="actions-left">
            {hasChanges && (
              <span className="changes-indicator">
                You have unsaved changes
              </span>
            )}
          </div>
          <div className="actions-right">
            {hasChanges && (
              <button 
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={saving}
              >
                Discard Changes
              </button>
            )}
            <button 
              onClick={handleSave}
              className="btn btn-primary"
              disabled={!canSave || saving}
            >
              {saving ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Validation Errors */}
        {formErrors.length > 0 && (
          <div className="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSettings;
