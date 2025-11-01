import React, { useState } from 'react';
import './OrganizationSettings.css';

const OrganizationSettings = () => {
  const [organization, setOrganization] = useState({
    name: 'ABC Corporation',
    industry: 'Manufacturing',
    size: '50-100',
    address: 'Addis Ababa, Ethiopia',
    phone: '+251 11 123 4567',
    email: 'contact@abccorp.com',
    currency: 'ETB',
    language: 'en',
    timezone: 'Africa/Addis_Ababa'
  });

  const handleSave = () => {
    // Save organization settings
    console.log('Saving organization settings:', organization);
  };

  return (
    <div className="organization-settings">
      <div className="settings-header">
        <h1>Organization Settings</h1>
        <p>Manage your company profile and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Company Information</h2>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={organization.name}
                  onChange={(e) => setOrganization({...organization, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <select
                  value={organization.industry}
                  onChange={(e) => setOrganization({...organization, industry: e.target.value})}
                >
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company Size</label>
                <select
                  value={organization.size}
                  onChange={(e) => setOrganization({...organization, size: e.target.value})}
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>
              <div className="form-group">
                <label>Primary Currency</label>
                <select
                  value={organization.currency}
                  onChange={(e) => setOrganization({...organization, currency: e.target.value})}
                >
                  <option value="ETB">Ethiopian Birr (ETB)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={organization.address}
                onChange={(e) => setOrganization({...organization, address: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Contact Information</h2>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={organization.phone}
                  onChange={(e) => setOrganization({...organization, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={organization.email}
                  onChange={(e) => setOrganization({...organization, email: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSave} className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
