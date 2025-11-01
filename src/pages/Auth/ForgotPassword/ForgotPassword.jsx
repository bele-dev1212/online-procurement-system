import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password">
        <div className="password-container">
          <div className="success-icon">✅</div>
          <h1>Check Your Email</h1>
          <p>We've sent a password reset link to <strong>{email}</strong></p>
          <div className="success-actions">
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
          <div className="help-text">
            <p>Didn't receive the email?</p>
            <ul>
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password">
      <div className="password-container">
        <div className="password-header">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡🏢</span>
            <span className="logo-text">ፈጣን ግዢ</span>
          </Link>
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@company.com"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="password-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
