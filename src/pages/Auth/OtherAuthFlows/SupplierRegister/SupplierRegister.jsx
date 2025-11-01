import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SupplierRegister.css';

const SupplierRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    businessType: '',
    products: '',
    taxId: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/supplier/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Redirect to supplier dashboard or verification
      navigate('/supplier/dashboard', { 
        state: { message: 'Supplier account created successfully!' } 
      });

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supplier-register">
      <div className="register-container">
        <div className="register-header">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡🏢</span>
            <span className="logo-text">ፈጣን ግዢ</span>
          </Link>
          <h1>Supplier Registration</h1>
          <p>Join our network of trusted suppliers</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="supplier-form">
          <div className="form-section">
            <h3>Company Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person *</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessType">Business Type *</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="retailer">Retailer</option>
                  <option value="service">Service Provider</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="products">Products/Services *</label>
                <textarea
                  id="products"
                  name="products"
                  value={formData.products}
                  onChange={handleChange}
                  required
                  placeholder="Describe your products or services"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId">Tax ID (TIN) *</label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  required
                  placeholder="Ethiopian TIN"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Account Security</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Supplier'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
          <p>
            Looking for organization registration?{' '}
            <Link to="/organization/register" className="link">
              Register organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegister;
