import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = ({
  isLoading = false,
  error = null,
  showForgotPassword = true,
  showRegisterLink = true,
  redirectAfterLogin = true,
  className = '',
  demoAccounts = []
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Get redirect path from location state or default to appropriate dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

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

  const getRedirectPath = (userRole) => {
    // Define role-based redirect paths
    const rolePaths = {
      super_admin: '/super-admin/dashboard',
      admin: '/dashboard',
      manager: '/dashboard',
      procurement_manager: '/dashboard',
      supplier: '/supplier/dashboard',
      viewer: '/dashboard',
      user: '/dashboard'
    };

    return rolePaths[userRole] || '/dashboard';
  };

  const handleDemoLogin = async (demoAccount) => {
    setFormData({
      email: demoAccount.email,
      password: demoAccount.password,
      rememberMe: false
    });
    
    try {
      setIsSubmitting(true);
      const credentials = {
        email: demoAccount.email,
        password: demoAccount.password
      };

      const result = await login(credentials);

      if (result.success) {
        const redirectPath = getRedirectPath(result.user.role);
        
        if (redirectAfterLogin) {
          navigate(redirectPath, { replace: true });
        }
      } else {
        setErrors({ submit: result.message || 'Demo login failed' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Demo login error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoginAttempts(prev => prev + 1);

    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      // Save email to localStorage if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Call the auth context login which should connect to your backend
      const result = await login(credentials);

      if (result.success) {
        const redirectPath = getRedirectPath(result.user.role);
        
        // Reset form
        setFormData({
          email: formData.rememberMe ? formData.email : '',
          password: '',
          rememberMe: formData.rememberMe
        });
        setErrors({});

        // Redirect if enabled
        if (redirectAfterLogin) {
          navigate(redirectPath, { replace: true });
        }
      } else {
        setErrors({ submit: result.message || 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || 
                error.message || 
                'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSubmitting = isLoading || isSubmitting;
  const hasError = error || errors.submit;

  return (
    <div className={`login-form-container ${className}`}>
      <div className="login-header">
        <div className="login-logo">
          <div className="logo-icon">🏢</div>
          <h1 className="logo-text">ProcureFlow</h1>
        </div>
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your procurement account</p>
      </div>

      {/* Demo Accounts Section */}
      {demoAccounts.length > 0 && (
        <div className="demo-accounts-section">
          <h3 className="demo-section-title">Quick Demo Access</h3>
          <div className="demo-accounts-grid">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                className="demo-account-btn"
                onClick={() => handleDemoLogin(account)}
                disabled={currentSubmitting}
                type="button"
              >
                <div className="demo-account-role">{account.role}</div>
                <div className="demo-account-email">{account.email}</div>
                <div className="demo-account-name">{account.name}</div>
              </button>
            ))}
          </div>
          <div className="demo-section-divider">
            <span>Or sign in with your account</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        {/* Email Field */}
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
              placeholder="Enter your email"
              disabled={currentSubmitting}
              autoComplete="email"
              required
            />
            <div className="input-icon">📧</div>
          </div>
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        {/* Password Field */}
        <div className="form-group">
          <div className="password-label-row">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            {showForgotPassword && (
              <Link 
                to="/forgot-password" 
                className="forgot-password-link"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="input-container">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={currentSubmitting}
              autoComplete="current-password"
              required
            />
            <div className="input-icon">🔒</div>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={currentSubmitting}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        {/* Remember Me & Security Info */}
        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              disabled={currentSubmitting}
              className="checkbox-input"
            />
            <span className="checkmark"></span>
            Remember me
          </label>

          {loginAttempts > 2 && (
            <div className="security-alert">
              ⚠️ Multiple failed attempts may lock your account
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`login-button ${currentSubmitting ? 'loading' : ''}`}
          disabled={currentSubmitting}
        >
          {currentSubmitting ? (
            <>
              <div className="button-spinner"></div>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Error Message */}
        {hasError && (
          <div className="submit-error">
            <div className="error-icon">❌</div>
            <div className="error-text">{error || errors.submit}</div>
          </div>
        )}

        {/* Helpful Tips */}
        {loginAttempts === 0 && !hasError && (
          <div className="login-tips">
            <div className="tip-item">
              <span className="tip-icon">💡</span>
              Use your organization email and password
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔐</span>
              Contact admin if you forgot your credentials
            </div>
          </div>
        )}
      </form>

      {/* Register Link */}
      {showRegisterLink && (
        <div className="register-section">
          <p className="register-text">
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Create one here
            </Link>
          </p>
        </div>
      )}

      {/* Security Footer */}
      <div className="login-footer">
        <div className="security-info">
          <div className="security-item">
            <span className="security-icon">🔒</span>
            Secure Authentication
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;