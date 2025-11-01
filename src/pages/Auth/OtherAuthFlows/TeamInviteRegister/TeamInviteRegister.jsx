import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TeamInviteRegister.css';

const TeamInviteRegister = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid invitation');
      }

      setInvitation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to accept invitation');
      }

      // Redirect to login or dashboard
      navigate('/login', { 
        state: { message: 'Account created successfully! Please sign in.' } 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading invitation...</div>;
  }

  if (error && !invitation) {
    return (
      <div className="invitation-error">
        <h2>Invalid Invitation</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="team-invite-register">
      <div className="register-container">
        <div className="register-header">
          <h1>Join {invitation?.organizationName}</h1>
          <p>You've been invited to join this organization on ፈጣን ግዢ</p>
        </div>

        <div className="invitation-details">
          <p><strong>Role:</strong> {invitation?.role}</p>
          <p><strong>Email:</strong> {invitation?.email}</p>
          <p><strong>Invited by:</strong> {invitation?.inviterName}</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="invitation-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Join Organization'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamInviteRegister;
