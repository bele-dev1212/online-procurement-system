import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <div className="container">
        <div className="about-hero">
          <h1>About ፈጣን ግዢ</h1>
          <p className="subtitle">Modern Procurement Solutions for Ethiopian Businesses</p>
        </div>

        <div className="about-content">
          <div className="mission-section">
            <h2>Our Mission</h2>
            <p>
              To transform procurement processes for Ethiopian businesses through technology, 
              making them faster, more efficient, and cost-effective while maintaining 
              local business practices and compliance.
            </p>
          </div>

          <div className="story-section">
            <h2>Our Story</h2>
            <p>
              Founded in 2025, ፈጣን ግዢ was created to address the unique procurement 
              challenges faced by Ethiopian businesses. We understand the local market 
              dynamics, regulatory requirements, and business culture.
            </p>
          </div>

          <div className="values-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>🇪🇹 Local Focus</h3>
                <p>Built specifically for Ethiopian business needs and regulations</p>
              </div>
              <div className="value-card">
                <h3>⚡ Efficiency</h3>
                <p>Streamline processes to save time and reduce costs</p>
              </div>
              <div className="value-card">
                <h3>🔒 Security</h3>
                <p>Enterprise-grade security for your business data</p>
              </div>
              <div className="value-card">
                <h3>📈 Growth</h3>
                <p>Scale your procurement as your business grows</p>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Join Ethiopian businesses transforming their procurement processes</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">Start Free Trial</Link>
              <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
