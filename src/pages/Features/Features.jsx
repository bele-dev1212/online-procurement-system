import React from 'react';
import { Link } from 'react-router-dom';
import './Features.css';

const Features = () => {
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
      <div className="container">
        <div className="features-hero">
          <h1>Powerful Features for Ethiopian Businesses</h1>
          <p>Everything you need to streamline your procurement processes</p>
        </div>

        {featureCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="feature-category">
            <h2>{category.title}</h2>
            <div className="features-grid">
              {category.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="features-cta">
          <h2>Ready to experience these features?</h2>
          <Link to="/register" className="btn btn-primary btn-large">
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
