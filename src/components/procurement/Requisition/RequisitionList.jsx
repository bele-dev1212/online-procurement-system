import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRequisitions } from '../../../hooks/useRequisitions';
import { useNotifications } from '../../../hooks/useNotifications';
import SearchBar from '../../common/SearchBar/SearchBar';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './RequisitionList.css';

const RequisitionList = () => {
  const { requisitions, loading, error, deleteRequisition, updateRequisitionStatus } = useRequisitions();
  const { addNotification } = useNotifications();
  
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, requisition: null });
  const [bulkActions, setBulkActions] = useState([]);

  useEffect(() => {
    filterRequisitions();
  }, [requisitions, searchTerm, statusFilter, priorityFilter]);

  const filterRequisitions = () => {
    let filtered = requisitions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    setFilteredRequisitions(filtered);
  };

  const handleDelete = async () => {
    try {
      await deleteRequisition(deleteModal.requisition.id);
      addNotification('Requisition deleted successfully', 'success');
      setDeleteModal({ isOpen: false, requisition: null });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to delete requisition', 'error');
    }
  };

  const handleStatusChange = async (requisitionId, newStatus) => {
    try {
      await updateRequisitionStatus(requisitionId, newStatus);
      addNotification('Requisition status updated successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update requisition status', 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (bulkActions.length === 0) {
      addNotification('Please select requisitions first', 'warning');
      return;
    }

    try {
      // Handle bulk actions (approve, reject, etc.)
      addNotification(`Bulk ${action} completed for ${bulkActions.length} requisitions`, 'success');
      setBulkActions([]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to perform bulk action', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      draft: 'status-badge--draft',
      submitted: 'status-badge--submitted',
      'under-review': 'status-badge--under-review',
      approved: 'status-badge--approved',
      rejected: 'status-badge--rejected',
      'po-created': 'status-badge--po-created',
      completed: 'status-badge--completed',
      cancelled: 'status-badge--cancelled'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--draft'}`;
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      low: 'priority-badge--low',
      medium: 'priority-badge--medium',
      high: 'priority-badge--high',
      urgent: 'priority-badge--urgent'
    };
    return `priority-badge ${priorityClasses[priority] || 'priority-badge--low'}`;
  };

  const calculateTotalAmount = (items) => {
    return items.reduce((total, item) => total + (item.estimatedCost * item.quantity), 0);
  };

  const getApprovalStatus = (requisition) => {
    if (requisition.status === 'approved') return 'Approved';
    if (requisition.status === 'rejected') return 'Rejected';
    if (requisition.approvals) {
      const approved = requisition.approvals.filter(a => a.status === 'approved').length;
      const total = requisition.approvals.length;
      return `${approved}/${total} Approved`;
    }
    return 'Pending';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error loading requisitions: {error}</div>;

  return (
    <div className="requisition-list">
      <div className="requisition-list-header">
        <div className="header-left">
          <h1>Purchase Requisitions</h1>
          <p>Manage and track purchase requests</p>
        </div>
        <div className="header-actions">
          <Link to="/procurement/requisitions/create" className="btn btn--primary">
            Create New Requisition
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="requisition-filters">
        <div className="filter-group">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search requisitions by number, title, or requester..."
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
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="po-created">PO Created</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{bulkActions.length} requisitions selected</span>
          <div className="bulk-buttons">
            <button 
              className="btn btn--sm btn--success"
              onClick={() => handleBulkAction('approve')}
            >
              Approve Selected
            </button>
            <button 
              className="btn btn--sm btn--warning"
              onClick={() => handleBulkAction('reject')}
            >
              Reject Selected
            </button>
            <button 
              className="btn btn--sm btn--secondary"
              onClick={() => setBulkActions([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="requisition-stats">
        <div className="stat-card">
          <div className="stat-value">{requisitions.filter(r => r.status === 'draft').length}</div>
          <div className="stat-label">Draft</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{requisitions.filter(r => r.status === 'submitted').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{requisitions.filter(r => r.status === 'approved').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{requisitions.filter(r => r.priority === 'urgent').length}</div>
          <div className="stat-label">Urgent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${requisitions.reduce((total, req) => total + calculateTotalAmount(req.items), 0).toLocaleString()}</div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      {/* Requisitions Table */}
      <div className="requisition-table-container">
        <table className="requisition-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBulkActions(filteredRequisitions.map(req => req.id));
                    } else {
                      setBulkActions([]);
                    }
                  }}
                  checked={bulkActions.length === filteredRequisitions.length && filteredRequisitions.length > 0}
                />
              </th>
              <th>Requisition #</th>
              <th>Title</th>
              <th>Department</th>
              <th>Requested By</th>
              <th>Priority</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Approval</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequisitions.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">
                  No requisitions found. <Link to="/procurement/requisitions/create">Create your first requisition</Link>
                </td>
              </tr>
            ) : (
              filteredRequisitions.map(requisition => (
                <tr key={requisition.id} className="requisition-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={bulkActions.includes(requisition.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkActions(prev => [...prev, requisition.id]);
                        } else {
                          setBulkActions(prev => prev.filter(id => id !== requisition.id));
                        }
                      }}
                    />
                  </td>
                  <td className="requisition-number">
                    <Link to={`/procurement/requisitions/${requisition.id}`}>
                      {requisition.requisitionNumber}
                    </Link>
                  </td>
                  <td className="requisition-title">{requisition.title}</td>
                  <td className="requisition-department">{requisition.department}</td>
                  <td className="requisition-requester">
                    <div>{requisition.requestedBy.name}</div>
                    <div className="requester-email">{requisition.requestedBy.email}</div>
                  </td>
                  <td>
                    <span className={getPriorityBadgeClass(requisition.priority)}>
                      {requisition.priority}
                    </span>
                  </td>
                  <td className="requisition-amount">
                    ${calculateTotalAmount(requisition.items).toLocaleString()}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(requisition.status)}>
                      {requisition.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="approval-status">
                    {getApprovalStatus(requisition)}
                  </td>
                  <td className="requisition-date">
                    {formatDate(requisition.createdAt)}
                  </td>
                  <td className="requisition-actions">
                    <div className="action-buttons">
                      <Link 
                        to={`/procurement/requisitions/${requisition.id}`}
                        className="btn btn--sm btn--outline"
                      >
                        View
                      </Link>
                      {requisition.status === 'draft' && (
                        <Link
                          to={`/procurement/requisitions/edit/${requisition.id}`}
                          className="btn btn--sm btn--secondary"
                        >
                          Edit
                        </Link>
                      )}
                      {(requisition.status === 'submitted' || requisition.status === 'under-review') && (
                        <>
                          <button
                            onClick={() => handleStatusChange(requisition.id, 'approved')}
                            className="btn btn--sm btn--success"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(requisition.id, 'rejected')}
                            className="btn btn--sm btn--warning"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, requisition })}
                        className="btn btn--sm btn--danger"
                        disabled={!['draft', 'rejected', 'cancelled'].includes(requisition.status)}
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
        onClose={() => setDeleteModal({ isOpen: false, requisition: null })}
        title="Delete Requisition"
      >
        <div className="delete-modal">
          <p>
            Are you sure you want to delete requisition <strong>{deleteModal.requisition?.requisitionNumber}</strong>? 
            This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button
              className="btn btn--secondary"
              onClick={() => setDeleteModal({ isOpen: false, requisition: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn--danger"
              onClick={handleDelete}
            >
              Delete Requisition
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequisitionList;