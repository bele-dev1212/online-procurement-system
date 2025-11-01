import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import SearchBar from '../../../components/common/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import Toast from '../../../components/common/Toast';
import './BillingManagement.css';

const BillingManagement = () => {
  const { subscriptions, loading, fetchSubscriptions, updateSubscription } = useSuperAdmin();
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    search: ''
  });
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchSubscriptionsWithPagination();
  }, [filters, pagination.page]);

  const fetchSubscriptionsWithPagination = async () => {
    try {
      const result = await fetchSubscriptions({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      if (result) {
        setPagination(prev => ({ ...prev, total: result.total }));
      }
    } catch (error) {
      showToast('Failed to load subscriptions', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSubscriptionUpdate = async (orgId, updates) => {
    setUpdating(true);
    try {
      await updateSubscription(orgId, updates);
      setShowModal(false);
      setSelectedSubscription(null);
      showToast('Subscription updated successfully', 'success');
      fetchSubscriptionsWithPagination(); // Refresh data
    } catch (error) {
      console.error('Failed to update subscription:', error);
      showToast('Failed to update subscription', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (subscription) => {
    setSelectedSubscription(subscription);
    setShowModal(true);
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const calculateRevenue = () => {
    return subscriptions.reduce((total, sub) => {
      const planPrices = {
        'free': 0,
        'basic': 49,
        'professional': 99,
        'enterprise': 199
      };
      return total + (planPrices[sub.subscriptionPlan] || 0);
    }, 0);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && subscriptions.length === 0) return <LoadingSpinner />;

  return (
    <div className="billing-management">
      {/* Toast Notifications */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      <div className="billing-header">
        <h2>Billing & Subscription Management</h2>
        <div className="revenue-summary">
          <div className="revenue-card">
            <h3>Monthly Recurring Revenue</h3>
            <div className="revenue-amount">${calculateRevenue().toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <SearchBar 
          placeholder="Search organizations..." 
          onSearch={(value) => handleFilterChange('search', value)}
          delay={300} // Debounce search
        />
        <select 
          value={filters.plan} 
          onChange={(e) => handleFilterChange('plan', e.target.value)}
          aria-label="Filter by subscription plan"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
          aria-label="Filter by subscription status"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="subscriptions-table">
        {subscriptions.length === 0 ? (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-state-icon">💳</div>
            <h3>No subscriptions found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <>
            <table aria-label="Subscription management table">
              <thead>
                <tr>
                  <th scope="col">Organization</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Status</th>
                  <th scope="col">Price</th>
                  <th scope="col">Users</th>
                  <th scope="col">Since</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id || sub._id}>
                    <td>
                      <div className="org-info">
                        <strong>{sub.organization?.name || sub.name}</strong>
                        <span>{sub.organization?.email || sub.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`plan-badge plan-${sub.subscriptionPlan}`}>
                        {sub.subscriptionPlan}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${sub.subscriptionStatus}`}>
                        {sub.subscriptionStatus}
                      </span>
                    </td>
                    <td>
                      ${sub.subscriptionPlan === 'free' ? '0' : 
                        sub.subscriptionPlan === 'basic' ? '49' :
                        sub.subscriptionPlan === 'professional' ? '99' : '199'}
                      /mo
                    </td>
                    <td>{sub.userCount || sub.usersCount || 'N/A'}</td>
                    <td>{new Date(sub.createdAt || sub.created).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-primary"
                        onClick={() => openEditModal(sub)}
                        aria-label={`Edit subscription for ${sub.organization?.name || sub.name}`}
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="pagination" role="navigation" aria-label="Subscription pagination">
                <button 
                  className="btn btn-outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button 
                  className="btn btn-outline"
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && selectedSubscription && (
        <Modal onClose={() => setShowModal(false)}>
          <EditSubscriptionModal 
            subscription={selectedSubscription}
            onUpdate={handleSubscriptionUpdate}
            onClose={() => setShowModal(false)}
            updating={updating}
          />
        </Modal>
      )}
    </div>
  );
};

const EditSubscriptionModal = ({ subscription, onUpdate, onClose, updating }) => {
  const [formData, setFormData] = useState({
    subscriptionPlan: subscription.subscriptionPlan,
    subscriptionStatus: subscription.subscriptionStatus
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(subscription.organization?.id || subscription._id, formData);
  };

  return (
    <div className="edit-subscription-modal" role="dialog" aria-labelledby="edit-subscription-title">
      <h3 id="edit-subscription-title">Edit Subscription</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subscription-plan">Plan</label>
          <select 
            id="subscription-plan"
            value={formData.subscriptionPlan}
            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionPlan: e.target.value }))}
            disabled={updating}
          >
            <option value="free">Free</option>
            <option value="basic">Basic ($49/mo)</option>
            <option value="professional">Professional ($99/mo)</option>
            <option value="enterprise">Enterprise ($199/mo)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="subscription-status">Status</label>
          <select 
            id="subscription-status"
            value={formData.subscriptionStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
            disabled={updating}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={updating}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Subscription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingManagement;