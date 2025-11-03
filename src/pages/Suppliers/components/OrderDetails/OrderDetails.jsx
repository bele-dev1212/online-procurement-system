// src/pages/Suppliers/components/OrderDetails/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { suppliersAPI } from '../../../../services/api/suppliersAPI';
import Modal from '../../../../components/common/Modal/Modal';
import ConfirmDialog from '../../../../components/common/Modal/ConfirmDialog';
import Notification from '../../../../components/common/Notification/Notification';
import LoadingSpinner from '../../../../components/common/LoadingSpinner/LoadingSpinner';
import './OrderDetails.css';

const OrderDetails = ({ order, onClose, onStatusUpdate, onCancel }) => {
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load detailed order information
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!order?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await supplierAPI.getOrderDetails(order.id);
        
        if (response.success) {
          setOrderDetails(response.data.order);
        } else {
          throw new Error(response.message || 'Failed to load order details');
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError(err.message || 'Failed to load order details. Please try again.');
        
        // Fallback to basic order data
        if (order) {
          setOrderDetails({
            ...order,
            items: order.items || [],
            shippingAddress: order.shippingAddress || {},
            billingAddress: order.billingAddress || {},
            timeline: order.timeline || [],
            documents: order.documents || []
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [order]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { class: 'status-pending', text: 'Pending', icon: '⏳', color: '#F59E0B' },
      'confirmed': { class: 'status-confirmed', text: 'Confirmed', icon: '✅', color: '#10B981' },
      'in_production': { class: 'status-production', text: 'In Production', icon: '🏭', color: '#3B82F6' },
      'quality_check': { class: 'status-quality', text: 'Quality Check', icon: '🔍', color: '#8B5CF6' },
      'ready_to_ship': { class: 'status-ready', text: 'Ready to Ship', icon: '📦', color: '#EC4899' },
      'shipped': { class: 'status-shipped', text: 'Shipped', icon: '🚚', color: '#6366F1' },
      'out_for_delivery': { class: 'status-delivery', text: 'Out for Delivery', icon: '📮', color: '#F97316' },
      'delivered': { class: 'status-delivered', text: 'Delivered', icon: '🎉', color: '#059669' },
      'cancelled': { class: 'status-cancelled', text: 'Cancelled', icon: '❌', color: '#DC2626' },
      'on_hold': { class: 'status-hold', text: 'On Hold', icon: '⏸️', color: '#6B7280' },
      'partially_shipped': { class: 'status-partial', text: 'Partially Shipped', icon: '📤', color: '#8B5CF6' }
    };
    
    return statusMap[status] || { class: 'status-default', text: status, icon: '❓', color: '#6B7280' };
  };

  // Get priority info
  const getPriorityInfo = (priority) => {
    const priorityMap = {
      'low': { class: 'priority-low', text: 'Low', icon: '⬇️' },
      'normal': { class: 'priority-normal', text: 'Normal', icon: '➡️' },
      'high': { class: 'priority-high', text: 'High', icon: '⬆️' },
      'urgent': { class: 'priority-urgent', text: 'Urgent', icon: '🚨' }
    };
    
    return priorityMap[priority] || { class: 'priority-normal', text: 'Normal', icon: '➡️' };
  };

  // Calculate order totals
  const calculateTotals = () => {
    if (!orderDetails) return {};
    
    const subtotal = orderDetails.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
    const tax = orderDetails.taxAmount || subtotal * 0.1; // 10% tax if not specified
    const shipping = orderDetails.shippingCost || 0;
    const discount = orderDetails.discountAmount || 0;
    const total = subtotal + tax + shipping - discount;
    
    return { subtotal, tax, shipping, discount, total };
  };

  // Check if order is overdue
  const isOverdue = () => {
    if (!orderDetails?.deliveryDate) return false;
    return new Date(orderDetails.deliveryDate) < new Date() && 
           !['delivered', 'cancelled'].includes(orderDetails.status);
  };

  // Check if order requires attention
  const requiresAttention = () => {
    return orderDetails?.status === 'pending' || 
           isOverdue() || 
           orderDetails?.priority === 'urgent';
  };

  // Get next available status options
  const getNextStatusOptions = () => {
    if (!orderDetails) return [];
    
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in_production', 'on_hold', 'cancelled'],
      'in_production': ['quality_check', 'on_hold'],
      'quality_check': ['ready_to_ship', 'in_production'],
      'ready_to_ship': ['shipped'],
      'shipped': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'on_hold': ['in_production', 'cancelled'],
      'partially_shipped': ['shipped', 'out_for_delivery']
    };
    
    return statusFlow[orderDetails.status] || [];
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus, notes = '') => {
    if (!orderDetails) return;
    
    try {
      setUpdatingStatus(true);
      const response = await supplierAPI.updateOrderStatus(orderDetails.id, {
        status: newStatus,
        notes: notes,
        updatedBy: user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        setShowStatusUpdate(false);
        setSuccessMessage(`Order status updated to ${newStatus.replace('_', ' ')} successfully!`);
        
        // Update local state
        setOrderDetails(prev => ({
          ...prev,
          status: newStatus,
          lastUpdated: new Date().toISOString()
        }));
        
        // Call parent callback if provided
        if (onStatusUpdate) {
          onStatusUpdate();
        }
        
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (cancellationReason = '') => {
    if (!orderDetails) return;
    
    if (!cancellationReason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    
    try {
      setCancelling(true);
      const response = await supplierAPI.cancelOrder(orderDetails.id, {
        reason: cancellationReason,
        cancelledBy: user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        setShowCancelConfirm(false);
        setSuccessMessage('Order cancelled successfully!');
        
        // Update local state
        setOrderDetails(prev => ({
          ...prev,
          status: 'cancelled',
          lastUpdated: new Date().toISOString()
        }));
        
        // Call parent callback if provided
        if (onCancel) {
          onCancel();
        }
        
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setError(err.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // Handle document download
  const handleDownloadDocument = async (document) => {
    try {
      setDownloading(true);
      setError(null);
      
      // Simulate download - in real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = `#${document.name}`; // This would be the actual file URL
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage(`Downloaded ${document.name} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Handle print order
  const handlePrintOrder = () => {
    window.print();
  };

  if (loading && !orderDetails) {
    return (
      <div className="order-details">
        <div className="order-header">
          <h1>Order Details</h1>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
        <LoadingSpinner message="Loading order details..." />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-details">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Order Not Found</h3>
          <p>The requested order could not be loaded.</p>
          <button className="btn btn-primary" onClick={onClose}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(orderDetails.status);
  const priorityInfo = getPriorityInfo(orderDetails.priority);
  const totals = calculateTotals();
  const nextStatusOptions = getNextStatusOptions();
  const canUpdateStatus = nextStatusOptions.length > 0;
  const canCancel = !['delivered', 'cancelled'].includes(orderDetails.status);

  return (
    <div className="order-details">
      {/* Notifications */}
      {error && (
        <Notification 
          type="error" 
          message={error}
          onClose={() => setError(null)}
          autoClose={5000}
        />
      )}
      
      {successMessage && (
        <Notification 
          type="success" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
          autoClose={5000}
        />
      )}

      {/* Header Section */}
      <div className="order-header">
        <div className="header-main">
          <h1>Order Details</h1>
          <div className="order-meta">
            <span className="order-number">{orderDetails.orderNumber}</span>
            <span className={`status-badge ${statusInfo.class}`}>
              <span className="status-icon">{statusInfo.icon}</span>
              {statusInfo.text}
            </span>
            {requiresAttention() && (
              <span className="attention-badge">Attention Required</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={handlePrintOrder}
          >
            Print Order
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="order-content">
        <div className="content-grid">
          {/* Left Column - Order Information */}
          <div className="info-column">
            {/* Order Summary */}
            <div className="section-card">
              <h2>Order Summary</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Order Date:</label>
                  <span className="info-value">{formatDateTime(orderDetails.orderDate)}</span>
                </div>
                
                <div className="info-item">
                  <label>Delivery Date:</label>
                  <span className="info-value">
                    {formatDate(orderDetails.deliveryDate)}
                    {isOverdue() && <span className="overdue-indicator"> (Overdue)</span>}
                  </span>
                </div>
                
                <div className="info-item">
                  <label>Priority:</label>
                  <span className={`priority-badge ${priorityInfo.class}`}>
                    {priorityInfo.icon} {priorityInfo.text}
                  </span>
                </div>
                
                <div className="info-item">
                  <label>Customer PO Number:</label>
                  <span className="info-value">{orderDetails.customerPONumber || 'Not provided'}</span>
                </div>
                
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span className="info-value">{formatDateTime(orderDetails.lastUpdated)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="section-card">
              <h2>Customer Information</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Organization:</label>
                  <span className="info-value">{orderDetails.procurementOrganization}</span>
                </div>
                
                <div className="info-item">
                  <label>Contact Person:</label>
                  <span className="info-value">{orderDetails.customerContact}</span>
                </div>
                
                <div className="info-item">
                  <label>Email:</label>
                  <span className="info-value">{orderDetails.customerEmail}</span>
                </div>
                
                <div className="info-item">
                  <label>Phone:</label>
                  <span className="info-value">{orderDetails.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {orderDetails.shippingAddress && (
              <div className="section-card">
                <h2>Shipping Address</h2>
                
                <div className="address-display">
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                  
                  {orderDetails.shippingAddress.instructions && (
                    <div className="shipping-instructions">
                      <strong>Special Instructions:</strong>
                      <p>{orderDetails.shippingAddress.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {orderDetails.timeline && orderDetails.timeline.length > 0 && (
              <div className="section-card">
                <h2>Order Timeline</h2>
                
                <div className="timeline">
                  {orderDetails.timeline.map((event, index) => (
                    <div key={index} className="timeline-event">
                      <div className="event-icon">●</div>
                      <div className="event-content">
                        <div className="event-title">{event.status}</div>
                        <div className="event-date">{formatDateTime(event.timestamp)}</div>
                        {event.notes && (
                          <div className="event-notes">{event.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Items and Actions */}
          <div className="details-column">
            {/* Order Items */}
            <div className="section-card">
              <h2>Order Items ({orderDetails.items?.length || 0})</h2>
              
              {orderDetails.items && orderDetails.items.length > 0 ? (
                <div className="items-table">
                  <div className="table-header">
                    <span>Item</span>
                    <span>Quantity</span>
                    <span>Unit Price</span>
                    <span>Total</span>
                  </div>
                  
                  <div className="table-body">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="table-row">
                        <div className="item-details">
                          <div className="item-name">{item.productName}</div>
                          {item.productSku && (
                            <div className="item-sku">SKU: {item.productSku}</div>
                          )}
                          {item.specifications && (
                            <div className="item-specs">{item.specifications}</div>
                          )}
                        </div>
                        <div className="item-quantity">{item.quantity}</div>
                        <div className="item-price">{formatCurrency(item.unitPrice)}</div>
                        <div className="item-total">{formatCurrency(item.quantity * item.unitPrice)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="table-footer">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="total-row">
                        <span>Discount:</span>
                        <span className="discount">-{formatCurrency(totals.discount)}</span>
                      </div>
                    )}
                    <div className="total-row">
                      <span>Tax:</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="total-row">
                      <span>Shipping:</span>
                      <span>{formatCurrency(totals.shipping)}</span>
                    </div>
                    <div className="total-row grand-total">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No items found in this order.</p>
                </div>
              )}
            </div>

            {/* Order Notes */}
            {orderDetails.notes && (
              <div className="section-card">
                <h2>Order Notes</h2>
                <div className="notes-content">
                  <p>{orderDetails.notes}</p>
                </div>
              </div>
            )}

            {/* Documents */}
            {orderDetails.documents && orderDetails.documents.length > 0 && (
              <div className="section-card">
                <h2>Documents ({orderDetails.documents.length})</h2>
                
                <div className="documents-list">
                  {orderDetails.documents.map((doc, index) => (
                    <div key={index} className="document-item">
                      <div className="document-icon">📄</div>
                      <div className="document-info">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-type">{doc.type}</span>
                      </div>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownloadDocument(doc)}
                        disabled={downloading}
                      >
                        {downloading ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="section-card">
              <h2>Quick Actions</h2>
              
              <div className="action-buttons">
                {canUpdateStatus && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowStatusUpdate(true)}
                    disabled={updatingStatus}
                  >
                    Update Status
                  </button>
                )}
                
                {canCancel && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelling}
                  >
                    Cancel Order
                  </button>
                )}
                
                <Link 
                  to={`/supplier/orders/${orderDetails.id}/tracking`}
                  className="btn btn-outline"
                >
                  Track Shipment
                </Link>
                
                <button className="btn btn-outline" onClick={handlePrintOrder}>
                  Print Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusUpdate}
        onClose={() => setShowStatusUpdate(false)}
        title="Update Order Status"
        size="medium"
      >
        <div className="status-update-modal">
          <div className="current-status">
            <strong>Current Status:</strong>
            <span className={`status-badge ${statusInfo.class}`}>
              {statusInfo.icon} {statusInfo.text}
            </span>
          </div>
          
          <div className="status-options">
            <h4>Update to:</h4>
            <div className="options-grid">
              {nextStatusOptions.map(status => {
                const nextStatusInfo = getStatusInfo(status);
                return (
                  <button
                    key={status}
                    className={`status-option ${nextStatusInfo.class}`}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updatingStatus}
                  >
                    <span className="option-icon">{nextStatusInfo.icon}</span>
                    <span className="option-text">{nextStatusInfo.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {updatingStatus && (
            <div className="updating-indicator">
              <LoadingSpinner size="small" message="Updating status..." />
            </div>
          )}
        </div>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={(reason) => handleCancelOrder(reason)}
        title="Cancel Order"
        message={`Are you sure you want to cancel order "${orderDetails.orderNumber}"? This action cannot be undone and may affect your supplier rating.`}
        confirmText="Cancel Order"
        cancelText="Keep Order"
        type="danger"
        loading={cancelling}
        showReasonInput={true}
        reasonPlaceholder="Please provide a reason for cancellation..."
        reasonRequired={true}
      />
    </div>
  );
};

export default OrderDetails;