// src/pages/Suppliers/OrderFulfillment/OrderFulfillment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { suppliersAPI } from '../../../services/api/suppliersAPI';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import ConfirmDialog from '../../../components/common/Modal/ConfirmDialog';
import Notification from '../../../components/common/Notification/Notification';
import OrderDetails from '../components/OrderDetails/OrderDetails';
import StatusUpdateModal from '../components/StatusUpdateModal/StatusUpdateModal';
import './OrderFulfillment.css';

const OrderFulfillment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal States
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateRange: dateFilter !== 'all' ? dateFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined,
        sort: sortBy,
        order: sortOrder,
        supplierId: user?.supplierId // Ensure we only load orders for this supplier
      };

      // Remove undefined parameters
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await supplierAPI.getOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders || []);
      } else {
        throw new Error(response.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to load orders. Please try again.');
      
      // Fallback to empty array for development
      if (process.env.NODE_ENV === 'development') {
        setOrders(getMockOrders());
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, priorityFilter, searchTerm, sortBy, sortOrder, user?.supplierId]);

  // Initial load and when filters change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filter orders based on search term
  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.procurementOrganization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerContact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  // Handle status update
  const handleStatusUpdate = async (newStatus, notes = '') => {
    if (!selectedOrder) return;
    
    try {
      setUpdatingStatus(true);
      const response = await supplierAPI.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: notes,
        updatedBy: user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        setShowStatusUpdate(false);
        setSelectedOrder(null);
        setSuccessMessage(`Order status updated to ${formatStatusText(newStatus)} successfully!`);
        await loadOrders(); // Refresh the list
        
        // Auto-hide success message
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
    if (!selectedOrder) return;
    
    if (!cancellationReason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    
    try {
      setCancelling(true);
      const response = await supplierAPI.cancelOrder(selectedOrder.id, {
        reason: cancellationReason,
        cancelledBy: user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        setShowCancelConfirm(false);
        setSelectedOrder(null);
        setSuccessMessage('Order cancelled successfully!');
        await loadOrders(); // Refresh the list
        
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

  // Handle view order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle status update click
  const handleStatusUpdateClick = (order) => {
    setSelectedOrder(order);
    setShowStatusUpdate(true);
  };

  // Handle cancel order click
  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setShowCancelConfirm(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  // Format status text for display
  const formatStatusText = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get status badge class and text
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
      'on_hold': { class: 'status-hold', text: 'On Hold', icon: '⏸️', color: '#6B7280' }
    };
    
    return statusMap[status] || { class: 'status-default', text: formatStatusText(status), icon: '❓', color: '#6B7280' };
  };

  // Get priority badge class
  const getPriorityInfo = (priority) => {
    const priorityMap = {
      'low': { class: 'priority-low', text: 'Low', icon: '⬇️' },
      'normal': { class: 'priority-normal', text: 'Normal', icon: '➡️' },
      'high': { class: 'priority-high', text: 'High', icon: '⬆️' },
      'urgent': { class: 'priority-urgent', text: 'Urgent', icon: '🚨' }
    };
    
    return priorityMap[priority] || { class: 'priority-normal', text: 'Normal', icon: '➡️' };
  };

  // Calculate order statistics
  const calculateOrderStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const inProgressOrders = orders.filter(order => 
      ['confirmed', 'in_production', 'quality_check', 'ready_to_ship'].includes(order.status)
    ).length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const totalRevenue = orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
    const overdueOrders = orders.filter(order => 
      order.deliveryDate && new Date(order.deliveryDate) < new Date() && 
      !['delivered', 'cancelled'].includes(order.status)
    ).length;

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      deliveredOrders,
      totalRevenue,
      overdueOrders
    };
  };

  // Get next available status options
  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in_production', 'on_hold', 'cancelled'],
      'in_production': ['quality_check', 'on_hold'],
      'quality_check': ['ready_to_ship', 'in_production'],
      'ready_to_ship': ['shipped'],
      'shipped': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'on_hold': ['in_production', 'cancelled']
    };
    
    return statusFlow[currentStatus] || [];
  };

  // Check if order is overdue
  const isOrderOverdue = (order) => {
    return order.deliveryDate && 
           new Date(order.deliveryDate) < new Date() && 
           !['delivered', 'cancelled'].includes(order.status);
  };

  // Check if order requires attention
  const requiresAttention = (order) => {
    return order.status === 'pending' || 
           isOrderOverdue(order) || 
           order.priority === 'urgent';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setPriorityFilter('all');
    setSortBy('orderDate');
    setSortOrder('desc');
  };

  // Export orders data
  const handleExportOrders = () => {
    try {
      // Create CSV content
      const headers = ['Order ID', 'Customer', 'Total Amount', 'Order Date', 'Delivery Date', 'Priority', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredOrders.map(order => [
          `"${order.orderNumber}"`,
          `"${order.procurementOrganization || order.customerName}"`,
          order.totalAmount || 0,
          `"${formatDate(order.orderDate)}"`,
          `"${formatDate(order.deliveryDate)}"`,
          order.priority,
          order.status
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Orders exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export orders. Please try again.');
    }
  };

  // Mock data for development
  const getMockOrders = () => {
    return [
      {
        id: '1',
        orderNumber: 'PO-2024-001',
        procurementOrganization: 'Tech Corp Inc.',
        customerName: 'Tech Corp Inc.',
        customerContact: 'john.doe@techcorp.com',
        totalAmount: 12500,
        orderDate: '2024-01-15',
        deliveryDate: '2024-02-15',
        priority: 'high',
        status: 'in_production',
        items: [
          { id: '1', productName: 'Laptop Dell XPS 15', quantity: 5, unitPrice: 1500 },
          { id: '2', productName: 'Monitor 27" 4K', quantity: 5, unitPrice: 400 }
        ]
      },
      {
        id: '2',
        orderNumber: 'PO-2024-002',
        procurementOrganization: 'Global Manufacturing',
        customerName: 'Global Manufacturing',
        customerContact: 'sarah.wilson@globalmfg.com',
        totalAmount: 8500,
        orderDate: '2024-01-10',
        deliveryDate: '2024-01-25',
        priority: 'urgent',
        status: 'ready_to_ship',
        items: [
          { id: '3', productName: 'Industrial Sensor', quantity: 100, unitPrice: 85 }
        ]
      }
    ];
  };

  if (loading && orders.length === 0) {
    return (
      <div className="order-fulfillment">
        <div className="page-header">
          <h1>Order Fulfillment</h1>
        </div>
        <LoadingSpinner message="Loading your orders..." />
      </div>
    );
  }

  const stats = calculateOrderStats();

  return (
    <div className="order-fulfillment">
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
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Order Fulfillment</h1>
            <p>Manage and track purchase orders from customers</p>
            <div className="header-stats">
              <span className="stat-item">
                <strong>{stats.totalOrders}</strong> total orders
              </span>
              <span className="stat-item">
                <strong>{stats.inProgressOrders}</strong> in progress
              </span>
              <span className="stat-item">
                <strong>{formatCurrency(stats.totalRevenue)}</strong> total value
              </span>
              {stats.overdueOrders > 0 && (
                <span className="stat-item urgent">
                  <strong>{stats.overdueOrders}</strong> overdue
                </span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={loadOrders}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleExportOrders}
              disabled={orders.length === 0}
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="orders-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-value">{stats.inProgressOrders}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-value">{stats.deliveredOrders}</div>
          <div className="stat-label">Delivered</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        {stats.overdueOrders > 0 && (
          <div className="stat-card urgent">
            <div className="stat-icon">⚠️</div>
            <div className="stat-value">{stats.overdueOrders}</div>
            <div className="stat-label">Overdue</div>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="filters-section">
        <div className="filters-toolbar">
          <div className="search-section">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search orders by ID, customer, or contact..."
              disabled={loading}
            />
          </div>
          
          <div className="filters-group">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select 
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="quality_check">Quality Check</option>
                <option value="ready_to_ship">Ready to Ship</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="date-filter">Date Range:</label>
              <select 
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="priority-filter">Priority:</label>
              <select 
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-by">Sort by:</label>
              <select 
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={loading}
              >
                <option value="orderDate">Order Date</option>
                <option value="deliveryDate">Delivery Date</option>
                <option value="totalAmount">Order Value</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <button 
              className="btn btn-outline"
              onClick={clearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-section">
        <div className="section-header">
          <h2>
            Purchase Orders ({filteredOrders.length})
            {loading && <span className="loading-indicator">Updating...</span>}
          </h2>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="orders-table">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Order Date</th>
                    <th>Delivery Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const statusInfo = getStatusInfo(order.status);
                    const priorityInfo = getPriorityInfo(order.priority);
                    const isOverdue = isOrderOverdue(order);
                    const requiresAttn = requiresAttention(order);
                    const nextStatusOptions = getNextStatusOptions(order.status);
                    
                    return (
                      <tr key={order.id} className={requiresAttn ? 'attention-required' : ''}>
                        <td className="order-id">
                          <div className="id-wrapper">
                            <strong>{order.orderNumber}</strong>
                            {isOverdue && (
                              <span className="overdue-badge">Overdue</span>
                            )}
                            {order.priority === 'urgent' && (
                              <span className="urgent-badge">Urgent</span>
                            )}
                          </div>
                        </td>
                        <td className="order-customer">
                          <div className="customer-info">
                            <div className="customer-name">{order.procurementOrganization || order.customerName}</div>
                            {order.customerContact && (
                              <div className="customer-contact">{order.customerContact}</div>
                            )}
                          </div>
                        </td>
                        <td className="order-items">
                          <div className="items-count">{order.items?.length || 0} items</div>
                          <div className="items-preview">
                            {order.items?.slice(0, 2).map(item => (
                              <span key={item.id} className="item-tag">
                                {item.productName}
                              </span>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="more-items">+{order.items.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="order-amount">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="order-date">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="delivery-date">
                          <div className="date-wrapper">
                            {formatDate(order.deliveryDate)}
                            {isOverdue && <div className="overdue-indicator">⚠️</div>}
                          </div>
                        </td>
                        <td className="order-priority">
                          <span className={`priority-badge ${priorityInfo.class}`}>
                            <span className="priority-icon">{priorityInfo.icon}</span>
                            {priorityInfo.text}
                          </span>
                        </td>
                        <td className="order-status">
                          <span className={`status-badge ${statusInfo.class}`}>
                            <span className="status-icon">{statusInfo.icon}</span>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="order-actions">
                          <div className="action-buttons">
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => handleViewOrderDetails(order)}
                              disabled={loading}
                              title="View order details"
                            >
                              View
                            </button>
                            
                            {nextStatusOptions.length > 0 && (
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleStatusUpdateClick(order)}
                                disabled={loading || updatingStatus}
                                title="Update order status"
                              >
                                Update
                              </button>
                            )}
                            
                            {!['delivered', 'cancelled'].includes(order.status) && (
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleCancelClick(order)}
                                disabled={loading || cancelling}
                                title="Cancel order"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Orders Found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search filters to find more orders.'
                : "You don't have any purchase orders yet. Orders will appear here when customers place them."
              }
            </p>
            <div className="empty-actions">
              {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || priorityFilter !== 'all') ? (
                <button 
                  className="btn btn-outline"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              ) : (
                <Link to="/supplier/rfq-opportunities" className="btn btn-primary">
                  Find New Opportunities
                </Link>
              )}
              <button 
                className="btn btn-outline"
                onClick={loadOrders}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        title="Order Details"
        size="xlarge"
      >
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setShowOrderDetails(false)}
            onStatusUpdate={() => {
              setShowOrderDetails(false);
              handleStatusUpdateClick(selectedOrder);
            }}
            onCancel={() => {
              setShowOrderDetails(false);
              handleCancelClick(selectedOrder);
            }}
          />
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusUpdate}
        onClose={() => setShowStatusUpdate(false)}
        title="Update Order Status"
        size="medium"
      >
        {selectedOrder && (
          <StatusUpdateModal
            order={selectedOrder}
            currentStatus={selectedOrder.status}
            nextStatusOptions={getNextStatusOptions(selectedOrder.status)}
            onUpdate={handleStatusUpdate}
            onClose={() => setShowStatusUpdate(false)}
            loading={updatingStatus}
          />
        )}
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={(reason) => handleCancelOrder(reason)}
        title="Cancel Order"
        message={
          selectedOrder ? 
          `Are you sure you want to cancel order "${selectedOrder.orderNumber}"? This action cannot be undone and may affect your supplier rating.` 
          : ''
        }
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

export default OrderFulfillment;