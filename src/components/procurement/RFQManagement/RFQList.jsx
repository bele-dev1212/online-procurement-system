import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRFQ } from '../../../hooks/useRFQ';
import { useNotifications } from '../../../hooks/useNotifications';
import SearchBar from '../../common/SearchBar/SearchBar';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './RFQList.css';

const RFQList = () => {
  const { rfqs, loading, error, deleteRFQ, updateRFQStatus } = useRFQ();
  const { addNotification } = useNotifications();
  
  const [filteredRFQs, setFilteredRFQs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, rfq: null });

  useEffect(() => {
    filterRFQs();
  }, [filterRFQs, rfqs, searchTerm, statusFilter]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterRFQs = () => {
    let filtered = rfqs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rfq =>
        rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rfq => rfq.status === statusFilter);
    }

    setFilteredRFQs(filtered);
  };

  const handleDelete = async () => {
    try {
      await deleteRFQ(deleteModal.rfq.id);
      addNotification('RFQ deleted successfully', 'success');
      setDeleteModal({ isOpen: false, rfq: null });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to delete RFQ', 'error');
    }
  };

  const handleStatusChange = async (rfqId, newStatus) => {
    try {
      await updateRFQStatus(rfqId, newStatus);
      addNotification('RFQ status updated successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update RFQ status', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      draft: 'status-badge--draft',
      published: 'status-badge--published',
      'bidding-open': 'status-badge--bidding-open',
      'bidding-closed': 'status-badge--bidding-closed',
      awarded: 'status-badge--awarded',
      cancelled: 'status-badge--cancelled'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--draft'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error loading RFQs: {error}</div>;

  return (
    <div className="rfq-list">
      <div className="rfq-list-header">
        <div className="header-left">
          <h1>Request for Quotation (RFQ)</h1>
          <p>Manage and track your quotation requests</p>
        </div>
        <div className="header-actions">
          <Link to="/procurement/rfq/create" className="btn btn--primary">
            Create New RFQ
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rfq-filters">
        <div className="filter-group">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search RFQs by title, number, or supplier..."
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="bidding-open">Bidding Open</option>
            <option value="bidding-closed">Bidding Closed</option>
            <option value="awarded">Awarded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="rfq-stats">
        <div className="stat-card">
          <div className="stat-value">{rfqs.filter(r => r.status === 'draft').length}</div>
          <div className="stat-label">Draft</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rfqs.filter(r => r.status === 'bidding-open').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rfqs.filter(r => r.status === 'awarded').length}</div>
          <div className="stat-label">Awarded</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rfqs.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* RFQs Table */}
      <div className="rfq-table-container">
        <table className="rfq-table">
          <thead>
            <tr>
              <th>RFQ Number</th>
              <th>Title</th>
              <th>Supplier</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Bids</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRFQs.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No RFQs found. <Link to="/procurement/rfq/create">Create your first RFQ</Link>
                </td>
              </tr>
            ) : (
              filteredRFQs.map(rfq => (
                <tr key={rfq.id} className="rfq-row">
                  <td className="rfq-number">
                    <Link to={`/procurement/rfq/${rfq.id}`}>
                      {rfq.rfqNumber}
                    </Link>
                  </td>
                  <td className="rfq-title">{rfq.title}</td>
                  <td className="rfq-supplier">
                    {rfq.supplier?.name || 'Multiple Suppliers'}
                  </td>
                  <td className="rfq-deadline">
                    <div>{formatDate(rfq.deadline)}</div>
                    {rfq.status === 'bidding-open' && (
                      <div className={`days-remaining ${
                        getDaysRemaining(rfq.deadline) <= 3 ? 'urgent' : ''
                      }`}>
                        {getDaysRemaining(rfq.deadline)} days left
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(rfq.status)}>
                      {rfq.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="rfq-bids">
                    {rfq.bidCount || 0} bids
                  </td>
                  <td className="rfq-actions">
                    <div className="action-buttons">
                      <Link 
                        to={`/procurement/rfq/${rfq.id}`}
                        className="btn btn--sm btn--outline"
                      >
                        View
                      </Link>
                      {rfq.status === 'draft' && (
                        <Link
                          to={`/procurement/rfq/edit/${rfq.id}`}
                          className="btn btn--sm btn--secondary"
                        >
                          Edit
                        </Link>
                      )}
                      {rfq.status === 'bidding-open' && (
                        <button
                          onClick={() => handleStatusChange(rfq.id, 'bidding-closed')}
                          className="btn btn--sm btn--warning"
                        >
                          Close Bidding
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, rfq })}
                        className="btn btn--sm btn--danger"
                        disabled={rfq.status !== 'draft'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, rfq: null })}
        title="Delete RFQ"
      >
        <div className="delete-modal">
          <p>
            Are you sure you want to delete RFQ <strong>{deleteModal.rfq?.rfqNumber}</strong>? 
            This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button
              className="btn btn--secondary"
              onClick={() => setDeleteModal({ isOpen: false, rfq: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn--danger"
              onClick={handleDelete}
            >
              Delete RFQ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RFQList;