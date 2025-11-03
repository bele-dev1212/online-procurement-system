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
        // Simulate API call
        setTimeout(() => {
          setInvitation({
            organization: 'ABC Corporation',
            inviter: 'John Doe',
            role: 'Procurement Manager',
            email: 'newuser@abccorp.com'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching invitation:', error);
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Handle invitation acceptance
    try {
      // API call to accept invitation
      console.log('Accepting invitation:', formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
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
            <strong> {invitation.organization}</strong> on Procur Ethiopia
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
