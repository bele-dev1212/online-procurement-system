import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Features.css';

const Features = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featureCategories = [
    {
      title: "Procurement Management",
      features: [
        {
          icon: "📋",
          title: "Purchase Orders",
          description: "Create, track, and manage purchase orders with automated workflows"
        },
        {
          icon: "✅",
          title: "Approval Workflows",
          description: "Customizable approval chains for different purchase amounts"
        },
        {
          icon: "📊",
          title: "Spend Analytics",
          description: "Real-time tracking of procurement spending and budgets"
        }
      ]
    },
    {
      title: "Supplier Management",
      features: [
        {
          icon: "🏭",
          title: "Supplier Portal",
          description: "Vendors can manage orders, invoices, and communications"
        },
        {
          icon: "⭐",
          title: "Performance Tracking",
          description: "Rate and monitor supplier performance metrics"
        },
        {
          icon: "📝",
          title: "Contract Management",
          description: "Store and manage supplier contracts and agreements"
        }
      ]
    },
    {
      title: "Bidding & RFQ",
      features: [
        {
          icon: "💰",
          title: "RFQ Management",
          description: "Create and manage request for quotation processes"
        },
        {
          icon: "⚖️",
          title: "Bid Evaluation",
          description: "Compare and evaluate supplier bids efficiently"
        },
        {
          icon: "🤝",
          title: "Supplier Negotiation",
          description: "Tools for negotiating terms with selected suppliers"
        }
      ]
    }
  ];

  return (
    <div className="features">
      {/* Enhanced Navigation Header */}
      <header className="nav-header">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/" className="brand-logo">
              <span className="logo-icon">⚡</span>
              ProcureEthiopia
            </Link>
          </div>
          <nav className="nav-links">
            <Link to="/features" className="nav-link active">Features</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        <div className="container">
          <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
            <h1 className="hero-title">
              Powerful Features for 
              <span className="gradient-text"> Ethiopian Businesses</span>
            </h1>
            <p className="hero-subtitle">
              Everything you need to streamline your procurement processes
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Free Trial
              </Link>
           
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="category-section">
        <div className="container">
          <div className="category-tabs">
            {featureCategories.map((category, index) => (
              <button
                key={index}
                className={`category-tab ${activeCategory === index ? 'active' : ''}`}
                onClick={() => setActiveCategory(index)}
              >
                <span className="tab-icon">{category.features[0]?.icon}</span>
                {category.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          {featureCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex} 
              className={`feature-category ${activeCategory === categoryIndex ? 'active' : ''}`}
            >
              <div className="category-header">
                <h2>{category.title}</h2>
                <p>Complete solutions for your {category.title.toLowerCase()} needs</p>
              </div>
              
              <div className="features-grid">
                {category.features.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex} 
                    className="feature-card"
                    style={{ animationDelay: `${featureIndex * 0.1}s` }}
                  >
                    <div className="feature-card-inner">
                      <div className="feature-icon-container">
                        <div className="feature-icon-wrapper">
                          <span className="feature-icon">{feature.icon}</span>
                        </div>
                        <div className="feature-badge">New</div>
                      </div>
                      <div className="feature-content">
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                      <div className="feature-actions">
                        <button className="btn-learn-more">
                          Learn More →
                        </button>
                      </div>
                    </div>
                    <div className="feature-hover-effect"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50%</div>
              <div className="stat-label">Faster Processing</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">30%</div>
              <div className="stat-label">Cost Reduction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to experience these features?</h2>
            <p>Join thousands of Ethiopian businesses transforming their procurement</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Your Free Trial
              </Link>
            </div>
            <div className="cta-features">
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Full support included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="features-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">ProcureEthiopia</div>
              <p>Streamlining procurement for Ethiopian enterprises</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;