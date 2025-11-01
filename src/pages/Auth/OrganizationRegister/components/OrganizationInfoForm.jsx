import React from 'react';
import './OrganizationInfoForm.css';

const OrganizationInfoForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange('organization', { ...data.organization, [field]: value });
  };

  return (
    <div className="organization-info-form">
      <h2>Organization Information</h2>
      <p className="form-description">Tell us about your company</p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="companyName">Company Name *</label>
          <input
            type="text"
            id="companyName"
            value={data.organization.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="industry">Industry *</label>
          <select
            id="industry"
            value={data.organization.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            required
          >
            <option value="">Select Industry</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="construction">Construction</option>
            <option value="agriculture">Agriculture</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="companySize">Company Size *</label>
          <select
            id="companySize"
            value={data.organization.size || ''}
            onChange={(e) => handleChange('size', e.target.value)}
            required
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="companyEmail">Company Email</label>
          <input
            type="email"
            id="companyEmail"
            value={data.organization.contactEmail || ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            placeholder="info@company.com"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={data.organization.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={data.organization.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+251 ..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            value={data.organization.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://company.com"
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationInfoForm;
