import React, { useState } from 'react';
import './Billing.css';

const Billing = () => {
  const [billingInfo, setBillingInfo] = useState({
    plan: 'Professional',
    status: 'Active',
    nextBilling: '2024-02-15',
    amount: '₵2,499'
  });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true
    }
  ]);

  const [billingHistory, setBillingHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      description: 'Professional Plan',
      amount: '₵2,499',
      status: 'Paid'
    },
    {
      id: 2,
      date: '2023-12-15',
      description: 'Professional Plan',
      amount: '₵2,499',
      status: 'Paid'
    }
  ]);

  return (
    <div className="billing">
      <div className="billing-header">
        <h1>Billing & Subscription</h1>
        <p>Manage your organization's subscription and payment methods</p>
      </div>

      <div className="billing-content">
        <div className="billing-cards">
          <div className="billing-card">
            <h2>Current Plan</h2>
            <div className="plan-info">
              <div className="plan-name">{billingInfo.plan}</div>
              <div className="plan-amount">{billingInfo.amount}/month</div>
              <div className="plan-status">
                Status: <span className="status active">{billingInfo.status}</span>
              </div>
              <div className="next-billing">
                Next billing date: {billingInfo.nextBilling}
              </div>
            </div>
            <div className="plan-actions">
              <button className="btn btn-primary">Upgrade Plan</button>
              <button className="btn btn-secondary">Cancel Subscription</button>
            </div>
          </div>

          <div className="billing-card">
            <h2>Payment Methods</h2>
            {paymentMethods.map(method => (
              <div key={method.id} className="payment-method">
                <div className="method-details">
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <div className="method-brand">{method.brand} •••• {method.last4}</div>
                    <div className="method-expiry">Expires {method.expiry}</div>
                  </div>
                </div>
                {method.isDefault && <span className="default-badge">Default</span>}
              </div>
            ))}
            <button className="btn btn-secondary btn-full">Add Payment Method</button>
          </div>
        </div>

        <div className="billing-history">
          <h2>Billing History</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.amount}</td>
                  <td>
                    <span className={`status ${transaction.status.toLowerCase()}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
