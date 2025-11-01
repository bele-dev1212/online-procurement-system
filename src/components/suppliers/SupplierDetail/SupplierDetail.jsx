import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './SupplierDetail.css';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSupplier, updateSupplierStatus, deleteSupplier, loading, error } = useSuppliers();
  const { getPurchaseOrdersBySupplier } = usePurchaseOrders();
  const { addNotification } = useNotifications();

  const [supplier, setSupplier] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSupplier();
    loadPurchaseOrders();
  }, [id]);

  const loadSupplier = async () => {
    try {
      const data = await getSupplier(id);
      setSupplier(data);
      setSelectedStatus(data.status);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load supplier', 'error');
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const data = await getPurchaseOrdersBySupplier(id);
      setPurchaseOrders(data);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateSupplierStatus(id, selectedStatus, notes);
      await loadSupplier();
      setIsStatusModalOpen(false);
      setNotes('');
      addNotification('Supplier status updated successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier(id);
      addNotification('Supplier deleted successfully', 'success');
      navigate('/suppliers');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to delete supplier', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-badge--active',
      inactive: 'status-badge--inactive',
      pending: 'status-badge--pending',
      suspended: 'status-badge--suspended',
      'on-hold': 'status-badge--on-hold'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--pending'}`;
  };

  const getApprovalBadgeClass = (approvalStatus) => {
    const approvalClasses = {
      approved: 'approval-badge--approved',
      pending: 'approval-badge--pending',
      rejected: 'approval-badge--rejected',
      'under-review': 'approval-badge--under-review'
    };
    return `approval-badge ${approvalClasses[approvalStatus] || 'approval-badge--pending'}`;
  };

  const getPerformanceClass = (performance) => {
    if (performance >= 90) return 'performance--excellent';
    if (performance >= 80) return 'performance--good';
    if (performance >= 70) return 'performance--average';
    if (performance >= 60) return 'performance--poor';
    return 'performance--critical';
  };

  const renderRatingStars = (rating) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${
              star <= Math.floor(rating) ? 'full' : star === Math.ceil(rating) && !Number.isInteger(rating) ? 'half' : ''
            }`}
          >
            ★
          </span>
        ))}
        <span className="rating-value">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const calculateSupplierStats = () => {
    if (!supplier) return {};
    
    const totalOrders = purchaseOrders.length;
    const completedOrders = purchaseOrders.filter(po => po.status === 'received').length;
    const pendingOrders = purchaseOrders.filter(po => ['pending', 'approved', 'ordered'].includes(po.status)).length;
    const totalSpend = purchaseOrders
      .filter(po => po.status === 'received')
      .reduce((total, po) => total + po.totalAmount, 0);
    const avgDeliveryTime = supplier.avgDeliveryTime || 'N/A';

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalSpend,
      avgDeliveryTime
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusOptions = () => {
    return ['active', 'inactive', 'pending', 'suspended', 'on-hold'];
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!supplier) return <div className="not-found">Supplier not found</div>;

  const stats = calculateSupplierStats();

  return (
    <div className="supplier-detail">
      {/* Header Section */}
      <div className="detail-header">
        <div className="header-left">
          <button 
            className="btn btn--secondary"
            onClick={() => navigate('/suppliers')}
          >
            ← Back to Suppliers
          </button>
          <div className="supplier-title">
            <div className="supplier-avatar">
              {supplier.name.charAt(0).toUpperCase()}
            </div>
            <div className="title-content">
              <h1>{supplier.name}</h1>
              <div className="supplier-meta">
                <span className="supplier-category">{supplier.category}</span>
                <span className={getStatusBadgeClass(supplier.status)}>
                  {supplier.status}
                </span>
                <span className={getApprovalBadgeClass(supplier.approvalStatus)}>
                  {supplier.approvalStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Link 
            to={`/suppliers/edit/${supplier.id}`}
            className="btn btn--secondary"
          >
            <i className="icon-edit"></i>
            Edit Supplier
          </Link>
          <button 
            className="btn btn--primary"
            onClick={() => setIsStatusModalOpen(true)}
          >
            <i className="icon-refresh-cw"></i>
            Update Status
          </button>
          <button 
            className="btn btn--danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <i className="icon-trash"></i>
            Delete
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-shopping-cart"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedOrders}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-clock"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.totalSpend)}</div>
            <div className="stat-label">Total Spend</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-truck"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgDeliveryTime}</div>
            <div className="stat-label">Avg Delivery (days)</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="icon-info"></i>
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <i className="icon-trending-up"></i>
          Performance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="icon-file-text"></i>
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
        >
          <i className="icon-shield"></i>
          Compliance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <i className="icon-folder"></i>
          Documents
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="content-grid">
              {/* Basic Information */}
              <div className="info-card">
                <h3>Basic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Supplier Name</label>
                    <span>{supplier.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Category</label>
                    <span className="category-badge">{supplier.category}</span>
                  </div>
                  <div className="info-item">
                    <label>Tax ID</label>
                    <span>{supplier.taxId || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>Website</label>
                    <span>
                      {supplier.website ? (
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                          {supplier.website}
                        </a>
                      ) : 'Not provided'}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <label>Description</label>
                    <p>{supplier.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="info-card">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Contact Person</label>
                    <span>{supplier.contactPerson}</span>
                  </div>
                  <div className="info-item">
                    <label>Role/Position</label>
                    <span>{supplier.contactRole || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>
                      <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>
                      <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Mobile</label>
                    <span>
                      {supplier.mobile ? (
                        <a href={`tel:${supplier.mobile}`}>{supplier.mobile}</a>
                      ) : 'Not provided'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Fax</label>
                    <span>{supplier.fax || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="info-card">
                <h3>Address Information</h3>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <label>Street Address</label>
                    <span>{supplier.address?.street || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>City</label>
                    <span>{supplier.address?.city || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>State/Province</label>
                    <span>{supplier.address?.state || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>ZIP/Postal Code</label>
                    <span>{supplier.address?.zipCode || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>Country</label>
                    <span>{supplier.address?.country || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="info-card">
                <h3>Business Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Business Type</label>
                    <span>{supplier.businessType || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Ownership Type</label>
                    <span>{supplier.ownershipType || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Year Established</label>
                    <span>{supplier.yearEstablished || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Employee Count</label>
                    <span>{supplier.employeeCount || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Annual Revenue</label>
                    <span>
                      {supplier.annualRevenue ? formatCurrency(supplier.annualRevenue) : 'Not specified'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Payment Terms</label>
                    <span>{supplier.paymentTerms || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Delivery Time</label>
                    <span>{supplier.deliveryTime ? `${supplier.deliveryTime} days` : 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="performance-content">
            <div className="content-grid">
              {/* Performance Metrics */}
              <div className="info-card">
                <h3>Performance Metrics</h3>
                <div className="performance-metrics">
                  <div className="metric">
                    <label>Overall Rating</label>
                    <div className="metric-value">
                      {renderRatingStars(supplier.rating)}
                    </div>
                  </div>
                  <div className="metric">
                    <label>Quality Rating</label>
                    <div className="metric-value">
                      {renderRatingStars(supplier.qualityRating)}
                    </div>
                  </div>
                  <div className="metric">
                    <label>Performance Score</label>
                    <div className="metric-value">
                      <div className="performance-score">
                        <div className={`score-circle ${getPerformanceClass(supplier.performance)}`}>
                          <span className="score-value">{supplier.performance}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="metric">
                    <label>On-Time Delivery</label>
                    <div className="metric-value">
                      <div className="delivery-rate">
                        <span className="rate-value">{(supplier.onTimeDeliveryRate || 0).toFixed(1)}%</span>
                        <div className="rate-bar">
                          <div 
                            className="rate-fill"
                            style={{ width: `${supplier.onTimeDeliveryRate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance History */}
              <div className="info-card">
                <h3>Performance History</h3>
                <div className="performance-history">
                  <p>Performance tracking data will be displayed here...</p>
                  {/* In a real app, this would show charts and historical data */}
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="info-card">
                <h3>Quality Metrics</h3>
                <div className="quality-metrics">
                  <div className="quality-item">
                    <label>Defect Rate</label>
                    <span className="defect-rate">{(supplier.defectRate || 0).toFixed(2)}%</span>
                  </div>
                  <div className="quality-item">
                    <label>Return Rate</label>
                    <span className="return-rate">{(supplier.returnRate || 0).toFixed(2)}%</span>
                  </div>
                  <div className="quality-item">
                    <label>Customer Satisfaction</label>
                    <span className="satisfaction-rate">{(supplier.customerSatisfaction || 0).toFixed(1)}/5</span>
                  </div>
                </div>
              </div>

              {/* Notes & Comments */}
              <div className="info-card">
                <h3>Notes & Comments</h3>
                <div className="notes-section">
                  <p>{supplier.notes || 'No additional notes or comments.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-content">
            <div className="orders-header">
              <h3>Purchase Orders</h3>
              <Link to="/procurement/purchase-orders/create" className="btn btn--primary">
                <i className="icon-plus"></i>
                Create New PO
              </Link>
            </div>
            
            {purchaseOrders.length === 0 ? (
              <div className="no-orders">
                <i className="icon-file-text"></i>
                <h4>No Purchase Orders</h4>
                <p>This supplier doesn't have any purchase orders yet.</p>
                <Link to="/procurement/purchase-orders/create" className="btn btn--primary">
                  Create First PO
                </Link>
              </div>
            ) : (
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Order Date</th>
                      <th>Delivery Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map(order => (
                      <tr key={order.id}>
                        <td className="po-number">
                          <Link to={`/procurement/purchase-orders/${order.id}`}>
                            {order.poNumber}
                          </Link>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{formatDate(order.deliveryDate)}</td>
                        <td className="amount">{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <span className={`status-badge status-badge--${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="actions">
                          <Link 
                            to={`/procurement/purchase-orders/${order.id}`}
                            className="btn btn--sm btn--outline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="compliance-content">
            <div className="content-grid">
              {/* Compliance Status */}
              <div className="info-card">
                <h3>Compliance Status</h3>
                <div className="compliance-status">
                  <div className="status-item">
                    <label>Overall Compliance</label>
                    <span className={`compliance-badge compliance-badge--${supplier.complianceStatus}`}>
                      {supplier.complianceStatus}
                    </span>
                  </div>
                  <div className="status-item">
                    <label>Last Audit Date</label>
                    <span>{supplier.lastAuditDate ? formatDate(supplier.lastAuditDate) : 'Not audited'}</span>
                  </div>
                  <div className="status-item">
                    <label>Next Audit Due</label>
                    <span>{supplier.nextAuditDue ? formatDate(supplier.nextAuditDue) : 'Not scheduled'}</span>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="info-card">
                <h3>Certifications & Accreditations</h3>
                <div className="certifications-list">
                  {supplier.certifications && supplier.certifications.length > 0 ? (
                    <ul>
                      {supplier.certifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-certifications">No certifications recorded.</p>
                  )}
                </div>
              </div>

              {/* Banking Information */}
              <div className="info-card">
                <h3>Banking Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Bank Name</label>
                    <span>{supplier.bankName || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>Account Number</label>
                    <span>{supplier.accountNumber ? '••••' + supplier.accountNumber.slice(-4) : 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>Routing Number</label>
                    <span>{supplier.routingNumber || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>IBAN</label>
                    <span>{supplier.iban || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>SWIFT/BIC Code</label>
                    <span>{supplier.swiftCode || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="documents-content">
            <div className="documents-header">
              <h3>Supplier Documents</h3>
              <button className="btn btn--primary">
                <i className="icon-upload"></i>
                Upload Document
              </button>
            </div>
            
            <div className="documents-list">
              <div className="no-documents">
                <i className="icon-folder"></i>
                <h4>No Documents</h4>
                <p>No documents have been uploaded for this supplier yet.</p>
                <button className="btn btn--primary">
                  Upload First Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Supplier Status"
      >
        <div className="status-modal">
          <div className="form-group">
            <label>New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
            >
              {getStatusOptions().map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              rows="4"
              className="form-textarea"
            />
          </div>
          <div className="modal-actions">
            <button 
              className="btn btn--secondary"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn--primary"
              onClick={handleStatusUpdate}
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Supplier"
      >
        <div className="delete-modal">
          <div className="warning-icon">
            <i className="icon-alert-triangle"></i>
          </div>
          <p>
            Are you sure you want to delete supplier <strong>"{supplier.name}"</strong>?
          </p>
          <div className="delete-warning">
            <p>
              This action will permanently delete the supplier and cannot be undone.
            </p>
            {purchaseOrders.length > 0 && (
              <p className="warning-text">
                ⚠️ This supplier has {purchaseOrders.length} associated purchase orders.
              </p>
            )}
          </div>
          <div className="modal-actions">
            <button 
              className="btn btn--secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn--danger"
              onClick={handleDelete}
            >
              Delete Supplier
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierDetail;