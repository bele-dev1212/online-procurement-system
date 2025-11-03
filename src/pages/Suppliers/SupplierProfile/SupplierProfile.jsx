import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSuppliers } from '../../../hooks/useSuppliers';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import { CurrencyFormatters, DataFormatters } from '../../../utils/helpers/formatters';

import { SUPPLIER_STATUS } from '../../../utils/enums/supplierStatus';
import './SupplierProfile.css';

const SupplierProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    suppliers, 
    loading, 
    updateSupplierStatus,
    deleteSupplier,
    refetch 
  } = useSuppliers();

  const [supplier, setSupplier] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [, setEditField] = useState(null);
  const [, setEditValue] = useState('');

  useEffect(() => {
    if (suppliers.length > 0 && id) {
      const foundSupplier = suppliers.find(s => s.id === id);
      setSupplier(foundSupplier);
    }
  }, [suppliers, id]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    setActionLoading(true);
    try {
      await updateSupplierStatus(id, newStatus);
      setShowStatusModal(false);
      setNewStatus('');
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteSupplier(id);
      navigate('/suppliers', {
        state: { message: `Supplier ${supplier.name} deleted successfully` }
      });
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStart = (field, value) => {
    setEditField(field);
    setEditValue(value || '');
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', label: 'Active', icon: '🟢' },
      inactive: { class: 'status-inactive', label: 'Inactive', icon: '⚫' },
      pending: { class: 'status-pending', label: 'Pending', icon: '🟡' },
      suspended: { class: 'status-suspended', label: 'Suspended', icon: '🔴' },
      approved: { class: 'status-approved', label: 'Approved', icon: '✅' },
      rejected: { class: 'status-rejected', label: 'Rejected', icon: '❌' }
    };

    const config = statusConfig[status] || { class: 'status-default', label: status, icon: '❓' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return (
      <div className="rating-stars">
        {stars}
        <span className="rating-value">({rating})</span>
      </div>
    );
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { class: 'excellent', label: 'Excellent' };
    if (score >= 80) return { class: 'good', label: 'Good' };
    if (score >= 70) return { class: 'fair', label: 'Fair' };
    return { class: 'poor', label: 'Poor' };
  };

  // Mock data for demonstration
  const performanceData = {
    totalOrders: 147,
    totalSpend: 1250000,
    onTimeDelivery: 94,
    qualityRating: 4.7,
    responseTime: 2.1, // hours
    lastOrderDate: '2024-01-15',
    averageOrderValue: 8500,
    orderGrowth: 12.5
  };

  const recentOrders = [
    { id: 1, poNumber: 'PO-2024-001', date: '2024-01-15', amount: 12500, status: 'delivered' },
    { id: 2, poNumber: 'PO-2024-002', date: '2024-01-10', amount: 8400, status: 'delivered' },
    { id: 3, poNumber: 'PO-2024-003', date: '2024-01-05', amount: 15600, status: 'shipped' },
    { id: 4, poNumber: 'PO-2024-004', date: '2024-01-02', amount: 9200, status: 'ordered' }
  ];

  const documents = [
    { id: 1, name: 'Supplier Agreement.pdf', type: 'Contract', date: '2023-12-01', size: '2.4 MB' },
    { id: 2, name: 'Quality Certificate.pdf', type: 'Certificate', date: '2023-11-15', size: '1.8 MB' },
    { id: 3, name: 'Insurance Certificate.pdf', type: 'Insurance', date: '2023-11-10', size: '1.2 MB' }
  ];

  if (loading) {
    return (
      <div className="supplier-profile-loading">
        <LoadingSpinner size="large" />
        <p>Loading supplier profile...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="supplier-profile-not-found">
        <div className="not-found-content">
          <h2>Supplier Not Found</h2>
          <p>The supplier you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/suppliers" className="btn-primary">
            Back to Supplier Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="header-left">
          <div className="breadcrumb">
            <Link to="/suppliers" className="breadcrumb-link">
              Suppliers
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span>{supplier.name}</span>
          </div>
          <div className="supplier-main-info">
            <div className="supplier-avatar">
              {supplier.name?.charAt(0).toUpperCase()}
            </div>
            <div className="supplier-titles">
              <h1>{supplier.name}</h1>
              <p className="company-name">{supplier.companyName}</p>
              <div className="supplier-meta">
                {getStatusBadge(supplier.status)}
                <span className="category-badge">{supplier.category}</span>
                {getRatingStars(supplier.rating || 0)}
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowStatusModal(true)}
            className="btn-outline"
          >
            Update Status
          </button>
          <Link 
            to={`/suppliers/${id}/edit`}
            className="btn-secondary"
          >
            Edit Profile
          </Link>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn-danger"
            disabled={!['inactive', 'rejected'].includes(supplier.status)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{performanceData.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(performanceData.totalSpend)}</h3>
            <p>Total Spend</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>{performanceData.onTimeDelivery}%</h3>
            <p>On-Time Delivery</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{performanceData.qualityRating}/5</h3>
            <p>Quality Rating</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          👤 Details
        </button>
        <button 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          📈 Performance
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📎 Documents
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              {/* Performance Summary */}
              <div className="overview-card">
                <h3>Performance Summary</h3>
                <div className="performance-metrics">
                  <div className="metric">
                    <label>Overall Performance</label>
                    <div className="metric-value">
                      <span className={`performance-score ${getPerformanceLevel(performanceData.onTimeDelivery).class}`}>
                        {performanceData.onTimeDelivery}%
                      </span>
                      <span className="performance-label">
                        {getPerformanceLevel(performanceData.onTimeDelivery).label}
                      </span>
                    </div>
                  </div>
                  <div className="metric">
                    <label>Average Response Time</label>
                    <div className="metric-value">
                      <span className="response-time">{performanceData.responseTime}h</span>
                    </div>
                  </div>
                  <div className="metric">
                    <label>Order Growth</label>
                    <div className="metric-value">
                      <span className="growth-positive">+{performanceData.orderGrowth}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="overview-card">
                <h3>Contact Information</h3>
                <div className="contact-list">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <div className="contact-details">
                      <strong>Email</strong>
                      <span>{supplier.email}</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div className="contact-details">
                      <strong>Phone</strong>
                      <span>{supplier.phone}</span>
                    </div>
                  </div>
                  {supplier.contactPerson && (
                    <div className="contact-item">
                      <span className="contact-icon">👤</span>
                      <div className="contact-details">
                        <strong>Contact Person</strong>
                        <span>{supplier.contactPerson}</span>
                        {supplier.contactPosition && (
                          <small>{supplier.contactPosition}</small>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="overview-card">
                <h3>Recent Orders</h3>
                <div className="recent-orders">
                  {recentOrders.map(order => (
                    <div key={order.id} className="order-item">
                      <div className="order-info">
                        <strong>{order.poNumber}</strong>
                        <span>{formatDate(order.date)}</span>
                      </div>
                      <div className="order-amount">
                        {formatCurrency(order.amount)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link to={`/suppliers/${id}/orders`} className="view-all-link">
                  View All Orders →
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="overview-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <Link to={`/procurement/create-purchase-order?supplier=${id}`} className="action-btn">
                    📝 Create PO
                  </Link>
                  <Link to={`/procurement/rfq/create?supplier=${id}`} className="action-btn">
                    💰 Request Quote
                  </Link>
                  <button className="action-btn">
                    📧 Send Message
                  </button>
                  <button className="action-btn">
                    📊 Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="details-content">
            <div className="details-grid">
              {/* Basic Information */}
              <div className="details-section">
                <div className="section-header">
                  <h3>Basic Information</h3>
                  <button 
                    onClick={() => handleEditStart('basic', '')}
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="details-list">
                  <div className="detail-item">
                    <label>Supplier Name</label>
                    <span>{supplier.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Company Name</label>
                    <span>{supplier.companyName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category</label>
                    <span className="category-badge">{supplier.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Business Type</label>
                    <span>{supplier.businessType || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tax ID</label>
                    <span>{supplier.taxId || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="details-section">
                <div className="section-header">
                  <h3>Contact Information</h3>
                  <button 
                    onClick={() => handleEditStart('contact', '')}
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="details-list">
                  <div className="detail-item">
                    <label>Primary Email</label>
                    <span>{supplier.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Primary Phone</label>
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact Person</label>
                    <span>{supplier.contactPerson || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Position</label>
                    <span>{supplier.contactPosition || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Website</label>
                    <span>
                      {supplier.website ? (
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                          {supplier.website}
                        </a>
                      ) : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="details-section">
                <div className="section-header">
                  <h3>Address Information</h3>
                  <button 
                    onClick={() => handleEditStart('address', '')}
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="details-list">
                  <div className="detail-item">
                    <label>Street Address</label>
                    <span>{supplier.address || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>City</label>
                    <span>{supplier.city || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>State/Province</label>
                    <span>{supplier.state || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Country</label>
                    <span>{supplier.country || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Postal Code</label>
                    <span>{supplier.postalCode || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="details-section">
                <div className="section-header">
                  <h3>Business Information</h3>
                  <button 
                    onClick={() => handleEditStart('business', '')}
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="details-list">
                  <div className="detail-item">
                    <label>Established Year</label>
                    <span>{supplier.establishedYear || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Employee Count</label>
                    <span>{supplier.employeeCount || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Annual Revenue</label>
                    <span>{supplier.annualRevenue || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Terms</label>
                    <span>{supplier.paymentTerms || 'Net 30'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Currency</label>
                    <span>{supplier.currency || 'USD'}</span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {supplier.notes && (
                <div className="details-section full-width">
                  <h3>Additional Notes</h3>
                  <div className="notes-content">
                    <p>{supplier.notes}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {supplier.tags && supplier.tags.length > 0 && (
                <div className="details-section full-width">
                  <h3>Tags</h3>
                  <div className="tags-container">
                    {supplier.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="performance-content">
            <div className="performance-grid">
              {/* Key Metrics */}
              <div className="performance-card large">
                <h3>Key Performance Indicators</h3>
                <div className="kpi-grid">
                  <div className="kpi-item">
                    <div className="kpi-value">{performanceData.onTimeDelivery}%</div>
                    <div className="kpi-label">On-Time Delivery</div>
                    <div className="kpi-trend positive">+2%</div>
                  </div>
                  <div className="kpi-item">
                    <div className="kpi-value">{performanceData.qualityRating}/5</div>
                    <div className="kpi-label">Quality Rating</div>
                    <div className="kpi-trend positive">+0.2</div>
                  </div>
                  <div className="kpi-item">
                    <div className="kpi-value">{performanceData.responseTime}h</div>
                    <div className="kpi-label">Avg Response Time</div>
                    <div className="kpi-trend negative">-0.5h</div>
                  </div>
                  <div className="kpi-item">
                    <div className="kpi-value">{formatCurrency(performanceData.averageOrderValue)}</div>
                    <div className="kpi-label">Avg Order Value</div>
                    <div className="kpi-trend positive">+5%</div>
                  </div>
                </div>
              </div>

              {/* Performance History */}
              <div className="performance-card">
                <h3>Performance Trends</h3>
                <div className="trend-placeholder">
                  <p>📈 Performance charts would be displayed here</p>
                  <small>Showing delivery, quality, and response time trends over time</small>
                </div>
              </div>

              {/* Scorecard */}
              <div className="performance-card">
                <h3>Performance Scorecard</h3>
                <div className="scorecard">
                  <div className="score-item">
                    <label>Delivery Performance</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill excellent"
                        style={{ width: `${performanceData.onTimeDelivery}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{performanceData.onTimeDelivery}%</span>
                  </div>
                  <div className="score-item">
                    <label>Quality Performance</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill excellent"
                        style={{ width: `${(performanceData.qualityRating / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{performanceData.qualityRating}/5</span>
                  </div>
                  <div className="score-item">
                    <label>Communication</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill good"
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                    <span className="score-value">85%</span>
                  </div>
                  <div className="score-item">
                    <label>Pricing Competitiveness</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill fair"
                        style={{ width: '78%' }}
                      ></div>
                    </div>
                    <span className="score-value">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-content">
            <div className="orders-header">
              <h3>Purchase Orders</h3>
              <Link 
                to={`/procurement/create-purchase-order?supplier=${id}`}
                className="btn-primary"
              >
                + Create New PO
              </Link>
            </div>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Delivery Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="po-number">
                        <Link to={`/procurement/purchase-orders/${order.id}`}>
                          {order.poNumber}
                        </Link>
                      </td>
                      <td className="date">{formatDate(order.date)}</td>
                      <td className="amount">{formatCurrency(order.amount)}</td>
                      <td className="status">
                        <span className={`order-status status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="date">{formatDate('2024-01-20')}</td>
                      <td className="actions">
                        <Link 
                          to={`/procurement/purchase-orders/${order.id}`}
                          className="btn-action view"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="documents-content">
            <div className="documents-header">
              <h3>Supplier Documents</h3>
              <button className="btn-primary">
                + Upload Document
              </button>
            </div>
            <div className="documents-list">
              {documents.map(doc => (
                <div key={doc.id} className="document-item">
                  <div className="document-icon">📄</div>
                  <div className="document-info">
                    <h4>{doc.name}</h4>
                    <div className="document-meta">
                      <span className="document-type">{doc.type}</span>
                      <span className="document-date">{formatDate(doc.date)}</span>
                      <span className="document-size">{doc.size}</span>
                    </div>
                  </div>
                  <div className="document-actions">
                    <button className="btn-action download">Download</button>
                    <button className="btn-action delete">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Supplier Status"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowStatusModal(false),
            variant: 'secondary'
          },
          {
            label: 'Update Status',
            onClick: handleStatusUpdate,
            variant: 'primary',
            loading: actionLoading,
            disabled: !newStatus
          }
        ]}
      >
        <div className="status-modal-content">
          <p>Current Status: {getStatusBadge(supplier.status)}</p>
          <div className="status-options">
            <label>New Status:</label>
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
              className="status-select"
            >
              <option value="">Select new status</option>
              {Object.entries(supplierStatus).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Supplier"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowDeleteModal(false),
            variant: 'secondary'
          },
          {
            label: 'Delete',
            onClick: handleDelete,
            variant: 'danger',
            loading: actionLoading
          }
        ]}
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete supplier <strong>{supplier.name}</strong>?</p>
          <p className="warning-text">
            This action cannot be undone. All associated data including orders, 
            documents, and performance history will be permanently removed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierProfile;