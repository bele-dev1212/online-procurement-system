import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useNotifications } from '../../../hooks/useNotifications';
import SearchBar from '../../common/SearchBar/SearchBar';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './SupplierList.css';

const SupplierList = () => {
  const { suppliers, loading, error, deleteSupplier, updateSupplierStatus } = useSuppliers();
  const { addNotification } = useNotifications();
  
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, supplier: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, supplier: null, newStatus: '' });
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter, categoryFilter, ratingFilter]);

  const filterSuppliers = () => {
    let filtered = suppliers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.category === categoryFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter(supplier => Math.floor(supplier.rating) >= minRating);
    }

    setFilteredSuppliers(filtered);
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier(deleteModal.supplier.id);
      addNotification('Supplier deleted successfully', 'success');
      setDeleteModal({ isOpen: false, supplier: null });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to delete supplier', 'error');
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateSupplierStatus(statusModal.supplier.id, statusModal.newStatus);
      addNotification('Supplier status updated successfully', 'success');
      setStatusModal({ isOpen: false, supplier: null, newStatus: '' });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update supplier status', 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedSuppliers.length === 0) {
      addNotification('Please select suppliers first', 'warning');
      return;
    }

    try {
      for (const supplierId of selectedSuppliers) {
        await updateSupplierStatus(supplierId, action);
      }
      addNotification(`Bulk ${action} completed for ${selectedSuppliers.length} suppliers`, 'success');
      setSelectedSuppliers([]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to perform bulk action', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-badge--active',
      inactive: 'status-badge--inactive',
      pending: 'status-badge--pending',
      suspended: 'status-badge--suspended',
      'on-hold': 'status-badge--on-hold'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--pending'}`;
  };

  const getApprovalBadgeClass = (approvalStatus) => {
    const approvalClasses = {
      approved: 'approval-badge--approved',
      pending: 'approval-badge--pending',
      rejected: 'approval-badge--rejected',
      'under-review': 'approval-badge--under-review'
    };
    return `approval-badge ${approvalClasses[approvalStatus] || 'approval-badge--pending'}`;
  };

  const renderRatingStars = (rating) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${
              star <= Math.floor(rating) ? 'full' : star === Math.ceil(rating) && !Number.isInteger(rating) ? 'half' : ''
            }`}
          >
            ★
          </span>
        ))}
        <span className="rating-value">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const getPerformanceClass = (performance) => {
    if (performance >= 90) return 'performance--excellent';
    if (performance >= 80) return 'performance--good';
    if (performance >= 70) return 'performance--average';
    if (performance >= 60) return 'performance--poor';
    return 'performance--critical';
  };

  const getCategories = () => {
    const categories = [...new Set(suppliers.map(s => s.category))];
    return categories.filter(category => category);
  };

  const calculateStats = () => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === 'active').length;
    const pending = suppliers.filter(s => s.status === 'pending').length;
    const approved = suppliers.filter(s => s.approvalStatus === 'approved').length;
    const highPerformance = suppliers.filter(s => s.performance >= 80).length;

    return { total, active, pending, approved, highPerformance };
  };

  const stats = calculateStats();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error loading suppliers: {error}</div>;

  return (
    <div className="supplier-list">
      {/* Header */}
      <div className="supplier-list-header">
        <div className="header-left">
          <h1>Supplier Directory</h1>
          <p>Manage and track your supplier relationships</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="icon-list"></i>
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="icon-grid"></i>
            </button>
          </div>
          <Link to="/suppliers/add" className="btn btn--primary">
            <i className="icon-plus"></i>
            Add Supplier
          </Link>
          <button className="btn btn--outline" onClick={() => window.print()}>
            <i className="icon-printer"></i>
            Print
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="supplier-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="icon-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Suppliers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="icon-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <i className="icon-award"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon performance">
            <i className="icon-trending-up"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.highPerformance}</div>
            <div className="stat-label">High Performance</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="supplier-filters">
        <div className="filter-group">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search suppliers by name, contact, or category..."
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Rating:</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>
        <div className="filter-group">
          <button 
            className="btn btn--secondary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setRatingFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSuppliers.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <i className="icon-check-circle"></i>
            <span>{selectedSuppliers.length} suppliers selected</span>
          </div>
          <div className="bulk-buttons">
            <button 
              className="btn btn--sm btn--success"
              onClick={() => handleBulkAction('active')}
            >
              <i className="icon-check"></i>
              Activate Selected
            </button>
            <button 
              className="btn btn--sm btn--warning"
              onClick={() => handleBulkAction('inactive')}
            >
              <i className="icon-pause"></i>
              Deactivate Selected
            </button>
            <button 
              className="btn btn--sm btn--secondary"
              onClick={() => setSelectedSuppliers([])}
            >
              <i className="icon-x-circle"></i>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Suppliers Table View */}
      {viewMode === 'table' && (
        <div className="supplier-table-container">
          <table className="supplier-table">
            <thead>
              <tr>
                <th width="40">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSuppliers(filteredSuppliers.map(s => s.id));
                      } else {
                        setSelectedSuppliers([]);
                      }
                    }}
                    checked={selectedSuppliers.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                  />
                </th>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Performance</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="no-data-content">
                      <i className="icon-users"></i>
                      <p>No suppliers found</p>
                      <Link to="/suppliers/add" className="btn btn--primary">
                        Add Your First Supplier
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="supplier-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSuppliers(prev => [...prev, supplier.id]);
                          } else {
                            setSelectedSuppliers(prev => prev.filter(id => id !== supplier.id));
                          }
                        }}
                      />
                    </td>
                    <td className="supplier-info">
                      <div className="supplier-name">
                        <Link to={`/suppliers/${supplier.id}`}>{supplier.name}</Link>
                      </div>
                      <div className="supplier-meta">
                        <span className="supplier-email">{supplier.email}</span>
                        <span className="supplier-phone">{supplier.phone}</span>
                      </div>
                    </td>
                    <td className="contact-info">
                      <div className="contact-person">{supplier.contactPerson}</div>
                      <div className="contact-role">{supplier.contactRole}</div>
                    </td>
                    <td className="supplier-category">
                      <span className="category-badge">{supplier.category}</span>
                    </td>
                    <td className="supplier-rating">
                      {renderRatingStars(supplier.rating)}
                    </td>
                    <td className="supplier-performance">
                      <div className="performance-bar">
                        <div 
                          className={`performance-fill ${getPerformanceClass(supplier.performance)}`}
                          style={{ width: `${supplier.performance}%` }}
                        ></div>
                        <span className="performance-value">{supplier.performance}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(supplier.status)}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <span className={getApprovalBadgeClass(supplier.approvalStatus)}>
                        {supplier.approvalStatus}
                      </span>
                    </td>
                    <td className="supplier-actions">
                      <div className="action-buttons">
                        <Link 
                          to={`/suppliers/${supplier.id}`}
                          className="btn btn--sm btn--outline"
                          title="View Details"
                        >
                          <i className="icon-eye"></i>
                        </Link>
                        <Link
                          to={`/suppliers/edit/${supplier.id}`}
                          className="btn btn--sm btn--secondary"
                          title="Edit Supplier"
                        >
                          <i className="icon-edit"></i>
                        </Link>
                        <button
                          onClick={() => setStatusModal({ 
                            isOpen: true, 
                            supplier, 
                            newStatus: supplier.status === 'active' ? 'inactive' : 'active' 
                          })}
                          className={`btn btn--sm ${supplier.status === 'active' ? 'btn--warning' : 'btn--success'}`}
                          title={supplier.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <i className={supplier.status === 'active' ? 'icon-pause' : 'icon-play'}></i>
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, supplier })}
                          className="btn btn--sm btn--danger"
                          title="Delete Supplier"
                        >
                          <i className="icon-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Suppliers Grid View */}
      {viewMode === 'grid' && (
        <div className="supplier-grid">
          {filteredSuppliers.length === 0 ? (
            <div className="no-suppliers">
              <div className="no-suppliers-content">
                <i className="icon-users"></i>
                <h3>No suppliers found</h3>
                <p>Try adjusting your search criteria or add a new supplier</p>
                <Link to="/suppliers/add" className="btn btn--primary">
                  Add New Supplier
                </Link>
              </div>
            </div>
          ) : (
            filteredSuppliers.map(supplier => (
              <div key={supplier.id} className="supplier-card">
                <div className="card-header">
                  <div className="supplier-avatar">
                    {supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="supplier-title">
                    <h3>
                      <Link to={`/suppliers/${supplier.id}`}>{supplier.name}</Link>
                    </h3>
                    <span className={getStatusBadgeClass(supplier.status)}>
                      {supplier.status}
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="contact-info">
                    <div className="info-item">
                      <i className="icon-user"></i>
                      <span>{supplier.contactPerson}</span>
                    </div>
                    <div className="info-item">
                      <i className="icon-mail"></i>
                      <span>{supplier.email}</span>
                    </div>
                    <div className="info-item">
                      <i className="icon-phone"></i>
                      <span>{supplier.phone}</span>
                    </div>
                  </div>

                  <div className="supplier-meta">
                    <div className="meta-item">
                      <label>Category:</label>
                      <span className="category-tag">{supplier.category}</span>
                    </div>
                    <div className="meta-item">
                      <label>Approval:</label>
                      <span className={getApprovalBadgeClass(supplier.approvalStatus)}>
                        {supplier.approvalStatus}
                      </span>
                    </div>
                  </div>

                  <div className="supplier-stats">
                    <div className="stat">
                      <label>Rating</label>
                      {renderRatingStars(supplier.rating)}
                    </div>
                    <div className="stat">
                      <label>Performance</label>
                      <div className="performance-score">
                        <span className={getPerformanceClass(supplier.performance)}>
                          {supplier.performance}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <Link 
                    to={`/suppliers/${supplier.id}`}
                    className="btn btn--sm btn--outline"
                  >
                    <i className="icon-eye"></i>
                    View
                  </Link>
                  <Link
                    to={`/suppliers/edit/${supplier.id}`}
                    className="btn btn--sm btn--secondary"
                  >
                    <i className="icon-edit"></i>
                    Edit
                  </Link>
                  <button
                    onClick={() => setStatusModal({ 
                      isOpen: true, 
                      supplier, 
                      newStatus: supplier.status === 'active' ? 'inactive' : 'active' 
                    })}
                    className={`btn btn--sm ${supplier.status === 'active' ? 'btn--warning' : 'btn--success'}`}
                  >
                    <i className={supplier.status === 'active' ? 'icon-pause' : 'icon-play'}></i>
                    {supplier.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, supplier: null })}
        title="Delete Supplier"
      >
        <div className="delete-modal">
          <div className="warning-icon">
            <i className="icon-alert-triangle"></i>
          </div>
          <p>
            Are you sure you want to delete <strong>"{deleteModal.supplier?.name}"</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone and will permanently remove the supplier from the system.
          </p>
          <div className="modal-actions">
            <button
              className="btn btn--secondary"
              onClick={() => setDeleteModal({ isOpen: false, supplier: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn--danger"
              onClick={handleDelete}
            >
              Delete Supplier
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, supplier: null, newStatus: '' })}
        title="Change Supplier Status"
      >
        <div className="status-modal">
          <p>
            Change status of <strong>"{statusModal.supplier?.name}"</strong> to{' '}
            <span className={getStatusBadgeClass(statusModal.newStatus)}>
              {statusModal.newStatus}
            </span>?
          </p>
          <div className="modal-actions">
            <button
              className="btn btn--secondary"
              onClick={() => setStatusModal({ isOpen: false, supplier: null, newStatus: '' })}
            >
              Cancel
            </button>
            <button
              className="btn btn--primary"
              onClick={handleStatusChange}
            >
              Confirm Change
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierList;