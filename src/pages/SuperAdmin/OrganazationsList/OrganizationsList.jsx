import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import SearchBar from '../../../components/common/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import Toast from '../../../components/common/Toast';
import './OrganizationsList.css';

const OrganizationsList = () => {
  const { 
    organizations, 
    loading, 
    fetchOrganizations, 
    updateOrganizationStatus 
  } = useSuperAdmin();
  
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchOrganizationsWithPagination();
  }, [filters, pagination.page]);

  const fetchOrganizationsWithPagination = async () => {
    try {
      const result = await fetchOrganizations({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (result && result.organizations) {
        setPagination(prev => ({ 
          ...prev, 
          total: result.total,
          totalPages: result.totalPages 
        }));
      }
    } catch (error) {
      showToast('Failed to load organizations', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleStatusChange = async (orgId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    
    if (window.confirm(`Are you sure you want to ${action} this organization?`)) {
      setUpdating(true);
      try {
        await updateOrganizationStatus(orgId, !currentStatus);
        showToast(`Organization ${action}d successfully`, 'success');
        fetchOrganizationsWithPagination(); // Refresh data
      } catch (error) {
        console.error('Failed to update organization status:', error);
        showToast(`Failed to ${action} organization`, 'error');
      } finally {
        setUpdating(false);
      }
    }
  };

  const openDetailsModal = (organization) => {
    setSelectedOrg(organization);
    setShowModal(true);
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getOrganizationStats = () => {
    const buyers = organizations.filter(o => o.type === 'buyer').length;
    const suppliers = organizations.filter(o => o.type === 'supplier').length;
    const active = organizations.filter(o => o.isActive).length;
    
    return { buyers, suppliers, active };
  };

  const stats = getOrganizationStats();

  if (loading && organizations.length === 0) return <LoadingSpinner />;

  return (
    <div className="organizations-list">
      {/* Toast Notifications */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      <div className="organizations-header">
        <div className="header-content">
          <h2>Organizations Management</h2>
          <p>Manage all buyer and supplier organizations on the platform</p>
        </div>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <h3>Total Organizations</h3>
              <div className="stat-number">{organizations.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Buyers</h3>
              <div className="stat-number">{stats.buyers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <div className="stat-info">
              <h3>Suppliers</h3>
              <div className="stat-number">{stats.suppliers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Active</h3>
              <div className="stat-number">{stats.active}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <SearchBar 
          placeholder="Search organizations by name or email..." 
          onSearch={(value) => handleFilterChange('search', value)}
          delay={300}
        />
        <select 
          value={filters.type} 
          onChange={(e) => handleFilterChange('type', e.target.value)}
          aria-label="Filter by organization type"
        >
          <option value="">All Types</option>
          <option value="buyer">Buyer</option>
          <option value="supplier">Supplier</option>
        </select>
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
          aria-label="Filter by organization status"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="organizations-table-container">
        {organizations.length === 0 ? (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-state-icon">🏢</div>
            <h3>No organizations found</h3>
            <p>
              {Object.values(filters).some(f => f) 
                ? "Try adjusting your filters to see more results." 
                : "No organizations are currently registered on the platform."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="organizations-table" aria-label="Organizations management table">
                <thead>
                  <tr>
                    <th scope="col">Organization</th>
                    <th scope="col">Type</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Subscription</th>
                    <th scope="col">Users</th>
                    <th scope="col">Status</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map(org => (
                    <tr key={org.id || org._id} className={!org.isActive ? 'inactive-org' : ''}>
                      <td>
                        <div className="org-main-info">
                          <strong>{org.name}</strong>
                          <span className="org-address">
                            {org.address?.street && `${org.address.street}, `}
                            {org.address?.city && `${org.address.city}, `}
                            {org.address?.country || org.address}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge type-${org.type}`}>
                          {org.type}
                        </span>
                      </td>
                      <td>
                        <div className="contact-info">
                          <span className="contact-email">{org.email}</span>
                          <span className="contact-phone">{org.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`subscription-badge subscription-${org.subscriptionPlan}`}>
                          {org.subscriptionPlan}
                        </span>
                      </td>
                      <td>
                        <span className="user-count">
                          {org.userCount || org.usersCount || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${org.isActive ? 'active' : 'inactive'}`}>
                          {org.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <time dateTime={org.createdAt}>
                          {new Date(org.createdAt).toLocaleDateString()}
                        </time>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-info"
                            onClick={() => openDetailsModal(org)}
                            aria-label={`View details for ${org.name}`}
                            disabled={updating}
                          >
                            View
                          </button>
                          <button 
                            className={`btn ${org.isActive ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleStatusChange(org.id || org._id, org.isActive)}
                            aria-label={`${org.isActive ? 'Deactivate' : 'Activate'} ${org.name}`}
                            disabled={updating}
                          >
                            {updating ? 'Updating...' : (org.isActive ? 'Deactivate' : 'Activate')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="pagination" role="navigation" aria-label="Organizations pagination">
                <button 
                  className="btn btn-outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                
                <div className="pagination-info">
                  <span>
                    Page {pagination.page} of {pagination.totalPages || Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <span className="pagination-total">
                    ({pagination.total} total organizations)
                  </span>
                </div>
                
                <button 
                  className="btn btn-outline"
                  disabled={pagination.page >= (pagination.totalPages || Math.ceil(pagination.total / pagination.limit))}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && selectedOrg && (
        <Modal onClose={() => setShowModal(false)}>
          <OrganizationDetailsModal 
            organization={selectedOrg}
            onClose={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

const OrganizationDetailsModal = ({ organization, onClose }) => {
  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    
    if (typeof address === 'string') return address;
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.zipCode
    ].filter(Boolean);
    
    return parts.join(', ') || 'Not provided';
  };

  const getSubscriptionDetails = (plan) => {
    const details = {
      free: { price: '$0', features: ['Basic features'] },
      basic: { price: '$49/month', features: ['Enhanced features', 'Priority support'] },
      professional: { price: '$99/month', features: ['Advanced features', 'Dedicated support'] },
      enterprise: { price: '$199/month', features: ['Full features', '24/7 support', 'Custom solutions'] }
    };
    
    return details[plan] || { price: 'N/A', features: [] };
  };

  const subscription = getSubscriptionDetails(organization.subscriptionPlan);

  return (
    <div className="organization-details-modal" role="dialog" aria-labelledby="org-details-title">
      <div className="modal-header">
        <h3 id="org-details-title">{organization.name} - Details</h3>
        <button 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close organization details"
        >
          ×
        </button>
      </div>

      <div className="modal-content">
        <div className="details-section">
          <h4>Basic Information</h4>
          <div className="details-grid">
            <div className="detail-item">
              <label>Organization Name:</label>
              <span>{organization.name}</span>
            </div>
            <div className="detail-item">
              <label>Type:</label>
              <span className={`type-badge type-${organization.type}`}>
                {organization.type}
              </span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>
                <a href={`mailto:${organization.email}`} className="email-link">
                  {organization.email}
                </a>
              </span>
            </div>
            <div className="detail-item">
              <label>Phone:</label>
              <span>
                {organization.phone ? (
                  <a href={`tel:${organization.phone}`} className="phone-link">
                    {organization.phone}
                  </a>
                ) : (
                  'Not provided'
                )}
              </span>
            </div>
            <div className="detail-item full-width">
              <label>Address:</label>
              <span>{formatAddress(organization.address)}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h4>Subscription & Status</h4>
          <div className="details-grid">
            <div className="detail-item">
              <label>Subscription Plan:</label>
              <div className="subscription-details">
                <span className={`subscription-badge subscription-${organization.subscriptionPlan}`}>
                  {organization.subscriptionPlan}
                </span>
                <span className="subscription-price">{subscription.price}</span>
              </div>
            </div>
            <div className="detail-item">
              <label>Subscription Status:</label>
              <span className={`status-badge status-${organization.subscriptionStatus}`}>
                {organization.subscriptionStatus}
              </span>
            </div>
            <div className="detail-item">
              <label>Organization Status:</label>
              <span className={`status-badge status-${organization.isActive ? 'active' : 'inactive'}`}>
                {organization.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="detail-item">
              <label>User Count:</label>
              <span className="user-count-large">
                {organization.userCount || organization.usersCount || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h4>Timeline</h4>
          <div className="details-grid">
            <div className="detail-item">
              <label>Joined Date:</label>
              <span>{new Date(organization.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="detail-item">
              <label>Last Updated:</label>
              <span>{new Date(organization.updatedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="detail-item">
              <label>Last Login:</label>
              <span>
                {organization.lastLoginAt 
                  ? new Date(organization.lastLoginAt).toLocaleDateString()
                  : 'Never logged in'
                }
              </span>
            </div>
          </div>
        </div>

        {subscription.features.length > 0 && (
          <div className="details-section">
            <h4>Plan Features</h4>
            <ul className="features-list">
              {subscription.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <span className="feature-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button 
          className="btn btn-primary" 
          onClick={onClose}
          aria-label="Close organization details"
        >
          Close Details
        </button>
      </div>
    </div>
  );
};

export default OrganizationsList;