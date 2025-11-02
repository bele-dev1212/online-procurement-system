import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Invitation.css';

const Invitation = () => {
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

  useEffect(() => {
    // Fetch invitation details
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}`);
        const result = await response.json();
        
        if (result.success && result.data?.invitation) {
          setInvitation({
            organization: result.data.invitation.organization.name,
            inviter: result.data.invitation.inviter.name,
            role: result.data.invitation.role,
            email: result.data.invitation.email
          });
        } else {
          setInvitation(null);
        }
      } catch (error) {
        console.error('Error fetching invitation:', error);
        setInvitation(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    } else {
      setLoading(false);
      setInvitation(null);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Handle invitation acceptance
    setLoading(true);
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          password: formData.password
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.token) {
        // Store token and user data
        localStorage.setItem('procurement_access_token', result.data.token);
        localStorage.setItem('userData', JSON.stringify(result.data.user));
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        alert(result.message || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="invitation-loading">Loading invitation...</div>;
  }

  if (!invitation) {
    return (
      <div className="invitation-error">
        <h2>Invalid Invitation</h2>
        <p>This invitation link is invalid or has expired.</p>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="invitation">
      <div className="invitation-container">
        <div className="invitation-header">
          <h1>You're Invited!</h1>
          <p>
            <strong>{invitation.inviter}</strong> has invited you to join 
            <strong> {invitation.organization}</strong> on ፈጣን ግዢ
          </p>
          <div className="invitation-details">
            <p><strong>Role:</strong> {invitation.role}</p>
            <p><strong>Email:</strong> {invitation.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="invitation-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
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
                name="lastName"
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
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Accept Invitation & Join Team
          </button>
        </form>

        <div className="invitation-footer">
          <p>By accepting this invitation, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default Invitation;
