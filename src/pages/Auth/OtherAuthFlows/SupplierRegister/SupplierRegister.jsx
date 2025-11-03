import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../../../services/api/authAPI';
import './SupplierRegister.css';

const SupplierRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    businessType: '',
    taxId: '',
    yearEstablished: '',
    employeeCount: '',
    
    // Step 2: Contact Information
    email: '',
    password: '',
    confirmPassword: '',
    contactPerson: '',
    phone: '',
    website: '',
    
    // Step 3: Business Details
    address: '',
    city: '',
    country: '',
    postalCode: '',
    businessDescription: '',
    categories: [],
    certifications: ''
  });

  const businessTypes = [
    'Manufacturer',
    'Distributor',
    'Wholesaler',
    'Retailer',
    'Service Provider',
    'Consultant',
    'Other'
  ];

  const productCategories = [
    'Electronics',
    'Office Supplies',
    'Furniture',
    'IT Equipment',
    'Raw Materials',
    'Packaging',
    'Safety Equipment',
    'Tools & Machinery',
    'Vehicles',
    'Other'
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (!formData.taxId.trim()) newErrors.taxId = 'Tax ID is required';
    }

    if (step === 2) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    if (step === 3) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (formData.categories.length === 0) newErrors.categories = 'Please select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (type === 'checkbox') {
      const { checked } = e.target;
      if (checked) {
        setFormData(prev => ({
          ...prev,
          categories: [...prev.categories, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          categories: prev.categories.filter(cat => cat !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare data for API in the format your backend expects
      const registrationData = {
        // Company information
        companyName: formData.companyName,
        businessType: formData.businessType,
        taxId: formData.taxId,
        yearEstablished: formData.yearEstablished || null,
        employeeCount: formData.employeeCount || null,
        
        // User account information
        email: formData.email,
        password: formData.password,
        fullName: formData.contactPerson,
        phone: formData.phone,
        website: formData.website || null,
        
        // Business details
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode || '',
        businessDescription: formData.businessDescription || '',
        categories: formData.categories,
        certifications: formData.certifications || '',
        
        // Role specification
        role: 'supplier_user'
      };

      console.log('Sending registration data:', registrationData);

      // Call the actual API
      const result = await authAPI.registerSupplier(registrationData);
      
      if (result.success) {
        alert('Supplier registration submitted successfully! Your account will be activated after verification.');
        navigate('/login');
      } else {
        setErrors({ submit: result.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Company Information</h3>
      <div className="form-group">
        <label>Company Name *</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          className={errors.companyName ? 'error' : ''}
          required
        />
        {errors.companyName && <span className="error-message">{errors.companyName}</span>}
      </div>
      
      <div className="form-group">
        <label>Business Type *</label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          className={errors.businessType ? 'error' : ''}
          required
        >
          <option value="">Select Business Type</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.businessType && <span className="error-message">{errors.businessType}</span>}
      </div>
      
      <div className="form-group">
        <label>Tax ID/VAT Number *</label>
        <input
          type="text"
          name="taxId"
          value={formData.taxId}
          onChange={handleInputChange}
          className={errors.taxId ? 'error' : ''}
          required
        />
        {errors.taxId && <span className="error-message">{errors.taxId}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Year Established</label>
          <input
            type="number"
            name="yearEstablished"
            value={formData.yearEstablished}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        
        <div className="form-group">
          <label>Employee Count</label>
          <select
            name="employeeCount"
            value={formData.employeeCount}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="501+">501+</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Contact Information</h3>
      <div className="form-group">
        <label>Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? 'error' : ''}
          required
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            required
            minLength="6"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        
        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'error' : ''}
            required
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label>Contact Person *</label>
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleInputChange}
          className={errors.contactPerson ? 'error' : ''}
          required
        />
        {errors.contactPerson && <span className="error-message">{errors.contactPerson}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? 'error' : ''}
            required
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
        
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Business Details</h3>
      <div className="form-group">
        <label>Business Address *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className={errors.address ? 'error' : ''}
          required
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={errors.city ? 'error' : ''}
            required
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>
        
        <div className="form-group">
          <label>Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={errors.country ? 'error' : ''}
            required
          />
          {errors.country && <span className="error-message">{errors.country}</span>}
        </div>
        
        <div className="form-group">
          <label>Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Product/Service Categories *</label>
        <div className="categories-grid">
          {productCategories.map(category => (
            <label key={category} className="checkbox-label">
              <input
                type="checkbox"
                value={category}
                checked={formData.categories.includes(category)}
                onChange={handleInputChange}
              />
              {category}
            </label>
          ))}
        </div>
        {errors.categories && <span className="error-message">{errors.categories}</span>}
      </div>
      
      <div className="form-group">
        <label>Business Description</label>
        <textarea
          name="businessDescription"
          value={formData.businessDescription}
          onChange={handleInputChange}
          rows="4"
          placeholder="Describe your business, products, and services..."
        />
      </div>
      
      <div className="form-group">
        <label>Certifications & Qualifications</label>
        <textarea
          name="certifications"
          value={formData.certifications}
          onChange={handleInputChange}
          rows="3"
          placeholder="List any relevant certifications, licenses, or qualifications..."
        />
      </div>
    </div>
  );

  return (
    <div className="supplier-register-container">
      <div className="supplier-register">
        <div className="register-header">
          <h2>Supplier Registration</h2>
          <p>Join our procurement platform as a supplier</p>
        </div>
        
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Company Info</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Contact Info</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Business Details</div>
        </div>
        
        {errors.submit && (
          <div className="error-banner">
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          
          <div className="form-actions">
            {step > 1 && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="btn-secondary"
                disabled={loading}
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="btn-primary"
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>
        
        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <p>
            Want to register as a buyer? <Link to="/organization/register">Register your organization</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegister;
