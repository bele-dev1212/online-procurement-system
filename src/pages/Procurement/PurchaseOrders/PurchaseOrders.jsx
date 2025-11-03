import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import { CurrencyFormatters, DataFormatters } from '../../../utils/helpers/formatters';


import './PurchaseOrders.css';
const { formatCurrency } = CurrencyFormatters;
const { formatDate } = DataFormatters;

// Local enum
const PURCHASE_ORDER_STATUS = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  ordered: 'Ordered',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected'
};
const PurchaseOrders = () => {
  const { 
    purchaseOrders, 
    loading, 
    error,
    deletePurchaseOrder,
    updatePurchaseOrderStatus,
    refetch 
  } = usePurchaseOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter and sort purchase orders
  const filteredOrders = useMemo(() => {
    let filtered = purchaseOrders.filter(order => {
      const matchesSearch = 
        order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      const matchesDate = dateFilter === 'all' || isInDateRange(order.createdAt, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'deliveryDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === 'totalAmount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [purchaseOrders, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Date range filter helper
  const isInDateRange = (dateString, range) => {
    const date = new Date(dateString);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(startOfDay - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return date >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return date >= quarterAgo;
      default:
        return true;
    }
  };

  // Handlers
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(order => order.id));
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      await deletePurchaseOrder(orderToDelete.id);
      setShowDeleteModal(false);
      setOrderToDelete(null);
      refetch();
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updatePurchaseOrderStatus(orderId, newStatus);
    refetch();
  };

  const handleBulkAction = async () => {
    if (!bulkAction) return;

    switch (bulkAction) {
      case 'approve':
        await Promise.all(
          selectedOrders.map(id => updatePurchaseOrderStatus(id, 'approved'))
        );
        break;
      case 'reject':
        await Promise.all(
          selectedOrders.map(id => updatePurchaseOrderStatus(id, 'rejected'))
        );
        break;
      case 'cancel':
        await Promise.all(
          selectedOrders.map(id => updatePurchaseOrderStatus(id, 'cancelled'))
        );
        break;
      default:
        break;
    }

    setSelectedOrders([]);
    setBulkAction('');
    refetch();
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

  if (loading) {
    return (
      <div className="purchase-orders-loading">
        <LoadingSpinner size="large" />
        <p>Loading purchase orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchase-orders-error">
        <div className="error-content">
          <h3>Error Loading Purchase Orders</h3>
          <p>{error}</p>
          <button onClick={refetch} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-orders">
      <div className="purchase-orders-header">
        <div className="header-content">
          <h1>Purchase Orders</h1>
          <p>Manage and track all purchase orders</p>
        </div>
        <div className="header-actions">
          <Link to="/procurement/create-purchase-order" className="btn-primary">
            Create Purchase Order
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="purchase-orders-filters">
        <div className="filters-left">
          <SearchBar
            placeholder="Search by PO number, supplier..."
            onSearch={handleSearch}
            className="search-bar"
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {Object.entries(purchaseOrderStatus).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>

        <div className="filters-right">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="poNumber">Sort by PO Number</option>
            <option value="totalAmount">Sort by Amount</option>
            <option value="deliveryDate">Sort by Delivery</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-actions-info">
            <span>{selectedOrders.length} orders selected</span>
          </div>
          <div className="bulk-actions-controls">
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Bulk Actions</option>
              <option value="approve">Approve Selected</option>
              <option value="reject">Reject Selected</option>
              <option value="cancel">Cancel Selected</option>
            </select>
            <button 
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="btn-secondary"
            >
              Apply
            </button>
            <button 
              onClick={() => setSelectedOrders([])}
              className="btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Purchase Orders Table */}
      <div className="purchase-orders-table-container">
        <table className="purchase-orders-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                  onChange={handleSelectAll}
                  className="checkbox"
                />
              </th>
              <th onClick={() => handleSort('poNumber')} className="sortable">
                PO Number {sortBy === 'poNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('supplier.name')} className="sortable">
                Supplier {sortBy === 'supplier.name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('totalAmount')} className="sortable">
                Amount {sortBy === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Priority</th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('deliveryDate')} className="sortable">
                Delivery {sortBy === 'deliveryDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-orders">
                  <div className="no-orders-content">
                    <h3>No purchase orders found</h3>
                    <p>Try adjusting your search or filters</p>
                    <Link to="/procurement/create-purchase-order" className="btn-primary">
                      Create Your First PO
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id} className={selectedOrders.includes(order.id) ? 'selected' : ''}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="checkbox"
                    />
                  </td>
                  <td className="po-number">
                    <Link to={`/procurement/purchase-orders/${order.id}`} className="po-link">
                      {order.poNumber}
                    </Link>
                  </td>
                  <td className="supplier">
                    <div className="supplier-info">
                      <span className="supplier-name">{order.supplier?.name}</span>
                      <span className="supplier-company">{order.supplier?.companyName}</span>
                    </div>
                  </td>
                  <td className="amount">{formatCurrency(order.totalAmount)}</td>
                  <td className="status">
                    {getStatusBadge(order.status)}
                    {order.status === 'pending' && (
                      <div className="status-actions">
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'approved')}
                          className="btn-status approve"
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'rejected')}
                          className="btn-status reject"
                          title="Reject"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="priority">
                    {getPriorityBadge(order.priority)}
                  </td>
                  <td className="date">{formatDate(order.createdAt)}</td>
                  <td className="date">{formatDate(order.deliveryDate)}</td>
                  <td className="actions">
                    <div className="action-buttons">
                      <Link 
                        to={`/procurement/purchase-orders/${order.id}`}
                        className="btn-action view"
                        title="View Details"
                      >
                        👁️
                      </Link>
                      <Link 
                        to={`/procurement/purchase-orders/${order.id}/edit`}
                        className="btn-action edit"
                        title="Edit"
                      >
                        ✏️
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(order)}
                        className="btn-action delete"
                        title="Delete"
                        disabled={!['draft', 'cancelled'].includes(order.status)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="purchase-orders-stats">
        <div className="stat-card">
          <h3>{purchaseOrders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{purchaseOrders.filter(o => o.status === 'pending').length}</h3>
          <p>Pending Approval</p>
        </div>
        <div className="stat-card">
          <h3>{formatCurrency(purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0))}</h3>
          <p>Total Value</p>
        </div>
        <div className="stat-card">
          <h3>{purchaseOrders.filter(o => ['shipped', 'delivered'].includes(o.status)).length}</h3>
          <p>Completed</p>
        </div>
      </div>

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
            onClick: handleConfirmDelete,
            variant: 'danger'
          }
        ]}
      >
        <p>Are you sure you want to delete purchase order <strong>{orderToDelete?.poNumber}</strong>?</p>
        <p className="warning-text">This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
