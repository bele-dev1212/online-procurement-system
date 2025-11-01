import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('operational');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    type: 'suggestion',
    message: '',
    email: ''
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock system status and online users
  useEffect(() => {
    const statuses = ['operational', 'degraded', 'maintenance'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    setSystemStatus(randomStatus);
    setOnlineUsers(Math.floor(Math.random() * 50) + 10);
  }, []);

  const quickLinks = {
    procurement: [
      { label: 'Create Purchase Order', path: '/procurement/orders/create' },
      { label: 'View RFQs', path: '/procurement/rfqs' },
      { label: 'Requisitions', path: '/procurement/requisitions' },
      { label: 'Approval Workflow', path: '/procurement/approvals' }
    ],
    suppliers: [
      { label: 'Supplier Directory', path: '/suppliers/directory' },
      { label: 'Add New Supplier', path: '/suppliers/create' },
      { label: 'Performance Reports', path: '/suppliers/performance' },
      { label: 'Contract Management', path: '/suppliers/contracts' }
    ],
    resources: [
      { label: 'Documentation', path: '/help/docs' },
      { label: 'Training Materials', path: '/help/training' },
      { label: 'API Reference', path: '/help/api' },
      { label: 'Video Tutorials', path: '/help/tutorials' }
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Contact Support', path: '/support' },
      { label: 'Report Issue', path: '/support/issue' },
      { label: 'Feature Request', path: '/support/feature-request' }
    ]
  };

  const socialLinks = [
    { 
      name: 'LinkedIn', 
      icon: '💼', 
      url: 'https://linkedin.com/company/procureflow',
      color: '#0077b5'
    },
    { 
      name: 'Twitter', 
      icon: '🐦', 
      url: 'https://twitter.com/procureflow',
      color: '#1da1f2'
    },
    { 
      name: 'GitHub', 
      icon: '💻', 
      url: 'https://github.com/procureflow',
      color: '#333'
    },
    { 
      name: 'Email', 
      icon: '📧', 
      url: 'mailto:support@procureflow.com',
      color: '#ea4335'
    }
  ];

  const handleQuickLinkClick = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleSocialLinkClick = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    alert('Thank you for your feedback! We appreciate your input.');
    setFeedback({ type: 'suggestion', message: '', email: '' });
    setIsFeedbackModalOpen(false);
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSystemStatusText = () => {
    switch (systemStatus) {
      case 'operational': return 'All Systems Operational';
      case 'degraded': return 'Performance Degraded';
      case 'maintenance': return 'Under Maintenance';
      default: return 'Unknown Status';
    }
  };

  const currentYear = currentTime.getFullYear();
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <>
      <footer className="footer">
        {/* Main Footer Content */}
        <div className="footer-main">
          <div className="footer-container">
            
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">🏢</div>
                <span className="logo-text">ProcureFlow</span>
              </div>
              <p className="footer-description">
                Streamlining procurement processes and supplier management 
                for modern businesses. Efficient, transparent, and powerful.
              </p>
              <div className="footer-social">
                {socialLinks.map((social) => (
                  <button
                    key={social.name}
                    className="social-link"
                    onClick={() => handleSocialLinkClick(social.url)}
                    title={social.name}
                    style={{ '--social-color': social.color }}
                  >
                    <span className="social-icon">{social.icon}</span>
                    <span className="social-name">{social.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links Sections */}
            <div className="footer-links-grid">
              <div className="footer-links-section">
                <h3 className="links-title">Procurement</h3>
                <ul className="links-list">
                  {quickLinks.procurement.map((link) => (
                    <li key={link.label}>
                      <button
                        className="footer-link"
                        onClick={() => handleQuickLinkClick(link.path)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-links-section">
                <h3 className="links-title">Suppliers</h3>
                <ul className="links-list">
                  {quickLinks.suppliers.map((link) => (
                    <li key={link.label}>
                      <button
                        className="footer-link"
                        onClick={() => handleQuickLinkClick(link.path)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-links-section">
                <h3 className="links-title">Resources</h3>
                <ul className="links-list">
                  {quickLinks.resources.map((link) => (
                    <li key={link.label}>
                      <button
                        className="footer-link"
                        onClick={() => handleQuickLinkClick(link.path)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-links-section">
                <h3 className="links-title">Support</h3>
                <ul className="links-list">
                  {quickLinks.support.map((link) => (
                    <li key={link.label}>
                      <button
                        className="footer-link"
                        onClick={() => handleQuickLinkClick(link.path)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="footer-newsletter">
              <h3 className="newsletter-title">Stay Updated</h3>
              <p className="newsletter-description">
                Get the latest features and updates delivered to your inbox.
              </p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  Subscribe
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-container">
            
            {/* Copyright and Links */}
            <div className="footer-bottom-left">
              <div className="copyright">
                &copy; {currentYear} ProcureFlow. All rights reserved.
              </div>
              <div className="legal-links">
                <button 
                  className="legal-link"
                  onClick={() => handleQuickLinkClick('/privacy')}
                >
                  Privacy Policy
                </button>
                <span className="link-separator">•</span>
                <button 
                  className="legal-link"
                  onClick={() => handleQuickLinkClick('/terms')}
                >
                  Terms of Service
                </button>
                <span className="link-separator">•</span>
                <button 
                  className="legal-link"
                  onClick={() => handleQuickLinkClick('/cookies')}
                >
                  Cookie Policy
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="footer-bottom-right">
              <div className="system-info">
                <div className="system-status">
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getSystemStatusColor() }}
                  ></div>
                  <span className="status-text">
                    {getSystemStatusText()}
                  </span>
                </div>
                <div className="online-users">
                  <div className="users-icon">👥</div>
                  <span className="users-count">{onlineUsers} online</span>
                </div>
                <div className="current-time">
                  <div className="time-icon">🕒</div>
                  <span className="time-text">{formattedTime}</span>
                </div>
              </div>

              {/* Feedback Button */}
              <button 
                className="feedback-button"
                onClick={() => setIsFeedbackModalOpen(true)}
              >
                💬 Feedback
              </button>
            </div>

          </div>
        </div>

        {/* Back to Top Button */}
        <button 
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to Top"
        >
          ↑
        </button>

      </footer>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="modal-header">
              <h2>Send Feedback</h2>
              <button 
                className="modal-close"
                onClick={() => setIsFeedbackModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
              <div className="form-group">
                <label htmlFor="feedback-type">Feedback Type</label>
                <select
                  id="feedback-type"
                  value={feedback.type}
                  onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                  className="form-select"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="compliment">Compliment</option>
                  <option value="question">Question</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="feedback-email">Email (Optional)</label>
                <input
                  type="email"
                  id="feedback-email"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  placeholder="Enter your email for follow-up"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="feedback-message">Message</label>
                <textarea
                  id="feedback-message"
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  rows="4"
                  className="form-textarea"
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;