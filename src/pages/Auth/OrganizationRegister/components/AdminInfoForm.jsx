import React, { useState } from 'react';
import './AdminInfoForm.css';

const AdminInfoForm = ({ data, onChange }) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (field, value) => {
    onChange('admin', { ...data.admin, [field]: value });
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (data.admin.password && value !== data.admin.password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  return (
    <div className="admin-info-form">
      <h2>Administrator Account</h2>
      <p className="form-description">Create your admin account for this organization</p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            value={data.admin.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            value={data.admin.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            value={data.admin.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            placeholder="your.email@company.com"
          />
          <small>This will be your login email</small>
        </div>

        <div className="form-group">
          <label htmlFor="position">Position *</label>
          <input
            type="text"
            id="position"
            value={data.admin.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            required
            placeholder="CEO, Manager, etc."
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={data.admin.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+251 ..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            value={data.admin.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            minLength="8"
          />
          <small>Minimum 8 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            required
          />
          {passwordError && <span className="error-text">{passwordError}</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminInfoForm;
