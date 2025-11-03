// src/pages/Suppliers/BidManagement/BidManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { suppliersAPI } from '../../../services/api/suppliersAPI';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import ConfirmDialog from '../../../components/common/Modal/ConfirmDialog';
import Notification from '../../../components/common/Notification/Notification';
import BidDetails from '../components/BidDetails/BidDetails';
import './BidManagement.css';

const BidManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal States
  const [showBidDetails, setShowBidDetails] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // Load bids from API
  const loadBids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateRange: dateFilter !== 'all' ? dateFilter : undefined,
        search: searchTerm || undefined,
        sort: sortBy,
        order: sortOrder
      };

      const response = await supplierAPI.getBids(params);
      
      if (response.success) {
        setBids(response.data.bids || []);
      } else {
        throw new Error(response.message || 'Failed to load bids');
      }
    } catch (err) {
      console.error('Failed to load bids:', err);
      setError(err.message || 'Failed to load bids. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, searchTerm, sortBy, sortOrder]);

  // Initial load and when filters change
  useEffect(() => {
    loadBids();
  }, [loadBids]);

  // Filter bids based on search term
  useEffect(() => {
    let filtered = bids;
    
    if (searchTerm) {
      filtered = filtered.filter(bid =>
        bid.rfqTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.bidNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.procurementOrganization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBids(filtered);
  }, [bids, searchTerm]);

  // Handle bid withdrawal
  const handleWithdrawBid = async () => {
    if (!selectedBid) return;
    
    try {
      setWithdrawing(true);
      const response = await supplierAPI.withdrawBid(selectedBid.id);
      
      if (response.success) {
        setShowWithdrawConfirm(false);
        setSelectedBid(null);
        setSuccessMessage('Bid withdrawn successfully!');
        await loadBids(); // Refresh the list
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to withdraw bid');
      }
    } catch (err) {
      console.error('Failed to withdraw bid:', err);
      setError(err.message || 'Failed to withdraw bid. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  // Handle view bid details
  const handleViewBidDetails = (bid) => {
    setSelectedBid(bid);
    setShowBidDetails(true);
  };

  // Handle withdraw confirmation
  const handleWithdrawClick = (bid) => {
    setSelectedBid(bid);
    setShowWithdrawConfirm(true);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class and text
  const getStatusInfo = (status) => {
    const statusMap = {
      'submitted': { class: 'status-submitted', text: 'Submitted', icon: '📤' },
      'under_review': { class: 'status-review', text: 'Under Review', icon: '👀' },
      'approved': { class: 'status-approved', text: 'Approved', icon: '✅' },
      'rejected': { class: 'status-rejected', text: 'Rejected', icon: '❌' },
      'won': { class: 'status-won', text: 'Won', icon: '🏆' },
      'lost': { class: 'status-lost', text: 'Lost', icon: '💔' },
      'withdrawn': { class: 'status-withdrawn', text: 'Withdrawn', icon: '↩️' }
    };
    
    return statusMap[status] || { class: 'status-default', text: status, icon: '❓' };
  };

  // Calculate win rate
  const calculateWinRate = () => {
    const totalBids = bids.length;
    const wonBids = bids.filter(bid => bid.status === 'won').length;
    return totalBids > 0 ? (wonBids / totalBids) * 100 : 0;
  };

  // Calculate total bid value
  const calculateTotalBidValue = () => {
    return bids.reduce((total, bid) => total + (bid.amount || 0), 0);
  };

  // Calculate average response time
  const calculateAvgResponseTime = () => {
    const respondedBids = bids.filter(bid => bid.responseTime);
    if (respondedBids.length === 0) return 0;
    
    const totalResponseTime = respondedBids.reduce((total, bid) => total + bid.responseTime, 0);
    return Math.round(totalResponseTime / respondedBids.length);
  };

  // Get bids requiring action
  const getBidsRequiringAction = () => {
    return bids.filter(bid => 
      bid.status === 'submitted' && 
      new Date(bid.rfqDeadline) > new Date()
    ).length;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('submittedAt');
    setSortOrder('desc');
  };

  if (loading && bids.length === 0) {
    return (
      <div className="bid-management">
        <div className="page-header">
          <h1>My Bids</h1>
        </div>
        <LoadingSpinner message="Loading your bids..." />
      </div>
    );
  }

  return (
    <div className="bid-management">
      {/* Notifications */}
      {error && (
        <Notification 
          type="error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      {successMessage && (
        <Notification 
          type="success" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>My Bids</h1>
            <p>Manage and track your submitted bids</p>
            <div className="header-stats">
              <span className="stat-item">
                <strong>{bids.length}</strong> total bids
              </span>
              <span className="stat-item">
                <strong>{calculateWinRate().toFixed(1)}%</strong> win rate
              </span>
              <span className="stat-item">
                <strong>{formatCurrency(calculateTotalBidValue())}</strong> total value
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={loadBids}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link to="/supplier/rfq-opportunities" className="btn btn-primary">
              <span className="btn-icon">🎯</span>
              Find New Opportunities
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bids-stats">
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-value">{bids.length}</div>
          <div className="stat-label">Total Bids</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{bids.filter(b => b.status === 'won').length}</div>
          <div className="stat-label">Won</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👀</div>
          <div className="stat-value">{bids.filter(b => b.status === 'under_review').length}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{getBidsRequiringAction()}</div>
          <div className="stat-label">Require Action</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{calculateWinRate().toFixed(1)}%</div>
          <div className="stat-label">Win Rate</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="filters-section">
        <div className="filters-toolbar">
          <div className="search-section">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search bids by RFQ title, bid ID, or organization..."
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
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="withdrawn">Withdrawn</option>
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
              <label htmlFor="sort-by">Sort by:</label>
              <select 
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={loading}
              >
                <option value="submittedAt">Submitted Date</option>
                <option value="amount">Bid Amount</option>
                <option value="rfqTitle">RFQ Title</option>
                <option value="organization">Organization</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-order">Order:</label>
              <select 
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={loading}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
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

      {/* Bids Table */}
      <div className="bids-section">
        <div className="section-header">
          <h2>
            Your Bids ({filteredBids.length})
            {loading && <span className="loading-indicator">Updating...</span>}
          </h2>
        </div>

        {filteredBids.length > 0 ? (
          <div className="bids-table">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Bid ID</th>
                    <th>RFQ Title</th>
                    <th>Organization</th>
                    <th>Bid Amount</th>
                    <th>Submitted Date</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBids.map(bid => {
                    const statusInfo = getStatusInfo(bid.status);
                    const isActionRequired = bid.status === 'submitted' && new Date(bid.rfqDeadline) > new Date();
                    
                    return (
                      <tr key={bid.id} className={isActionRequired ? 'action-required' : ''}>
                        <td className="bid-id">
                          <strong>{bid.bidNumber}</strong>
                        </td>
                        <td className="bid-title">
                          <div className="title-wrapper">
                            <span className="title">{bid.rfqTitle}</span>
                            {isActionRequired && (
                              <span className="action-badge">Action Required</span>
                            )}
                          </div>
                        </td>
                        <td className="bid-org">
                          {bid.procurementOrganization}
                        </td>
                        <td className="bid-amount">
                          {formatCurrency(bid.amount)}
                        </td>
                        <td className="bid-date">
                          {formatDate(bid.submittedAt)}
                        </td>
                        <td className="bid-deadline">
                          {formatDate(bid.rfqDeadline)}
                          {new Date(bid.rfqDeadline) < new Date() && (
                            <span className="deadline-passed">(Passed)</span>
                          )}
                        </td>
                        <td className="bid-status">
                          <span className={`status-badge ${statusInfo.class}`}>
                            <span className="status-icon">{statusInfo.icon}</span>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="bid-actions">
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleViewBidDetails(bid)}
                            disabled={loading}
                          >
                            View Details
                          </button>
                          
                          {bid.status === 'submitted' && new Date(bid.rfqDeadline) > new Date() && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleWithdrawClick(bid)}
                              disabled={loading || withdrawing}
                            >
                              Withdraw
                            </button>
                          )}
                          
                          {bid.status === 'won' && (
                            <Link 
                              to={`/supplier/orders?bid=${bid.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              Create Order
                            </Link>
                          )}
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
            <div className="empty-icon">💼</div>
            <h3>No Bids Found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search filters to find more bids.'
                : "You haven't submitted any bids yet. Start by browsing RFQ opportunities."
              }
            </p>
            <div className="empty-actions">
              {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') ? (
                <button 
                  className="btn btn-outline"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              ) : (
                <Link to="/supplier/rfq-opportunities" className="btn btn-primary">
                  Browse RFQ Opportunities
                </Link>
              )}
              <button 
                className="btn btn-outline"
                onClick={loadBids}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bid Details Modal */}
      <Modal
        isOpen={showBidDetails}
        onClose={() => setShowBidDetails(false)}
        title="Bid Details"
        size="large"
      >
        {selectedBid && (
          <BidDetails
            bid={selectedBid}
            onClose={() => setShowBidDetails(false)}
            onWithdraw={() => {
              setShowBidDetails(false);
              handleWithdrawClick(selectedBid);
            }}
          />
        )}
      </Modal>

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
        onConfirm={handleWithdrawBid}
        title="Withdraw Bid"
        message={
          selectedBid ? 
          `Are you sure you want to withdraw your bid for "${selectedBid.rfqTitle}"? This action cannot be undone.` 
          : ''
        }
        confirmText="Withdraw Bid"
        cancelText="Cancel"
        type="danger"
        loading={withdrawing}
      />
    </div>
  );
};

export default BidManagement;