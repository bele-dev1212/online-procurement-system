import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get redirect path or message from navigation state
  const from = location.state?.from?.pathname || '/dashboard';
  const message = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Login attempt started');
    console.log('📝 Form data:', formData);
    setLoading(true);
    setError('');

    try {
      console.log('📤 Sending request to: http://localhost:5000/api/auth/login');
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      const result = await response.json();
      console.log('📦 Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      console.log('✅ Login successful!');
      console.log('💾 Storing token:', result.data.token);
      console.log('👤 Storing user:', result.data.user);
      console.log('🏢 Storing organization:', result.data.organization);

      // Store token and user data
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      localStorage.setItem('organization', JSON.stringify(result.data.organization));

      console.log('✅ Data stored in localStorage');
      console.log('🔄 Redirecting to:', from);
      
      // Redirect to intended page or dashboard
      navigate(from, { replace: true });

    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      console.log('🏁 Login process finished');
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡🏢</span>
            <span className="logo-text">ፈጣን ግዢ</span>
          </Link>
          <h1>Sign In</h1>
          <p>Welcome back to your procurement dashboard</p>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@company.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/organization/register" className="link">
              Create organization
            </Link>
          </p>
          <p className="supplier-link">
            Are you a supplier?{' '}
            <Link to="/supplier/register" className="link">
              Register as supplier
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
