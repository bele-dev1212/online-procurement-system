import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './EmailVerification.css';

const EmailVerification = () => {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="email-verification">
      <div className="verification-container">
        <div className="verification-icon">✉️</div>
        <h1>Verify Your Email</h1>
        <p>We've sent a verification link to <strong>{email}</strong></p>
        
        <div className="verification-steps">
          <div className="step">
            <span className="step-number">1</span>
            <span className="step-text">Check your email inbox</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span className="step-text">Click the verification link</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span className="step-text">Start using ፈጣን ግዢ</span>
          </div>
        </div>

        <div className="verification-actions">
          <button className="btn btn-secondary">Resend Email</button>
          <Link to="/login" className="btn btn-primary">Continue to Login</Link>
        </div>

        <div className="verification-help">
          <p>Didn't receive the email?</p>
          <ul>
            <li>Check your spam folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
