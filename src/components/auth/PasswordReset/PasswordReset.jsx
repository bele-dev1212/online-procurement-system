import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './PasswordReset.css';

const PasswordReset = ({
  onRequestReset,
  onVerifyCode,
  onResetPassword,
  isLoading = false,
  className = ''
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request, 2: Verify, 3: Reset, 4: Success
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });

  // Check for email in URL params (from login page)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  // Handle countdown timer for resend code
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateResetCode = (code) => {
    if (!code.trim()) return 'Reset code is required';
    if (code.length !== 6) return 'Reset code must be 6 digits';
    if (!/^\d+$/.test(code)) return 'Reset code must contain only numbers';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and numbers';
    }
    return '';
  };

  const validateConfirmPassword = (confirm, newPassword) => {
    if (!confirm) return 'Please confirm your password';
    if (confirm !== newPassword) return 'Passwords do not match';
    return '';
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 1: // Request reset
        newErrors.email = validateEmail(formData.email);
        break;

      case 2: // Verify code
        newErrors.resetCode = validateResetCode(formData.resetCode);
        break;

      case 3: // Reset password
        newErrors.newPassword = validatePassword(formData.newPassword);
        newErrors.confirmPassword = validateConfirmPassword(
          formData.confirmPassword,
          formData.newPassword
        );
        break;

      default:
        break;
    }

    // Remove empty error fields
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordToggle = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!validateStep(1)) return;

    try {
      const result = await (onRequestReset 
        ? onRequestReset(formData.email) 
        : mockRequestReset(formData.email)
      );

      if (result.success) {
        setSuccess('Reset code sent to your email');
        setStep(2);
        setCountdown(60); // 60 seconds countdown
      } else {
        setErrors({ submit: result.message || 'Failed to send reset code' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    try {
      const result = await (onVerifyCode 
        ? onVerifyCode(formData.email, formData.resetCode) 
        : mockVerifyCode(formData.email, formData.resetCode)
      );

      if (result.success) {
        setSuccess('Code verified successfully');
        setStep(3);
      } else {
        setErrors({ submit: result.message || 'Invalid reset code' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    try {
      const result = await (onResetPassword 
        ? onResetPassword(formData.email, formData.resetCode, formData.newPassword) 
        : mockResetPassword(formData.email, formData.resetCode, formData.newPassword)
      );

      if (result.success) {
        setSuccess('Password reset successfully');
        setStep(4);
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password reset successful. Please login with your new password.' }
          });
        }, 3000);
      } else {
        setErrors({ submit: result.message || 'Failed to reset password' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      const result = await (onRequestReset 
        ? onRequestReset(formData.email) 
        : mockRequestReset(formData.email)
      );

      if (result.success) {
        setSuccess('New code sent to your email');
        setCountdown(60);
      } else {
        setErrors({ submit: result.message || 'Failed to resend code' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Mock functions for demonstration
  const mockRequestReset = async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email) {
          resolve({ 
            success: true, 
            message: 'Reset code sent to your email',
            code: '123456' // For demo purposes
          });
        } else {
          resolve({ success: false, message: 'Email not found' });
        }
      }, 1500);
    });
  };

  const mockVerifyCode = async (email, code) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code === '123456') {
          resolve({ success: true, message: 'Code verified' });
        } else {
          resolve({ success: false, message: 'Invalid reset code' });
        }
      }, 1000);
    });
  };

  const mockResetPassword = async (email, code, newPassword) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code === '123456' && newPassword) {
          resolve({ success: true, message: 'Password reset successful' });
        } else {
          resolve({ success: false, message: 'Failed to reset password' });
        }
      }, 1500);
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;

    let label = '', color = '';
    if (strength <= 25) { label = 'Weak'; color = '#ef4444'; }
    else if (strength <= 50) { label = 'Fair'; color = '#f59e0b'; }
    else if (strength <= 75) { label = 'Good'; color = '#3b82f6'; }
    else { label = 'Strong'; color = '#10b981'; }

    return { strength, label, color };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className={`password-reset-container ${className}`}>
      <div className="password-reset-header">
        <div className="reset-logo">
          <div className="logo-icon">🏢</div>
          <h1 className="logo-text">ProcureFlow</h1>
        </div>
        <h2 className="reset-title">
          {step === 1 && 'Reset Your Password'}
          {step === 2 && 'Verify Reset Code'}
          {step === 3 && 'Create New Password'}
          {step === 4 && 'Password Reset Successfully'}
        </h2>
        <p className="reset-subtitle">
          {step === 1 && 'Enter your email to receive a reset code'}
          {step === 2 && `Enter the 6-digit code sent to ${formData.email}`}
          {step === 3 && 'Create a new password for your account'}
          {step === 4 && 'Your password has been reset successfully'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="step-container">
            <div className={`step-circle ${step >= stepNumber ? 'active' : ''}`}>
              {step > stepNumber ? '✓' : stepNumber}
            </div>
            <div className="step-label">
              {stepNumber === 1 && 'Request'}
              {stepNumber === 2 && 'Verify'}
              {stepNumber === 3 && 'Reset'}
              {stepNumber === 4 && 'Complete'}
            </div>
            {stepNumber < 4 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {/* Step 1: Request Reset */}
      {step === 1 && (
        <form onSubmit={handleRequestReset} className="reset-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-container">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email address"
                disabled={isLoading}
                autoComplete="email"
              />
              <div className="input-icon">📧</div>
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <button
            type="submit"
            className={`reset-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="button-spinner"></div>
                Sending Code...
              </>
            ) : (
              'Send Reset Code'
            )}
          </button>
        </form>
      )}

      {/* Step 2: Verify Code */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="reset-form">
          <div className="form-group">
            <label htmlFor="resetCode" className="form-label">
              6-Digit Reset Code
            </label>
            <div className="input-container">
              <input
                id="resetCode"
                type="text"
                value={formData.resetCode}
                onChange={(e) => handleInputChange('resetCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`form-input ${errors.resetCode ? 'error' : ''}`}
                placeholder="Enter 6-digit code"
                disabled={isLoading}
                maxLength={6}
              />
              <div className="input-icon">🔢</div>
            </div>
            {errors.resetCode && <div className="error-message">{errors.resetCode}</div>}
            
            <div className="code-actions">
              <button
                type="button"
                className={`resend-button ${countdown > 0 ? 'disabled' : ''}`}
                onClick={handleResendCode}
                disabled={countdown > 0 || isLoading}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              className={`reset-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Reset Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="reset-form">
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div className="input-container">
              <input
                id="newPassword"
                type={showPassword.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="Enter new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <div className="input-icon">🔒</div>
              <button
                type="button"
                className="password-toggle"
                onClick={() => handlePasswordToggle('newPassword')}
                disabled={isLoading}
              >
                {showPassword.newPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${passwordStrength.strength}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <div className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </div>
              </div>
            )}
            
            {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <div className="input-container">
              <input
                id="confirmPassword"
                type={showPassword.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <div className="input-icon">🔒</div>
              <button
                type="button"
                className="password-toggle"
                onClick={() => handlePasswordToggle('confirmPassword')}
                disabled={isLoading}
              >
                {showPassword.confirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.newPassword.length >= 8 ? 'met' : ''}>
                At least 8 characters long
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'met' : ''}>
                One lowercase letter
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'met' : ''}>
                One uppercase letter
              </li>
              <li className={/\d/.test(formData.newPassword) ? 'met' : ''}>
                One number
              </li>
            </ul>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={() => setStep(2)}
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              className={`reset-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="success-step">
          <div className="success-icon">✅</div>
          <h3 className="success-title">Password Reset Successful!</h3>
          <p className="success-message">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
          
          <div className="success-actions">
            <button
              className="login-redirect-button"
              onClick={handleBackToLogin}
            >
              Go to Login
            </button>
            <Link to="/" className="home-link">
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="success-message-banner">
          <div className="success-icon">✅</div>
          <div className="success-text">{success}</div>
        </div>
      )}

      {errors.submit && (
        <div className="error-message-banner">
          <div className="error-icon">❌</div>
          <div className="error-text">{errors.submit}</div>
        </div>
      )}

      {/* Back to Login */}
      <div className="back-to-login">
        <button
          type="button"
          className="back-link"
          onClick={handleBackToLogin}
        >
          ← Back to Login
        </button>
      </div>

      {/* Security Info */}
      <div className="security-footer">
        <div className="security-item">
          <span className="security-icon">🔒</span>
          Your security is our priority
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;