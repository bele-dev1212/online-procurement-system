import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import { CurrencyFormatters, DataFormatters } from '../../../utils/helpers/formatters';

import { PURCHASE_ORDER_STATUS } from '../../../utils/enums/purchaseOrderStatus';
import './ViewPurchaseOrder.css';

const ViewPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    purchaseOrders, 
    loading, 
    updatePurchaseOrderStatus,
    deletePurchaseOrder
  } = usePurchaseOrders();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (purchaseOrders.length > 0 && id) {
      const foundPO = purchaseOrders.find(po => po.id === id);
      setPurchaseOrder(foundPO);
    }
  }, [purchaseOrders, id]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    setActionLoading(true);
    try {
      await updatePurchaseOrderStatus(id, newStatus);
      setShowStatusModal(false);
      setNewStatus('');
      
      // Update local state
      setPurchaseOrder(prev => ({
        ...prev,
        status: newStatus,
        statusHistory: [
          ...prev.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            updatedBy: 'Current User' // In real app, get from auth context
          }
        ]
      }));
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deletePurchaseOrder(id);
      navigate('/procurement/purchase-orders', {
        state: { message: `Purchase Order ${purchaseOrder.poNumber} deleted successfully` }
      });
    } catch (error) {
      console.error('Failed to delete PO:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In real app, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };

  const handleSendToSupplier = () => {
    // In real app, this would send email to supplier
    alert('Email functionality would be implemented here');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'status-draft', label: 'Draft' },
      pending: { class: 'status-pending', label: 'Pending Approval' },
      approved: { class: 'status-approved', label: 'Approved' },
      ordered: { class: 'status-ordered', label: 'Ordered' },
      shipped: { class: 'status-shipped', label: 'Shipped' },
      delivered: { class: 'status-delivered', label: 'Delivered' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled' },
      rejected: { class: 'status-rejected', label: 'Rejected' }
    };

    const config = statusConfig[status] || { class: 'status-default', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'priority-low', label: 'Low' },
      medium: { class: 'priority-medium', label: 'Medium' },
      high: { class: 'priority-high', label: 'High' },
      urgent: { class: 'priority-urgent', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || { class: 'priority-low', label: 'Low' };
    return <span className={`priority-badge ${config.class}`}>{config.label}</span>;
  };

  const getAvailableStatusActions = () => {
    if (!purchaseOrder) return [];

    const statusFlow = {
      draft: ['pending', 'cancelled'],
      pending: ['approved', 'rejected', 'cancelled'],
      approved: ['ordered', 'cancelled'],
      ordered: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      rejected: []
    };

    return statusFlow[purchaseOrder.status] || [];
  };

  if (loading) {
    return (
      <div className="view-po-loading">
        <LoadingSpinner size="large" />
        <p>Loading purchase order...</p>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="view-po-not-found">
        <div className="not-found-content">
          <h2>Purchase Order Not Found</h2>
          <p>The purchase order you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/procurement/purchase-orders" className="btn-primary">
            Back to Purchase Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="view-purchase-order">
      {/* Header */}
      <div className="po-header">
        <div className="header-left">
          <div className="breadcrumb">
            <Link to="/procurement/purchase-orders" className="breadcrumb-link">
              Purchase Orders
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span>{purchaseOrder.poNumber}</span>
          </div>
          <div className="po-title-section">
            <h1>Purchase Order: {purchaseOrder.poNumber}</h1>
            <div className="status-priority">
              {getStatusBadge(purchaseOrder.status)}
              {getPriorityBadge(purchaseOrder.priority)}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn-outline" title="Print">
            🖨️ Print
          </button>
          <button onClick={handleDownloadPDF} className="btn-outline" title="Download PDF">
            📄 PDF
          </button>
          {purchaseOrder.status === 'approved' && (
            <button onClick={handleSendToSupplier} className="btn-secondary" title="Send to Supplier">
              📧 Send to Supplier
            </button>
          )}
          <Link 
            to={`/procurement/purchase-orders/${id}/edit`}
            className="btn-primary"
          >
            ✏️ Edit
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-info">
          <span>Created: {formatDate(purchaseOrder.createdAt)}</span>
          {purchaseOrder.updatedAt && (
            <span>Last Updated: {formatDate(purchaseOrder.updatedAt)}</span>
          )}
        </div>
        <div className="action-buttons">
          {getAvailableStatusActions().length > 0 && (
            <button 
              onClick={() => setShowStatusModal(true)}
              className="btn-secondary"
            >
              Update Status
            </button>
          )}
          {['draft', 'cancelled'].includes(purchaseOrder.status) && (
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="po-tabs">
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          📋 Details
        </button>
        <button 
          className={`tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          📦 Line Items
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 History
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
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="details-content">
            <div className="details-grid">
              {/* Basic Information */}
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>PO Number</label>
                    <span>{purchaseOrder.poNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    {getStatusBadge(purchaseOrder.status)}
                  </div>
                  <div className="detail-item">
                    <label>Priority</label>
                    {getPriorityBadge(purchaseOrder.priority)}
                  </div>
                  <div className="detail-item">
                    <label>Created Date</label>
                    <span>{formatDateTime(purchaseOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Delivery Date</label>
                    <span>{formatDate(purchaseOrder.deliveryDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Terms</label>
                    <span>{purchaseOrder.terms?.replace('net', 'Net ').replace('dueOnReceipt', 'Due on Receipt')}</span>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="detail-section">
                <h3>Supplier Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Supplier</label>
                    <span>{purchaseOrder.supplier?.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Company</label>
                    <span>{purchaseOrder.supplier?.companyName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact Email</label>
                    <span>{purchaseOrder.supplier?.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{purchaseOrder.supplier?.phone}</span>
                  </div>
                  {purchaseOrder.supplier?.rating && (
                    <div className="detail-item">
                      <label>Rating</label>
                      <span className="supplier-rating">
                        ★ {purchaseOrder.supplier.rating}/5
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="detail-section">
                <h3>Address Information</h3>
                <div className="address-grid">
                  <div className="address-item">
                    <h4>Shipping Address</h4>
                    <p>{purchaseOrder.shippingAddress || 'Same as supplier address'}</p>
                  </div>
                  <div className="address-item">
                    <h4>Billing Address</h4>
                    <p>{purchaseOrder.billingAddress || 'Same as supplier address'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="detail-section">
                <h3>Financial Summary</h3>
                <div className="financial-grid">
                  <div className="financial-item">
                    <label>Subtotal</label>
                    <span>{formatCurrency(purchaseOrder.subtotal)}</span>
                  </div>
                  <div className="financial-item">
                    <label>Tax</label>
                    <span>{formatCurrency(purchaseOrder.taxAmount)}</span>
                  </div>
                  <div className="financial-item total">
                    <label>Total Amount</label>
                    <span>{formatCurrency(purchaseOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {purchaseOrder.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <div className="notes-content">
                    <p>{purchaseOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Line Items Tab */}
        {activeTab === 'items' && (
          <div className="items-content">
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product / Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Tax Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrder.lineItems?.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="item-number">{index + 1}</td>
                      <td className="item-description">
                        <div>
                          <strong>{item.description}</strong>
                          {item.productId && (
                            <span className="product-id">Product ID: {item.productId}</span>
                          )}
                        </div>
                      </td>
                      <td className="item-quantity">{item.quantity}</td>
                      <td className="item-price">{formatCurrency(item.unitPrice)}</td>
                      <td className="item-tax">{item.taxRate}%</td>
                      <td className="item-total">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4"></td>
                    <td className="footer-label">Subtotal:</td>
                    <td className="footer-value">{formatCurrency(purchaseOrder.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4"></td>
                    <td className="footer-label">Tax:</td>
                    <td className="footer-value">{formatCurrency(purchaseOrder.taxAmount)}</td>
                  </tr>
                  <tr className="footer-total">
                    <td colSpan="4"></td>
                    <td className="footer-label">Total:</td>
                    <td className="footer-value">{formatCurrency(purchaseOrder.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-content">
            <div className="timeline">
              {purchaseOrder.statusHistory?.map((history, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="status-change">
                        Status changed to <strong>{purchaseOrderStatus[history.status] || history.status}</strong>
                      </span>
                      <span className="timeline-date">
                        {formatDateTime(history.timestamp)}
                      </span>
                    </div>
                    <div className="timeline-details">
                      <span>Updated by: {history.updatedBy}</span>
                      {history.notes && (
                        <p className="timeline-notes">{history.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!purchaseOrder.statusHistory || purchaseOrder.statusHistory.length === 0) && (
                <div className="no-history">
                  <p>No status history available for this purchase order.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="documents-content">
            <div className="documents-list">
              <div className="document-item">
                <div className="document-icon">📄</div>
                <div className="document-info">
                  <h4>Purchase Order {purchaseOrder.poNumber}</h4>
                  <p>Generated on {formatDate(purchaseOrder.createdAt)}</p>
                </div>
                <div className="document-actions">
                  <button onClick={handleDownloadPDF} className="btn-outline">
                    Download
                  </button>
                  <button onClick={handlePrint} className="btn-outline">
                    Print
                  </button>
                </div>
              </div>
              
              {/* In real app, you would map through actual documents */}
              <div className="no-documents">
                <p>No additional documents attached to this purchase order.</p>
                <button className="btn-outline">
                  + Upload Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Purchase Order Status"
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
          <p>Current Status: {getStatusBadge(purchaseOrder.status)}</p>
          
          <div className="status-options">
            <label>New Status:</label>
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
              className="status-select"
            >
              <option value="">Select new status</option>
              {getAvailableStatusActions().map(status => (
                <option key={status} value={status}>
                  {purchaseOrderStatus[status] || status}
                </option>
              ))}
            </select>
          </div>

          {newStatus && (
            <div className="status-notes">
              <label>Notes (Optional):</label>
              <textarea 
                placeholder="Add any notes about this status change..."
                rows="3"
                className="notes-textarea"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Purchase Order"
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
          <p>Are you sure you want to delete purchase order <strong>{purchaseOrder.poNumber}</strong>?</p>
          <p className="warning-text">This action cannot be undone. All associated data will be permanently removed.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ViewPurchaseOrder;