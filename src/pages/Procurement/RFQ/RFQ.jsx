import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRFQ } from '../../../hooks/useRFQ';
import { useSuppliers } from '../../../hooks/useSuppliers';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import { CurrencyFormatters, DataFormatters } from '../../../utils/helpers/formatters';

import { RFQ_STATUS, rfqPriority } from '../../../utils/enums/rfqStatus';
import './RFQ.css';

const RFQ = () => {
  const { 
    rfqs, 
    loading, 
    error,
    deleteRFQ,
    sendRFQToSuppliers,
    closeRFQ,
    refetch 
  } = useRFQ();

  const { suppliers } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRFQs, setSelectedRFQs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rfqToDelete, setRfqToDelete] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [rfqToSend, setRfqToSend] = useState(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('all');

  // Filter and sort RFQs
  const filteredRFQs = useMemo(() => {
    let filtered = rfqs.filter(rfq => {
      const matchesSearch = 
        rfq.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || rfq.priority === priorityFilter;
      const matchesDate = dateFilter === 'all' || isInDateRange(rfq.createdAt, dateFilter);
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'active' && ['draft', 'sent', 'in_progress'].includes(rfq.status)) ||
        (activeTab === 'closed' && ['awarded', 'cancelled', 'expired'].includes(rfq.status));

      return matchesSearch && matchesStatus && matchesPriority && matchesDate && matchesTab;
    });

    // Sort RFQs
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'deadline') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === 'estimatedBudget') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rfqs, searchTerm, statusFilter, priorityFilter, dateFilter, sortBy, sortOrder, activeTab]);

  // Pagination
  const paginatedRFQs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRFQs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRFQs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRFQs.length / itemsPerPage);

  // Date range filter helper
  const isInDateRange = (dateString, range) => {
    const date = new Date(dateString);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        { const weekAgo = new Date(startOfDay - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo; }
      case 'month':
        { const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return date >= monthAgo; }
      case 'upcoming':
        return date > now;
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

  const handleSelectRFQ = (rfqId) => {
    setSelectedRFQs(prev =>
      prev.includes(rfqId)
        ? prev.filter(id => id !== rfqId)
        : [...prev, rfqId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRFQs.length === paginatedRFQs.length) {
      setSelectedRFQs([]);
    } else {
      setSelectedRFQs(paginatedRFQs.map(rfq => rfq.id));
    }
  };

  const handleDeleteClick = (rfq) => {
    setRfqToDelete(rfq);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (rfqToDelete) {
      await deleteRFQ(rfqToDelete.id);
      setShowDeleteModal(false);
      setRfqToDelete(null);
      refetch();
    }
  };

  const handleSendClick = (rfq) => {
    setRfqToSend(rfq);
    setSelectedSuppliers(rfq.invitedSuppliers || []);
    setShowSendModal(true);
  };

  const handleSendRFQ = async () => {
    if (!rfqToSend || selectedSuppliers.length === 0) return;

    try {
      await sendRFQToSuppliers(rfqToSend.id, selectedSuppliers);
      setShowSendModal(false);
      setRfqToSend(null);
      setSelectedSuppliers([]);
      refetch();
    } catch (error) {
      console.error('Failed to send RFQ:', error);
    }
  };

  const handleCloseRFQ = async (rfqId) => {
    try {
      await closeRFQ(rfqId);
      refetch();
    } catch (error) {
      console.error('Failed to close RFQ:', error);
    }
  };

  const handleSupplierToggle = (supplierId) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSelectAllSuppliers = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(suppliers.map(s => s.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) return;

    switch (bulkAction) {
      case 'send':
        // For bulk send, you might want different behavior
        alert('Bulk send would be implemented here');
        break;
      case 'close':
        await Promise.all(
          selectedRFQs.map(id => closeRFQ(id))
        );
        break;
      case 'delete':
        await Promise.all(
          selectedRFQs.map(id => deleteRFQ(id))
        );
        break;
      default:
        break;
    }

    setSelectedRFQs([]);
    setBulkAction('');
    refetch();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'status-draft', label: 'Draft', icon: '📝' },
      sent: { class: 'status-sent', label: 'Sent', icon: '📤' },
      in_progress: { class: 'status-in-progress', label: 'In Progress', icon: '⏳' },
      under_review: { class: 'status-under-review', label: 'Under Review', icon: '🔍' },
      awarded: { class: 'status-awarded', label: 'Awarded', icon: '✅' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: '❌' },
      expired: { class: 'status-expired', label: 'Expired', icon: '⏰' }
    };

    const config = statusConfig[status] || { class: 'status-default', label: status, icon: '❓' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
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

  const getResponseStats = (rfq) => {
    const totalInvited = rfq.invitedSuppliers?.length || 0;
    const responsesReceived = rfq.responses?.length || 0;
    return { totalInvited, responsesReceived };
  };

  const isActionAllowed = (rfq, action) => {
    const allowedActions = {
      send: ['draft'],
      edit: ['draft'],
      close: ['sent', 'in_progress', 'under_review'],
      delete: ['draft', 'cancelled', 'expired'],
      view_bids: ['sent', 'in_progress', 'under_review', 'awarded']
    };

    return allowedActions[action]?.includes(rfq.status) || false;
  };

  if (loading) {
    return (
      <div className="rfq-loading">
        <LoadingSpinner size="large" />
        <p>Loading RFQs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rfq-error">
        <div className="error-content">
          <h3>Error Loading RFQs</h3>
          <p>{error}</p>
          <button onClick={refetch} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rfq-management">
      {/* Header */}
      <div className="rfq-header">
        <div className="header-content">
          <h1>Request for Quotation (RFQ)</h1>
          <p>Manage and track all your quotation requests</p>
        </div>
        <div className="header-actions">
          <Link to="/procurement/rfq/create" className="btn-primary">
            + Create RFQ
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="rfq-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All RFQs
        </button>
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button 
          className={`tab ${activeTab === 'closed' ? 'active' : ''}`}
          onClick={() => setActiveTab('closed')}
        >
          Closed
        </button>
      </div>

      {/* Filters and Search */}
      <div className="rfq-filters">
        <div className="filters-left">
          <SearchBar
            placeholder="Search by RFQ number, title..."
            onSearch={handleSearch}
            className="search-bar"
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {Object.entries(rfqStatus).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priority</option>
            {Object.entries(rfqPriority).map(([key, value]) => (
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
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <div className="filters-right">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="rfqNumber">Sort by RFQ Number</option>
            <option value="estimatedBudget">Sort by Budget</option>
            <option value="deadline">Sort by Deadline</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRFQs.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-actions-info">
            <span>{selectedRFQs.length} RFQs selected</span>
          </div>
          <div className="bulk-actions-controls">
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Bulk Actions</option>
              <option value="send">Send Selected</option>
              <option value="close">Close Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button 
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="btn-secondary"
            >
              Apply
            </button>
            <button 
              onClick={() => setSelectedRFQs([])}
              className="btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* RFQs Table */}
      <div className="rfq-table-container">
        <table className="rfq-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedRFQs.length === paginatedRFQs.length && paginatedRFQs.length > 0}
                  onChange={handleSelectAll}
                  className="checkbox"
                />
              </th>
              <th onClick={() => handleSort('rfqNumber')} className="sortable">
                RFQ Number {sortBy === 'rfqNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('title')} className="sortable">
                Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Category</th>
              <th onClick={() => handleSort('estimatedBudget')} className="sortable">
                Budget {sortBy === 'estimatedBudget' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Priority</th>
              <th>Responses</th>
              <th onClick={() => handleSort('deadline')} className="sortable">
                Deadline {sortBy === 'deadline' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRFQs.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-rfqs">
                  <div className="no-rfqs-content">
                    <h3>No RFQs found</h3>
                    <p>Try adjusting your search or filters</p>
                    <Link to="/procurement/rfq/create" className="btn-primary">
                      Create Your First RFQ
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRFQs.map((rfq) => {
                const responseStats = getResponseStats(rfq);
                const isDeadlineNear = new Date(rfq.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const isOverdue = new Date(rfq.deadline) < new Date();

                return (
                  <tr key={rfq.id} className={selectedRFQs.includes(rfq.id) ? 'selected' : ''}>
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedRFQs.includes(rfq.id)}
                        onChange={() => handleSelectRFQ(rfq.id)}
                        className="checkbox"
                      />
                    </td>
                    <td className="rfq-number">
                      <Link to={`/procurement/rfq/${rfq.id}`} className="rfq-link">
                        {rfq.rfqNumber}
                      </Link>
                    </td>
                    <td className="title">
                      <div className="title-content">
                        <strong>{rfq.title}</strong>
                        {rfq.description && (
                          <p className="description">{rfq.description.substring(0, 60)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="category">
                      <span className="category-badge">{rfq.category}</span>
                    </td>
                    <td className="budget">
                      {rfq.estimatedBudget ? formatCurrency(rfq.estimatedBudget) : 'Not specified'}
                    </td>
                    <td className="status">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="priority">
                      {getPriorityBadge(rfq.priority)}
                    </td>
                    <td className="responses">
                      <div className="response-stats">
                        <span className="response-count">
                          {responseStats.responsesReceived}/{responseStats.totalInvited}
                        </span>
                        <div className="response-bar">
                          <div 
                            className="response-fill"
                            style={{ 
                              width: `${responseStats.totalInvited > 0 ? (responseStats.responsesReceived / responseStats.totalInvited) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className={`deadline ${isOverdue ? 'overdue' : isDeadlineNear ? 'near' : ''}`}>
                      <div className="deadline-content">
                        <span>{formatDate(rfq.deadline)}</span>
                        {isOverdue && <span className="deadline-badge overdue">Overdue</span>}
                        {isDeadlineNear && !isOverdue && <span className="deadline-badge near">Soon</span>}
                      </div>
                    </td>
                    <td className="date">{formatDate(rfq.createdAt)}</td>
                    <td className="actions">
                      <div className="action-buttons">
                        <Link 
                          to={`/procurement/rfq/${rfq.id}`}
                          className="btn-action view"
                          title="View Details"
                        >
                          👁️
                        </Link>
                        
                        {isActionAllowed(rfq, 'view_bids') && (
                          <Link 
                            to={`/procurement/rfq/${rfq.id}/bids`}
                            className="btn-action bids"
                            title="View Bids"
                          >
                            💰
                          </Link>
                        )}

                        {isActionAllowed(rfq, 'edit') && (
                          <Link 
                            to={`/procurement/rfq/${rfq.id}/edit`}
                            className="btn-action edit"
                            title="Edit"
                          >
                            ✏️
                          </Link>
                        )}

                        {isActionAllowed(rfq, 'send') && (
                          <button 
                            onClick={() => handleSendClick(rfq)}
                            className="btn-action send"
                            title="Send to Suppliers"
                          >
                            📤
                          </button>
                        )}

                        {isActionAllowed(rfq, 'close') && (
                          <button 
                            onClick={() => handleCloseRFQ(rfq.id)}
                            className="btn-action close"
                            title="Close RFQ"
                          >
                            🔒
                          </button>
                        )}

                        {isActionAllowed(rfq, 'delete') && (
                          <button 
                            onClick={() => handleDeleteClick(rfq)}
                            className="btn-action delete"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
      <div className="rfq-stats">
        <div className="stat-card">
          <h3>{rfqs.length}</h3>
          <p>Total RFQs</p>
        </div>
        <div className="stat-card">
          <h3>{rfqs.filter(r => ['draft', 'sent', 'in_progress'].includes(r.status)).length}</h3>
          <p>Active RFQs</p>
        </div>
        <div className="stat-card">
          <h3>{rfqs.filter(r => r.status === 'sent').length}</h3>
          <p>Awaiting Responses</p>
        </div>
        <div className="stat-card">
          <h3>{rfqs.filter(r => new Date(r.deadline) < new Date() && ['sent', 'in_progress'].includes(r.status)).length}</h3>
          <p>Overdue</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete RFQ"
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
        <div className="delete-modal-content">
          <p>Are you sure you want to delete RFQ <strong>{rfqToDelete?.rfqNumber}</strong>?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
      </Modal>

      {/* Send RFQ Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send RFQ to Suppliers"
        size="large"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowSendModal(false),
            variant: 'secondary'
          },
          {
            label: 'Send RFQ',
            onClick: handleSendRFQ,
            variant: 'primary',
            disabled: selectedSuppliers.length === 0
          }
        ]}
      >
        <div className="send-modal-content">
          <p>Select suppliers to send RFQ <strong>{rfqToSend?.rfqNumber}</strong> to:</p>
          
          <div className="supplier-selection">
            <div className="selection-header">
              <label>
                <input
                  type="checkbox"
                  checked={selectedSuppliers.length === suppliers.length}
                  onChange={handleSelectAllSuppliers}
                  className="checkbox"
                />
                Select All Suppliers
              </label>
              <span>{selectedSuppliers.length} suppliers selected</span>
            </div>
            
            <div className="supplier-list">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="supplier-item">
                  <label className="supplier-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(supplier.id)}
                      onChange={() => handleSupplierToggle(supplier.id)}
                      className="checkbox"
                    />
                    <div className="supplier-info">
                      <h4>{supplier.name}</h4>
                      <p>{supplier.companyName}</p>
                      <p className="supplier-contact">{supplier.email}</p>
                    </div>
                    {supplier.rating && (
                      <div className="supplier-rating">
                        ★ {supplier.rating}
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RFQ;
