import React from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const plans = [
    {
      name: "Startup",
      price: "₵999",
      period: "per month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 10 users",
        "Basic purchase orders",
        "Supplier management",
        "Email support",
        "Basic reporting",
        "Mobile access"
      ],
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "₵2,499",
      period: "per month",
      description: "For growing Ethiopian businesses",
      features: [
        "Up to 50 users",
        "Advanced workflows",
        "RFQ management",
        "Priority support",
        "Advanced analytics",
        "API access",
        "Custom approvals"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "₵4,999",
      period: "per month",
      description: "For large organizations",
      features: [
        "Unlimited users",
        "Custom workflows",
        "Full API access",
        "Dedicated support",
        "Custom reporting",
        "White-label options",
        "Onboarding training"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="pricing">
      <div className="container">
        <div className="pricing-header">
          <h1>Simple, Transparent Pricing</h1>
          <p>Choose the plan that works for your Ethiopian business. All plans include a 14-day free trial.</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="amount">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <ul className="features-list">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>✓ {feature}</li>
                ))}
              </ul>

              <div className="plan-action">
                <Link 
                  to={plan.name === "Enterprise" ? "/contact" : "/register"} 
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-full`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <div className="faq">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-item">
              <strong>Can I change plans later?</strong>
              <p>Yes, you can upgrade or downgrade your plan at any time.</p>
            </div>
            <div className="faq-item">
              <strong>Is there a setup fee?</strong>
              <p>No, there are no setup fees. You only pay the monthly subscription.</p>
            </div>
            <div className="faq-item">
              <strong>Do you offer discounts for annual payments?</strong>
              <p>Yes, we offer 15% discount for annual subscriptions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
