import React, { useState, useEffect } from 'react';
import { useBidding } from '../../../hooks/useBidding';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import BidStatusBadge from '../../../components/bidding/BidStatusBadge/BidStatusBadge';
import { suppliersAPI } from '../../../services/api/suppliersAPI';
import './BidManagement.css';

const BidManagement = () => {
  const {
    bids,
    loading,
    fetchBids,
    updateBidStatus,
    cancelBid,
    awardBid,
    getBidStatistics
  } = useBidding();

  const { addNotification } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBid, setSelectedBid] = useState(null);
  const [showBidDetail, setShowBidDetail] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  useEffect(() => {
    if (bids.length > 0) {
      loadStatistics();
    }
  }, [bids]);

  const loadStatistics = async () => {
    try {
      const stats = await getBidStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load bid statistics:', error);
    }
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = 
      bid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedBids = [...filteredBids].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (sortConfig.key === 'deadline' || sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'asc' 
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateBidStatus(selectedBid.id, newStatus);
      setShowStatusModal(false);
      addNotification(`Bid status updated to ${newStatus}`, 'success');
    } catch (error) {
      addNotification('Failed to update bid status: ' + error.message, 'error');
    }
  };

  const handleAwardBid = async (awardData) => {
    try {
      await awardBid(selectedBid.id, awardData);
      setShowAwardModal(false);
      addNotification('Bid awarded successfully!', 'success');
    } catch (error) {
      addNotification('Failed to award bid: ' + error.message, 'error');
    }
  };

  const handleCancelBid = async () => {
    try {
      await cancelBid(selectedBid.id);
      setShowCancelModal(false);
      addNotification('Bid cancelled successfully', 'success');
    } catch (error) {
      addNotification('Failed to cancel bid: ' + error.message, 'error');
    }
  };

  const openBidDetail = (bid) => {
    setSelectedBid(bid);
    setShowBidDetail(true);
  };

  const openStatusModal = (bid) => {
    setSelectedBid(bid);
    setShowStatusModal(true);
  };

  const openAwardModal = (bid) => {
    setSelectedBid(bid);
    setShowAwardModal(true);
  };

  const openCancelModal = (bid) => {
    setSelectedBid(bid);
    setShowCancelModal(true);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canAwardBid = (bid) => {
    return bid.status === 'under_review' || bid.status === 'submitted';
  };

  const canCancelBid = (bid) => {
    return ['draft', 'submitted', 'under_review'].includes(bid.status);
  };

  if (loading && bids.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bid-management-container">
      <div className="bid-management-header">
        <div className="header-content">
          <h1>Bid Management</h1>
          <p>Manage and track all bidding activities</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="bid-statistics">
        <div className="stat-card">
          <div className="stat-value">{statistics.totalBids || 0}</div>
          <div className="stat-label">Total Bids</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{statistics.activeBids || 0}</div>
          <div className="stat-label">Active Bids</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{statistics.awardedBids || 0}</div>
          <div className="stat-label">Awarded</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {formatCurrency(statistics.totalValue || 0)}
          </div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bid-controls">
        <div className="controls-left">
          <div className="search-container">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search bids..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="awarded">Awarded</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="controls-right">
          <div className="results-count">
            {filteredBids.length} of {bids.length} bids
          </div>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bids-table-container">
        <table className="bids-table">
          <thead>
            <tr>
              <th 
                className="sortable" 
                onClick={() => handleSort('title')}
              >
                Bid Title {getSortIcon('title')}
              </th>
              <th>Supplier</th>
              <th 
                className="sortable" 
                onClick={() => handleSort('amount')}
              >
                Amount {getSortIcon('amount')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('deadline')}
              >
                Deadline {getSortIcon('deadline')}
              </th>
              <th>Days Left</th>
              <th 
                className="sortable" 
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('createdAt')}
              >
                Created {getSortIcon('createdAt')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBids.map(bid => (
              <tr key={bid.id} className={`bid-row status-${bid.status}`}>
                <td className="bid-title">
                  <button 
                    className="title-link"
                    onClick={() => openBidDetail(bid)}
                  >
                    {bid.title}
                  </button>
                  {bid.description && (
                    <div className="bid-description">{bid.description}</div>
                  )}
                </td>
                <td className="supplier">
                  {bid.supplier?.name || 'N/A'}
                </td>
                <td className="amount">
                  {formatCurrency(bid.amount)}
                </td>
                <td className="deadline">
                  {formatDate(bid.deadline)}
                </td>
                <td className="days-remaining">
                  <span className={`days-badge ${
                    getDaysRemaining(bid.deadline) <= 3 ? 'urgent' :
                    getDaysRemaining(bid.deadline) <= 7 ? 'warning' : 'normal'
                  }`}>
                    {getDaysRemaining(bid.deadline)} days
                  </span>
                </td>
                <td className="status">
                  <BidStatusBadge status={bid.status} />
                </td>
                <td className="created-date">
                  {formatDate(bid.createdAt)}
                </td>
                <td className="actions">
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => openBidDetail(bid)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    
                    {canAwardBid(bid) && (
                      <button
                        className="btn-icon btn-award"
                        onClick={() => openAwardModal(bid)}
                        title="Award Bid"
                      >
                        🏆
                      </button>
                    )}
                    
                    <button
                      className="btn-icon btn-status"
                      onClick={() => openStatusModal(bid)}
                      title="Change Status"
                    >
                      🔄
                    </button>
                    
                    {canCancelBid(bid) && (
                      <button
                        className="btn-icon btn-cancel"
                        onClick={() => openCancelModal(bid)}
                        title="Cancel Bid"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBids.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No bids found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by creating your first bid'
              }
            </p>
          </div>
        )}
      </div>

      {/* Bid Detail Modal */}
      <Modal
        isOpen={showBidDetail}
        onClose={() => setShowBidDetail(false)}
        title="Bid Details"
        size="large"
      >
        {selectedBid && (
          <div className="bid-detail">
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Bid Title:</label>
                  <span>{selectedBid.title}</span>
                </div>
                <div className="detail-item">
                  <label>Description:</label>
                  <span>{selectedBid.description || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Supplier:</label>
                  <span>{selectedBid.supplier?.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Amount:</label>
                  <span className="amount">{formatCurrency(selectedBid.amount)}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Timeline</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Created:</label>
                  <span>{formatDate(selectedBid.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <label>Deadline:</label>
                  <span>{formatDate(selectedBid.deadline)}</span>
                </div>
                <div className="detail-item">
                  <label>Days Remaining:</label>
                  <span>{getDaysRemaining(selectedBid.deadline)} days</span>
                </div>
                {selectedBid.awardedAt && (
                  <div className="detail-item">
                    <label>Awarded:</label>
                    <span>{formatDate(selectedBid.awardedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Status Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Current Status:</label>
                  <BidStatusBadge status={selectedBid.status} />
                </div>
                {selectedBid.notes && (
                  <div className="detail-item full-width">
                    <label>Notes:</label>
                    <span>{selectedBid.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Bid Status"
      >
        {selectedBid && (
          <div className="status-update-form">
            <p>Update status for: <strong>{selectedBid.title}</strong></p>
            
            <div className="status-options">
              {['draft', 'submitted', 'under_review', 'awarded', 'rejected', 'cancelled'].map(status => (
                <label key={status} className="status-option">
                  <input
                    type="radio"
                    name="bidStatus"
                    value={status}
                    checked={selectedBid.status === status}
                    onChange={() => {}}
                  />
                  <BidStatusBadge status={status} />
                  <button
                    onClick={() => handleStatusUpdate(status)}
                    className="btn-status-update"
                    disabled={selectedBid.status === status}
                  >
                    Set
                  </button>
                </label>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Award Bid Modal */}
      <Modal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        title="Award Bid"
      >
        {selectedBid && (
          <div className="award-bid-form">
            <div className="award-confirmation">
              <div className="confirmation-icon">🏆</div>
              <h3>Award this bid?</h3>
              <p>You are about to award the bid to <strong>{selectedBid.supplier?.name}</strong>.</p>
              
              <div className="bid-summary">
                <div className="summary-item">
                  <label>Bid Title:</label>
                  <span>{selectedBid.title}</span>
                </div>
                <div className="summary-item">
                  <label>Amount:</label>
                  <span className="amount">{formatCurrency(selectedBid.amount)}</span>
                </div>
              </div>

              <div className="award-actions">
                <button
                  onClick={() => handleAwardBid({ notes: 'Bid awarded to supplier' })}
                  className="btn-primary"
                >
                  Confirm Award
                </button>
                <button
                  onClick={() => setShowAwardModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Bid Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Bid"
      >
        {selectedBid && (
          <div className="cancel-confirmation">
            <div className="warning-icon">⚠️</div>
            <h3>Cancel this bid?</h3>
            <p>
              Are you sure you want to cancel the bid "<strong>{selectedBid.title}</strong>"?
              This action cannot be undone.
            </p>
            
            <div className="cancel-actions">
              <button
                onClick={handleCancelBid}
                className="btn-danger"
              >
                Cancel Bid
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-secondary"
              >
                Keep Active
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BidManagement;