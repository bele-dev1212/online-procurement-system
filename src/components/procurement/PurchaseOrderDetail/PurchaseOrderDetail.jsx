import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './PurchaseOrderDetail.css';

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getPurchaseOrder, 
    updatePurchaseOrderStatus, 
    deletePurchaseOrder,
    loading, 
    error 
  } = usePurchaseOrders();
  
  const { addNotification } = useNotifications();
  
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPurchaseOrder();
  }, [id]);

  const loadPurchaseOrder = async () => {
    try {
      const data = await getPurchaseOrder(id);
      setPurchaseOrder(data);
      setSelectedStatus(data.status);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load purchase order', 'error');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updatePurchaseOrderStatus(id, selectedStatus, notes);
      await loadPurchaseOrder();
      setIsStatusModalOpen(false);
      setNotes('');
      addNotification('Purchase order status updated successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePurchaseOrder(id);
      addNotification('Purchase order deleted successfully', 'success');
      navigate('/procurement/purchase-orders');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to delete purchase order', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF
    addNotification('PDF download started', 'info');
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      draft: 'status-badge--draft',
      pending: 'status-badge--pending',
      approved: 'status-badge--approved',
      rejected: 'status-badge--rejected',
      ordered: 'status-badge--ordered',
      received: 'status-badge--received',
      cancelled: 'status-badge--cancelled'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--draft'}`;
  };

  const getStatusOptions = () => {
    const statusFlow = {
      draft: ['pending', 'cancelled'],
      pending: ['approved', 'rejected', 'cancelled'],
      approved: ['ordered', 'cancelled'],
      ordered: ['received', 'cancelled'],
      received: [],
      rejected: ['pending'],
      cancelled: ['draft']
    };
    return statusFlow[purchaseOrder?.status] || [];
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!purchaseOrder) return <div className="not-found">Purchase order not found</div>;

  return (
    <div className="purchase-order-detail">
      {/* Header Section */}
      <div className="detail-header">
        <div className="header-left">
          <button 
            className="btn btn--secondary"
            onClick={() => navigate('/procurement/purchase-orders')}
          >
            ← Back to List
          </button>
          <h1>Purchase Order #{purchaseOrder.poNumber}</h1>
          <span className={getStatusBadgeClass(purchaseOrder.status)}>
            {purchaseOrder.status}
          </span>
        </div>
        <div className="header-actions">
          <button className="btn btn--outline" onClick={handlePrint}>
            Print
          </button>
          <button className="btn btn--outline" onClick={handleDownloadPDF}>
            Download PDF
          </button>
          <button 
            className="btn btn--primary"
            onClick={() => setIsStatusModalOpen(true)}
            disabled={getStatusOptions().length === 0}
          >
            Update Status
          </button>
          <button 
            className="btn btn--danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Basic Information */}
        <div className="info-card">
          <h3>Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>PO Number</label>
              <span>{purchaseOrder.poNumber}</span>
            </div>
            <div className="info-item">
              <label>Created Date</label>
              <span>{new Date(purchaseOrder.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Delivery Date</label>
              <span>{new Date(purchaseOrder.deliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Total Amount</label>
              <span className="amount">
                ${calculateTotal(purchaseOrder.items).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="info-card">
          <h3>Supplier Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Supplier Name</label>
              <span>{purchaseOrder.supplier?.name}</span>
            </div>
            <div className="info-item">
              <label>Contact Person</label>
              <span>{purchaseOrder.supplier?.contactPerson}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{purchaseOrder.supplier?.email}</span>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span>{purchaseOrder.supplier?.phone}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="info-card">
          <h3>Order Items</h3>
          <div className="table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="total-label">Grand Total</td>
                  <td className="total-amount">
                    ${calculateTotal(purchaseOrder.items).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Additional Information */}
        <div className="info-card">
          <h3>Additional Information</h3>
          <div className="info-grid">
            <div className="info-item full-width">
              <label>Shipping Address</label>
              <span>{purchaseOrder.shippingAddress}</span>
            </div>
            <div className="info-item full-width">
              <label>Terms & Conditions</label>
              <span>{purchaseOrder.terms || 'Standard 30 days payment terms'}</span>
            </div>
            <div className="info-item full-width">
              <label>Notes</label>
              <span>{purchaseOrder.notes || 'No additional notes'}</span>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="info-card">
          <h3>Activity Log</h3>
          <div className="activity-timeline">
            {purchaseOrder.auditTrail?.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <div className="activity-title">{activity.action}</div>
                  <div className="activity-meta">
                    By {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                  </div>
                  {activity.notes && (
                    <div className="activity-notes">{activity.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Purchase Order Status"
      >
        <div className="status-modal">
          <div className="form-group">
            <label>New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
            >
              <option value="">Select Status</option>
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
              disabled={!selectedStatus}
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
        title="Delete Purchase Order"
      >
        <div className="delete-modal">
          <p>Are you sure you want to delete purchase order #{purchaseOrder.poNumber}? This action cannot be undone.</p>
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
              Delete Purchase Order
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseOrderDetail;