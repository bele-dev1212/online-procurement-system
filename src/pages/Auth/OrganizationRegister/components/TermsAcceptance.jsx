import React from 'react';
import './TermsAcceptance.css';

const TermsAcceptance = ({ data, onChange }) => {
  const handleTermsChange = (field, value) => {
    onChange('terms', { ...data.terms, [field]: value });
  };

  return (
    <div className="terms-acceptance">
      <h2>Terms & Conditions</h2>
      <p className="form-description">Please review and accept the terms to continue</p>

      <div className="terms-content">
        <div className="terms-section">
          <h3>Terms of Service</h3>
          <div className="terms-text">
            <p>By creating an organization account on ፈጣን ግዢ, you agree to:</p>
            <ul>
              <li>Use the platform in compliance with Ethiopian laws and regulations</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service only for legitimate business purposes</li>
              <li>Respect intellectual property rights</li>
              <li>Be responsible for all activities under your organization</li>
            </ul>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={data.terms.acceptedTerms || false}
                onChange={(e) => handleTermsChange('acceptedTerms', e.target.checked)}
                required
              />
              I accept the Terms of Service *
            </label>
          </div>
        </div>

        <div className="terms-section">
          <h3>Privacy Policy</h3>
          <div className="terms-text">
            <p>We are committed to protecting your data:</p>
            <ul>
              <li>We collect only necessary business information</li>
              <li>Your data is stored securely in Ethiopia</li>
              <li>We do not share your data with third parties without consent</li>
              <li>You have the right to access and delete your data</li>
            </ul>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={data.terms.acceptedPrivacy || false}
                onChange={(e) => handleTermsChange('acceptedPrivacy', e.target.checked)}
                required
              />
              I accept the Privacy Policy *
            </label>
          </div>
        </div>

        <div className="terms-section">
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={data.terms.newsletter || false}
                onChange={(e) => handleTermsChange('newsletter', e.target.checked)}
              />
              Send me product updates and tips (optional)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptance;
