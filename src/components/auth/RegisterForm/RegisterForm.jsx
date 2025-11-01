import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterForm.css';

const RegisterForm = ({
  onRegister,
  isLoading = false,
  showLoginLink = true,
  redirectAfterRegister = true,
  className = '',
  availableRoles = [],
  companyDepartments = []
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Account Information
    password: '',
    confirmPassword: '',
    
    // Company Information
    companyName: '',
    department: '',
    jobTitle: '',
    userRole: '',
    
    // Terms
    agreeToTerms: false,
    subscribeToNewsletter: true
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  // Default roles and departments
  const defaultRoles = [
    { value: 'procurement_manager', label: 'Procurement Manager', icon: '👔' },
    { value: 'supplier', label: 'Supplier', icon: '👥' },
    { value: 'finance_manager', label: 'Finance Manager', icon: '💰' },
    { value: 'department_head', label: 'Department Head', icon: '🎯' },
    { value: 'viewer', label: 'Viewer', icon: '👀' }
  ];

  const defaultDepartments = [
    'Procurement',
    'Finance',
    'IT',
    'Operations',
    'Human Resources',
    'Marketing',
    'Sales',
    'Executive'
  ];

  const rolesToUse = availableRoles.length > 0 ? availableRoles : defaultRoles;
  const departmentsToUse = companyDepartments.length > 0 ? companyDepartments : defaultDepartments;

  // Calculate password strength
  useEffect(() => {
    const calculatePasswordStrength = (password) => {
      if (!password) return { score: 0, label: '', color: '' };
      
      let score = 0;
      const requirements = [
        password.length >= 8,
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
      ];

      score = requirements.filter(Boolean).length * 20;

      let label = '', color = '';
      if (score <= 20) { label = 'Weak'; color = '#ef4444'; }
      else if (score <= 40) { label = 'Fair'; color = '#f59e0b'; }
      else if (score <= 60) { label = 'Good'; color = '#3b82f6'; }
      else if (score <= 80) { label = 'Strong'; color = '#10b981'; }
      else { label = 'Very Strong'; color = '#059669'; }

      return { score, label, color };
    };

    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
          newErrors.phone = 'Please enter a valid phone number';
        }
        break;

      case 2: // Company Information
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
        if (!formData.userRole) newErrors.userRole = 'User role is required';
        break;

      case 3: // Account Information
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else {
          if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
          if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
          }
        }
        
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 4: // Terms
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }
        break;

      default:
        break;
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

  const handlePasswordToggle = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;

    try {
      const result = await (onRegister 
        ? onRegister(formData) 
        : mockRegister(formData)
      );

      if (result.success) {
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          companyName: '',
          department: '',
          jobTitle: '',
          userRole: '',
          agreeToTerms: false,
          subscribeToNewsletter: true
        });

        // Redirect if enabled
        if (redirectAfterRegister) {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please check your email to verify your account.',
              email: formData.email
            }
          });
        }
      } else {
        setErrors({ submit: result.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    }
  };

  // Mock registration function for demonstration
  const mockRegister = async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (userData.email && userData.password) {
          resolve({
            success: true,
            user: {
              id: Math.random().toString(36).substr(2, 9),
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.userRole,
              status: 'pending_verification'
            },
            message: 'Registration successful! Please check your email.'
          });
        } else {
          resolve({
            success: false,
            message: 'Registration failed. Please check your information.'
          });
        }
      }, 2000);
    });
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Personal Information';
      case 2: return 'Company Information';
      case 3: return 'Account Security';
      case 4: return 'Terms & Conditions';
      default: return 'Registration';
    }
  };

  const getStepSubtitle = (step) => {
    switch (step) {
      case 1: return 'Tell us about yourself';
      case 2: return 'Your company details';
      case 3: return 'Create secure credentials';
      case 4: return 'Review and agree to terms';
      default: return 'Complete your registration';
    }
  };

  return (
    <div className={`register-form-container ${className}`}>
      {/* Header */}
      <div className="register-header">
        <div className="register-logo">
          <div className="logo-icon">🏢</div>
          <h1 className="logo-text">ProcureFlow</h1>
        </div>
        <h2 className="register-title">Create Your Account</h2>
        <p className="register-subtitle">
          Join thousands of procurement professionals
        </p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="step-container">
            <div className={`step-circle ${currentStep >= step ? 'active' : ''}`}>
              {currentStep > step ? '✓' : step}
            </div>
            <div className="step-label">
              {step === 1 && 'Personal'}
              {step === 2 && 'Company'}
              {step === 3 && 'Security'}
              {step === 4 && 'Terms'}
            </div>
            {step < 4 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {/* Current Step Title */}
      <div className="step-header">
        <h3 className="step-title">{getStepTitle(currentStep)}</h3>
        <p className="step-subtitle">{getStepSubtitle(currentStep)}</p>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
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
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
                autoComplete="tel"
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
          </div>
        )}

        {/* Step 2: Company Information */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label htmlFor="companyName" className="form-label">
                Company Name *
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className={`form-input ${errors.companyName ? 'error' : ''}`}
                placeholder="Enter your company name"
                disabled={isLoading}
              />
              {errors.companyName && <div className="error-message">{errors.companyName}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department" className="form-label">
                  Department *
                </label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`form-select ${errors.department ? 'error' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Select Department</option>
                  {departmentsToUse.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <div className="error-message">{errors.department}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="jobTitle" className="form-label">
                  Job Title *
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className={`form-input ${errors.jobTitle ? 'error' : ''}`}
                  placeholder="e.g., Procurement Manager"
                  disabled={isLoading}
                />
                {errors.jobTitle && <div className="error-message">{errors.jobTitle}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">User Role *</label>
              <div className="role-selection">
                {rolesToUse.map((role) => (
                  <label key={role.value} className="role-option">
                    <input
                      type="radio"
                      name="userRole"
                      value={role.value}
                      checked={formData.userRole === role.value}
                      onChange={(e) => handleInputChange('userRole', e.target.value)}
                      className="role-input"
                      disabled={isLoading}
                    />
                    <div className="role-card">
                      <div className="role-icon">{role.icon}</div>
                      <div className="role-info">
                        <div className="role-name">{role.label}</div>
                        <div className="role-description">
                          {role.value === 'procurement_manager' && 'Manage procurement processes and suppliers'}
                          {role.value === 'supplier' && 'Respond to RFQs and manage bids'}
                          {role.value === 'finance_manager' && 'Approve purchases and manage budgets'}
                          {role.value === 'department_head' && 'Approve departmental requisitions'}
                          {role.value === 'viewer' && 'View reports and analytics'}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.userRole && <div className="error-message">{errors.userRole}</div>}
            </div>
          </div>
        )}

        {/* Step 3: Account Security */}
        {currentStep === 3 && (
          <div className="form-step">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <div className="input-container">
                <input
                  id="password"
                  type={showPassword.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => handlePasswordToggle('password')}
                  disabled={isLoading}
                >
                  {showPassword.password ? '🙈' : '👁️'}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-meter">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <div className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </div>
                </div>
              )}
              
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <div className="input-container">
                <input
                  id="confirmPassword"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
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
                <li className={formData.password.length >= 8 ? 'met' : ''}>
                  At least 8 characters long
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                  One lowercase letter
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                  One uppercase letter
                </li>
                <li className={/\d/.test(formData.password) ? 'met' : ''}>
                  One number
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'met' : ''}>
                  One special character (recommended)
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Terms & Conditions */}
        {currentStep === 4 && (
          <div className="form-step">
            <div className="terms-section">
              <div className="terms-content">
                <h4>Terms & Conditions</h4>
                <div className="terms-text">
                  <p>By creating an account, you agree to our:</p>
                  <ul>
                    <li><strong>Terms of Service:</strong> You agree to use ProcureFlow in compliance with all applicable laws and regulations.</li>
                    <li><strong>Privacy Policy:</strong> We collect and use your data as described in our privacy policy.</li>
                    <li><strong>Data Processing Agreement:</strong> Your company data will be processed securely and confidentially.</li>
                    <li><strong>Acceptable Use Policy:</strong> You will not misuse the platform or engage in fraudulent activities.</li>
                  </ul>
                  
                  <p><strong>Account Verification:</strong> Your account may require verification before full access is granted.</p>
                  <p><strong>Trial Period:</strong> New accounts include a 14-day free trial with full features.</p>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label large">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    disabled={isLoading}
                    className="checkbox-input"
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link> *
                  </span>
                </label>
                {errors.agreeToTerms && <div className="error-message">{errors.agreeToTerms}</div>}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.subscribeToNewsletter}
                    onChange={(e) => handleInputChange('subscribeToNewsletter', e.target.checked)}
                    disabled={isLoading}
                    className="checkbox-input"
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    Send me product updates, tips, and best practices
                  </span>
                </label>
              </div>
            </div>

            {/* Registration Summary */}
            <div className="registration-summary">
              <h4>Registration Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Name:</span>
                  <span className="summary-value">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Company:</span>
                  <span className="summary-value">{formData.companyName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Role:</span>
                  <span className="summary-value">
                    {rolesToUse.find(r => r.value === formData.userRole)?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="nav-button prev-button"
              onClick={prevStep}
              disabled={isLoading}
            >
              ← Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              type="button"
              className="nav-button next-button"
              onClick={nextStep}
              disabled={isLoading}
            >
              Next Step →
            </button>
          ) : (
            <button
              type="submit"
              className={`nav-button submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="submit-error">
            <div className="error-icon">❌</div>
            <div className="error-text">{errors.submit}</div>
          </div>
        )}

        {/* Success Tips */}
        {currentStep === 1 && !errors.submit && (
          <div className="registration-tips">
            <div className="tip-item">
              <span className="tip-icon">🔒</span>
              Your information is secure and encrypted
            </div>
            <div className="tip-item">
              <span className="tip-icon">⚡</span>
              Get started in less than 5 minutes
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              Choose the role that best fits your responsibilities
            </div>
          </div>
        )}
      </form>

      {/* Login Link */}
      {showLoginLink && (
        <div className="login-section">
          <p className="login-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </div>
      )}

      {/* Security Footer */}
      <div className="register-footer">
        <div className="security-info">
          <div className="security-item">
            <span className="security-icon">🔒</span>
            Enterprise-grade security
          </div>
          <div className="security-item">
            <span className="security-icon">📧</span>
            Support: onboarding@procureflow.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;