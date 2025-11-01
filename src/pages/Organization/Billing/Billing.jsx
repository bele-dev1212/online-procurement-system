import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import './Billing.css';

const Billing = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [billingInfo, setBillingInfo] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Load all billing data in parallel with proper error handling
      const [subscriptionRes, paymentRes, historyRes, plansRes] = await Promise.all([
        fetch(`/api/organizations/${user.organization}/subscription`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          console.error('Subscription API error:', error);
          return { ok: false, status: 500 };
        }),
        fetch(`/api/organizations/${user.organization}/payment-methods`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          console.error('Payment methods API error:', error);
          return { ok: false, status: 500 };
        }),
        fetch(`/api/organizations/${user.organization}/billing-history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          console.error('Billing history API error:', error);
          return { ok: false, status: 500 };
        }),
        fetch('/api/billing/plans', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          console.error('Plans API error:', error);
          return { ok: false, status: 500 };
        })
      ]);

      // Handle subscription response
      if (subscriptionRes.ok) {
        try {
          const data = await subscriptionRes.json();
          setBillingInfo(data);
        } catch (parseError) {
          console.error('Error parsing subscription response:', parseError);
          // API returned HTML instead of JSON
          setBillingInfo(null);
        }
      } else {
        setBillingInfo(null);
      }

      // Handle payment methods response
      if (paymentRes.ok) {
        try {
          const data = await paymentRes.json();
          setPaymentMethods(data);
        } catch (parseError) {
          console.error('Error parsing payment methods response:', parseError);
          setPaymentMethods([]);
        }
      } else {
        setPaymentMethods([]);
      }

      // Handle billing history response
      if (historyRes.ok) {
        try {
          const data = await historyRes.json();
          setBillingHistory(data);
        } catch (parseError) {
          console.error('Error parsing billing history response:', parseError);
          setBillingHistory([]);
        }
      } else {
        setBillingHistory([]);
      }

      // Handle plans response
      if (plansRes.ok) {
        try {
          const data = await plansRes.json();
          setAvailablePlans(data);
        } catch (parseError) {
          console.error('Error parsing plans response:', parseError);
          setAvailablePlans([]);
        }
      } else {
        setAvailablePlans([]);
      }

    } catch (error) {
      console.error('Error loading billing data:', error);
      setBillingInfo(null);
      setPaymentMethods([]);
      setBillingHistory([]);
      setAvailablePlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    setActionLoading('upgrade');
    try {
      const response = await fetch(`/api/organizations/${user.organization}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });

      if (response.ok) {
        addNotification('success', 'Subscription upgraded successfully');
        setShowUpgradeModal(false);
        loadBillingData();
      } else {
        addNotification('info', 'Subscription management will be available when backend APIs are implemented');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      addNotification('info', 'Subscription management will be available when backend APIs are implemented');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      const response = await fetch(`/api/organizations/${user.organization}/subscription`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        addNotification('success', 'Subscription cancelled successfully');
        loadBillingData();
      } else {
        addNotification('info', 'Subscription management will be available when backend APIs are implemented');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      addNotification('info', 'Subscription management will be available when backend APIs are implemented');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefaultPayment = async (paymentMethodId) => {
    setActionLoading(paymentMethodId);
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        addNotification('success', 'Default payment method updated');
        loadBillingData();
      } else {
        addNotification('info', 'Payment method management will be available when backend APIs are implemented');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      addNotification('info', 'Payment method management will be available when backend APIs are implemented');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId) => {
    setActionLoading(`remove-${paymentMethodId}`);
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        addNotification('success', 'Payment method removed');
        loadBillingData();
      } else {
        addNotification('info', 'Payment method management will be available when backend APIs are implemented');
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      addNotification('info', 'Payment method management will be available when backend APIs are implemented');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="billing">
        <div className="loading-spinner"></div>
        <p>Loading billing information...</p>
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="billing">
        <div className="error-state">
          <h2>Unable to load billing information</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button onClick={loadBillingData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="billing">
      <div className="billing-header">
        <h1>Billing & Subscription</h1>
        <p>Manage your organization's subscription and payment methods</p>
        <div className="api-notice">
          <span className="notice-icon">⚠️</span>
          <span>Backend APIs are not yet implemented. This is a demo interface.</span>
        </div>
      </div>

      <div className="billing-content">
        <div className="billing-cards">
          {/* Current Plan Card */}
          <div className="billing-card">
            <div className="card-header">
              <h2>Current Plan</h2>
              <span className={`plan-status ${billingInfo?.status?.toLowerCase() || 'active'}`}>
                {billingInfo?.status || 'Active'}
              </span>
            </div>
            <div className="plan-info">
              <div className="plan-name">{billingInfo?.plan?.name || 'No Active Plan'}</div>
              {billingInfo?.amount !== undefined && (
                <div className="plan-amount">
                  {formatCurrency(billingInfo.amount, billingInfo.currency)}/month
                </div>
              )}
              {billingInfo?.users && (
                <div className="plan-users">
                  Up to {billingInfo.users} users
                </div>
              )}
              {billingInfo?.currentPeriodStart && billingInfo?.currentPeriodEnd && (
                <div className="next-billing">
                  Current period: {formatDate(billingInfo.currentPeriodStart)} - {formatDate(billingInfo.currentPeriodEnd)}
                </div>
              )}
            </div>
            <div className="plan-actions">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="btn btn-primary"
                disabled={actionLoading}
              >
                Change Plan
              </button>
              {billingInfo?.status === 'active' && (
                <button 
                  onClick={handleCancelSubscription}
                  className="btn btn-secondary"
                  disabled={actionLoading === 'cancel'}
                >
                  {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>

          {/* Payment Methods Card */}
          <div className="billing-card">
            <div className="card-header">
              <h2>Payment Methods</h2>
            </div>
            <div className="payment-methods-list">
              {paymentMethods.length > 0 ? (
                paymentMethods.map(method => (
                  <div key={method.id} className="payment-method">
                    <div className="method-details">
                      <div className="method-icon">
                        {method.brand === 'visa' && '💳'}
                        {method.brand === 'mastercard' && '💳'}
                        {method.brand === 'amex' && '💳'}
                      </div>
                      <div className="method-info">
                        <div className="method-brand">
                          {method.brand?.charAt(0).toUpperCase() + method.brand?.slice(1)} •••• {method.last4}
                        </div>
                        <div className="method-expiry">
                          Expires {method.expMonth}/{method.expYear}
                        </div>
                      </div>
                    </div>
                    <div className="method-actions">
                      {method.isDefault ? (
                        <span className="default-badge">Default</span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultPayment(method.id)}
                          className="btn btn-sm btn-secondary"
                          disabled={actionLoading === method.id}
                        >
                          Set Default
                        </button>
                      )}
                      {!method.isDefault && (
                        <button
                          onClick={() => handleRemovePaymentMethod(method.id)}
                          className="btn btn-sm btn-danger"
                          disabled={actionLoading === `remove-${method.id}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-payment-methods">
                  <p>No payment methods added</p>
                  <button 
                    onClick={() => setShowAddPaymentModal(true)}
                    className="btn btn-secondary"
                  >
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Plans */}
        {availablePlans.length > 0 && (
          <div className="plans-section">
            <h2>Available Plans</h2>
            <div className="plans-grid">
              {availablePlans.map(plan => (
                <div key={plan.id} className={`plan-card ${plan.id === billingInfo?.plan?.id ? 'current' : ''}`}>
                  <div className="plan-card-header">
                    <h3>{plan.name}</h3>
                    {plan.id === billingInfo?.plan?.id && (
                      <span className="current-badge">Current Plan</span>
                    )}
                  </div>
                  <div className="plan-price">
                    {formatCurrency(plan.price, plan.currency)}
                    <span>/month</span>
                  </div>
                  <div className="plan-users">{plan.users} users included</div>
                  <div className="plan-features">
                    {plan.features?.map((feature, index) => (
                      <div key={index} className="feature">✓ {feature}</div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className="btn btn-primary"
                    disabled={plan.id === billingInfo?.plan?.id || actionLoading === 'upgrade'}
                  >
                    {plan.id === billingInfo?.plan?.id ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing History */}
        <div className="billing-history">
          <h2>Billing History</h2>
          {billingHistory.length > 0 ? (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.description}</td>
                      <td>{formatCurrency(transaction.amount, transaction.currency)}</td>
                      <td>
                        <span className={`status ${transaction.status}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-history">
              <p>No billing history available</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Payment Method</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddPaymentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Payment method integration will be available when backend APIs are implemented.</p>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowAddPaymentModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;