import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <div className="logo-icon">⚡🏢</div>
            <span className="logo-text">Procur Ethiopia</span>
            <span className="logo-subtitle">Fetan Gizi</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
          
          <div className="nav-actions">
            <Link to="/login" className="btn-login">Sign In</Link>
            <Link to="/register" className="btn-primary">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>Made in Ethiopia</span>
            </div>
            
            <h1 className="hero-title">
              Modern Procurement
              <span className="title-accent"> And Supplier management System</span>
            </h1>
            
            <p className="hero-description">
              Streamline your purchasing, supplier management, and approval workflows 
              with Ethiopia's first cloud-based procurement platform. Fast, efficient, 
              and built for your business needs.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">
                Start Free Trial
                <span>14 days • No credit card</span>
              </Link>
             
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>50+</strong>
                <span>Ethiopian Businesses</span>
              </div>
              <div className="stat">
                <strong>₵2.5B+</strong>
                <span>Procurement Managed</span>
              </div>
              <div className="stat">
                <strong>65%</strong>
                <span>Faster Processing</span>
              </div>
            </div>
          </div>
<div className="hero-images">
  <img src="https://kissflow.com/hubfs/manual_procurement_risks_blog.jpg" alt="Problem Solution" />
    <img src="https://media.istockphoto.com/id/2183482739/photo/procurement-management-and-supply-chain-concept-procurement-icons-related-to-logistics-supply.jpg?s=1024x1024&w=is&k=20&c=LMdOmFJEmEbmq_V77WpGg-gY7CLI-DS0nv-iJHCYPXk=" alt="Procurement System" />
    
  </div>

        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted-by">
        <div className="container">
          <p>Trusted by leading Ethiopian companies</p>
          <div className="logos">
            <div className="logo-item">🏢 Awash Bank</div>
            <div className="logo-item">🏭 Ethiopian Airlines</div>
            <div className="logo-item">🛒 Safaricom</div>
            <div className="logo-item">💊 Addis Pharmaceutical</div>
            <div className="logo-item">🏗️ Sunshine Construction</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need for Modern Procurement</h2>
            <p>Complete procurement management in one platform</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Purchase Orders</h3>
              <p>Create, track, and manage purchase orders with automated workflows and approvals.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏭</div>
              <h3>Supplier Management</h3>
              <p>Manage vendor relationships, performance tracking, and compliance monitoring.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Inventory Control</h3>
              <p>Track stock levels, manage reordering, and optimize inventory across locations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Bidding & RFQ</h3>
              <p>Manage request for quotations, bid evaluations, and supplier negotiations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Gain insights with comprehensive reporting and data visualization dashboards.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Security & Compliance</h3>
              <p>Enterprise-grade security with audit trails and compliance reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Procurement?</h2>
          <p>Join Ethiopian businesses that trust Procur Ethiopia for their procurement operations.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-primary btn-large">
              Start Free Trial
            </Link>
            <Link to="/contact" className="btn-secondary btn-large">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-icon">⚡🏢</div>
              <span className="logo-text">Procur Ethiopia</span>
              <p>Online Procurement and Suplier management System</p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <Link to="/features">Features</Link>
                <Link to="/pricing">Pricing</Link>
                <Link to="/contact">Demo</Link>
              </div>
              
              <div className="link-group">
                <h4>Company</h4>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/careers">Careers</Link>
              </div>
              
              <div className="link-group">
                <h4>Resources</h4>
                <Link to="/blog">Blog</Link>
                <Link to="/docs">Documentation</Link>
                <Link to="/support">Support</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Procur Ethiopia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
