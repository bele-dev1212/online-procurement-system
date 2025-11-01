import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import './Subscription.css';

const Subscription = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [subscription, setSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      const [subscriptionRes, plansRes, historyRes] = await Promise.all([
        fetch(`/api/organizations/${user.organization}/subscription`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/billing/plans', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/organizations/${user.organization}/billing-history?limit=10`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        setSubscription(subscriptionData);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setAvailablePlans(plansData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setBillingHistory(historyData);
      }

    } catch (error) {
      console.error('Error loading subscription data:', error);
      addNotification('error', 'Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    setUpgrading(true);
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
        setSelectedPlan(null);
        loadSubscriptionData();
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.message || 'Failed to upgrade subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      addNotification('error', 'Error upgrading subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
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
        loadSubscriptionData();
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      addNotification('error', 'Error cancelling subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      const response = await fetch(`/api/organizations/${user.organization}/subscription/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        addNotification('success', 'Subscription reactivated successfully');
        loadSubscriptionData();
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.message || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      addNotification('error', 'Error reactivating subscription');
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '';
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

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      cancelled: 'error',
      past_due: 'warning',
      trialing: 'info',
      incomplete: 'warning'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div className="subscription">
        <div className="loading-spinner"></div>
        <p>Loading subscription information...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="subscription">
        <div className="error-state">
          <h2>Unable to load subscription information</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button onClick={loadSubscriptionData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription">
      <div className="subscription-header">
        <h1>Subscription Management</h1>
        <p>Manage your organization's subscription plan and billing</p>
      </div>

      <div className="subscription-content">
        {/* Current Subscription Card */}
        <div className="subscription-card">
          <div className="card-header">
            <h2>Current Subscription</h2>
            <span className={`status-badge ${getStatusColor(subscription.status)}`}>
              {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)}
            </span>
          </div>
          
          <div className="subscription-info">
            <div className="plan-details">
              <div className="plan-name">{subscription.plan?.name || 'No Active Plan'}</div>
              {subscription.amount && (
                <div className="plan-price">
                  {formatCurrency(subscription.amount, subscription.currency)}
                  <span>/month</span>
                </div>
              )}
              {subscription.users && (
                <div className="plan-users">
                  Includes up to {subscription.users} users
                </div>
              )}
            </div>

            <div className="subscription-meta">
              {subscription.currentPeriodStart && (
                <div className="meta-item">
                  <span className="meta-label">Current Period:</span>
                  <span className="meta-value">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
              )}
              {subscription.nextBillingDate && (
                <div className="meta-item">
                  <span className="meta-label">Next Billing:</span>
                  <span className="meta-value">{formatDate(subscription.nextBillingDate)}</span>
                </div>
              )}
              {subscription.cancelAtPeriodEnd && (
                <div className="meta-item warning">
                  <span className="meta-label">Status:</span>
                  <span className="meta-value">Will cancel at period end</span>
                </div>
              )}
            </div>
          </div>

          <div className="subscription-actions">
            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <>
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="btn btn-primary"
                >
                  Change Plan
                </button>
                <button 
                  onClick={handleCancelSubscription}
                  className="btn btn-secondary"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </>
            )}
            {subscription.status === 'cancelled' && (
              <button 
                onClick={handleReactivate}
                className="btn btn-primary"
              >
                Reactivate Subscription
              </button>
            )}
            {subscription.cancelAtPeriodEnd && (
              <button 
                onClick={handleReactivate}
                className="btn btn-primary"
              >
                Reactivate Subscription
              </button>
            )}
          </div>
        </div>

        {/* Available Plans */}
        <div className="plans-section">
          <h2>Available Plans</h2>
          <div className="plans-grid">
            {availablePlans.map(plan => (
              <div key={plan.id} className={`plan-card ${plan.id === subscription.plan?.id ? 'current' : ''}`}>
                <div className="plan-card-header">
                  <h3>{plan.name}</h3>
                  {plan.id === subscription.plan?.id && (
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
                  onClick={() => {
                    setSelectedPlan(plan);
                    handleUpgrade(plan.id);
                  }}
                  className="btn btn-primary"
                  disabled={plan.id === subscription.plan?.id || upgrading}
                >
                  {plan.id === subscription.plan?.id ? 'Current Plan' : 
                   upgrading && selectedPlan?.id === plan.id ? 'Upgrading...' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

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
                    <th>Invoice</th>
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
                      <td>
                        <button className="btn btn-sm btn-secondary">
                          Download
                        </button>
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
    </div>
  );
};

export default Subscription;
