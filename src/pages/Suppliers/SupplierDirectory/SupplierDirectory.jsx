import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSuppliers } from '../../../hooks/useSuppliers';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import { CurrencyFormatters } from '../../../utils/helpers/formatters';

const { formatCurrency } = CurrencyFormatters;

import './SupplierDirectory.css';
/*const SUPPLIER_STATUS = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended',
  approved: 'Approved',
  rejected: 'Rejected'
};*/
const SupplierDirectory = () => {
  const navigate = useNavigate();
  const { 
    suppliers, 
    loading, 
    error,
    deleteSupplier,
    updateSupplierStatus,
    refetch 
  } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewSupplier, setQuickViewSupplier] = useState(null);

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === '4+' && supplier.rating >= 4) ||
        (ratingFilter === '3+' && supplier.rating >= 3) ||
        (ratingFilter === '2+' && supplier.rating >= 2) ||
        (ratingFilter === '1+' && supplier.rating >= 1);

      const matchesLocation = locationFilter === 'all' || 
        supplier.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        supplier.country?.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory && matchesRating && matchesLocation;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'rating') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortBy === 'totalOrders' || sortBy === 'totalSpend') {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      }

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [suppliers, searchTerm, statusFilter, categoryFilter, ratingFilter, locationFilter, sortBy, sortOrder]);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = new Set();
    suppliers.forEach(supplier => {
      if (supplier.city && supplier.country) {
        locations.add(`${supplier.city}, ${supplier.country}`);
      }
    });
    return Array.from(locations);
  }, [suppliers]);

  // Pagination
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSuppliers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

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

  const handleSelectSupplier = (supplierId) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.length === paginatedSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(paginatedSuppliers.map(supplier => supplier.id));
    }
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      await deleteSupplier(supplierToDelete.id);
      setShowDeleteModal(false);
      setSupplierToDelete(null);
      refetch();
    }
  };

  const handleQuickView = (supplier) => {
    setQuickViewSupplier(supplier);
    setShowQuickView(true);
  };

  const handleStatusUpdate = async (supplierId, newStatus) => {
    try {
      await updateSupplierStatus(supplierId, newStatus);
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) return;

    switch (bulkAction) {
      case 'activate':
        await Promise.all(
          selectedSuppliers.map(id => updateSupplierStatus(id, 'active'))
        );
        break;
      case 'deactivate':
        await Promise.all(
          selectedSuppliers.map(id => updateSupplierStatus(id, 'inactive'))
        );
        break;
      case 'delete':
        await Promise.all(
          selectedSuppliers.map(id => deleteSupplier(id))
        );
        break;
      default:
        break;
    }

    setSelectedSuppliers([]);
    setBulkAction('');
    refetch();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', label: 'Active', icon: '🟢' },
      inactive: { class: 'status-inactive', label: 'Inactive', icon: '⚫' },
      pending: { class: 'status-pending', label: 'Pending', icon: '🟡' },
      suspended: { class: 'status-suspended', label: 'Suspended', icon: '🔴' },
      approved: { class: 'status-approved', label: 'Approved', icon: '✅' },
      rejected: { class: 'status-rejected', label: 'Rejected', icon: '❌' }
    };

    const config = statusConfig[status] || { class: 'status-default', label: status, icon: '❓' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return (
      <div className="rating-stars">
        {stars}
        <span className="rating-value">({rating})</span>
      </div>
    );
  };

  const getPerformanceBadge = (performance) => {
    if (performance >= 90) return { class: 'performance-excellent', label: 'Excellent' };
    if (performance >= 80) return { class: 'performance-good', label: 'Good' };
    if (performance >= 70) return { class: 'performance-fair', label: 'Fair' };
    return { class: 'performance-poor', label: 'Poor' };
  };

  const getCategoryBadge = (category) => {
    return <span className="category-badge">{category}</span>;
  };

  if (loading) {
    return (
      <div className="supplier-directory-loading">
        <LoadingSpinner size="large" />
        <p>Loading suppliers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supplier-directory-error">
        <div className="error-content">
          <h3>Error Loading Suppliers</h3>
          <p>{error}</p>
          <button onClick={refetch} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-directory">
      {/* Header */}
      <div className="directory-header">
        <div className="header-content">
          <h1>Supplier Directory</h1>
          <p>Manage and track all your suppliers in one place</p>
        </div>
        <div className="header-actions">
          <Link to="/suppliers/add" className="btn-primary">
            + Add Supplier
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="supplier-stats">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{suppliers.length}</h3>
            <p>Total Suppliers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{suppliers.filter(s => s.status === 'active').length}</h3>
            <p>Active Suppliers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{suppliers.filter(s => s.rating >= 4).length}</h3>
            <p>Top Rated</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(suppliers.reduce((sum, s) => sum + (s.totalSpend || 0), 0))}</h3>
            <p>Total Spend</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="directory-filters">
        <div className="filters-left">
          <SearchBar
            placeholder="Search suppliers by name, company, email..."
            onSearch={handleSearch}
            className="search-bar"
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {Object.entries(supplierStatus).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {supplierCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select 
            value={ratingFilter} 
            onChange={(e) => setRatingFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="4+">4+ Stars</option>
            <option value="3+">3+ Stars</option>
            <option value="2+">2+ Stars</option>
            <option value="1+">1+ Stars</option>
          </select>

          <select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="filters-right">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="totalOrders">Sort by Orders</option>
            <option value="totalSpend">Sort by Spend</option>
            <option value="createdAt">Sort by Date Added</option>
          </select>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ▦
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSuppliers.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-actions-info">
            <span>{selectedSuppliers.length} suppliers selected</span>
          </div>
          <div className="bulk-actions-controls">
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Bulk Actions</option>
              <option value="activate">Activate Selected</option>
              <option value="deactivate">Deactivate Selected</option>
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
              onClick={() => setSelectedSuppliers([])}
              className="btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Suppliers Grid/List */}
      <div className={`suppliers-container ${viewMode}`}>
        {paginatedSuppliers.length === 0 ? (
          <div className="no-suppliers">
            <div className="no-suppliers-content">
              <h3>No suppliers found</h3>
              <p>Try adjusting your search or filters</p>
              <Link to="/suppliers/add" className="btn-primary">
                Add Your First Supplier
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="suppliers-grid">
            {paginatedSuppliers.map((supplier) => (
              <div key={supplier.id} className="supplier-card">
                <div className="card-header">
                  <div className="supplier-basic-info">
                    <div className="supplier-avatar">
                      {supplier.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="supplier-names">
                      <h3 className="supplier-name">{supplier.name}</h3>
                      <p className="company-name">{supplier.companyName}</p>
                    </div>
                  </div>
                  <div className="card-actions">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(supplier.id)}
                      onChange={() => handleSelectSupplier(supplier.id)}
                      className="checkbox"
                    />
                  </div>
                </div>

                <div className="card-content">
                  <div className="supplier-meta">
                    <div className="meta-item">
                      <span className="meta-label">Status:</span>
                      {getStatusBadge(supplier.status)}
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Category:</span>
                      {getCategoryBadge(supplier.category)}
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Rating:</span>
                      {getRatingStars(supplier.rating || 0)}
                    </div>
                  </div>

                  <div className="supplier-contact">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <span className="contact-value">{supplier.email}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <span className="contact-value">{supplier.phone}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📍</span>
                      <span className="contact-value">
                        {supplier.city}, {supplier.country}
                      </span>
                    </div>
                  </div>

                  {supplier.performance && (
                    <div className="performance-indicator">
                      <div className="performance-header">
                        <span>Performance Score</span>
                        <span className={`performance-badge ${getPerformanceBadge(supplier.performance).class}`}>
                          {getPerformanceBadge(supplier.performance).label}
                        </span>
                      </div>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ width: `${supplier.performance}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="supplier-stats">
                    <div className="stat-item">
                      <span className="stat-number">{supplier.totalOrders || 0}</span>
                      <span className="stat-label">Orders</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{formatCurrency(supplier.totalSpend || 0)}</span>
                      <span className="stat-label">Total Spend</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{supplier.onTimeDelivery || 0}%</span>
                      <span className="stat-label">On Time</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="footer-actions">
                    <button 
                      onClick={() => handleQuickView(supplier)}
                      className="btn-action quick-view"
                      title="Quick View"
                    >
                      👁️ Quick View
                    </button>
                    <Link 
                      to={`/suppliers/${supplier.id}`}
                      className="btn-action view-details"
                    >
                      View Details
                    </Link>
                    <div className="action-dropdown">
                      <button className="btn-action more">⋯</button>
                      <div className="dropdown-menu">
                        <Link 
                          to={`/suppliers/${supplier.id}/edit`}
                          className="dropdown-item"
                        >
                          ✏️ Edit
                        </Link>
                        <button 
                          onClick={() => handleStatusUpdate(
                            supplier.id, 
                            supplier.status === 'active' ? 'inactive' : 'active'
                          )}
                          className="dropdown-item"
                        >
                          {supplier.status === 'active' ? '⚫ Deactivate' : '🟢 Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(supplier)}
                          className="dropdown-item delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="suppliers-list">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.length === paginatedSuppliers.length && paginatedSuppliers.length > 0}
                      onChange={handleSelectAll}
                      className="checkbox"
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Supplier {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Contact</th>
                  <th>Category</th>
                  <th onClick={() => handleSort('rating')} className="sortable">
                    Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Status</th>
                  <th onClick={() => handleSort('totalOrders')} className="sortable">
                    Orders {sortBy === 'totalOrders' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('totalSpend')} className="sortable">
                    Total Spend {sortBy === 'totalSpend' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={() => handleSelectSupplier(supplier.id)}
                        className="checkbox"
                      />
                    </td>
                    <td className="supplier-info">
                      <div className="supplier-main">
                        <div className="supplier-avatar small">
                          {supplier.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="supplier-name">{supplier.name}</div>
                          <div className="company-name">{supplier.companyName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-info">
                      <div>{supplier.email}</div>
                      <div className="phone">{supplier.phone}</div>
                    </td>
                    <td className="category">
                      {getCategoryBadge(supplier.category)}
                    </td>
                    <td className="rating">
                      {getRatingStars(supplier.rating || 0)}
                    </td>
                    <td className="status">
                      {getStatusBadge(supplier.status)}
                    </td>
                    <td className="orders">
                      {supplier.totalOrders || 0}
                    </td>
                    <td className="spend">
                      {formatCurrency(supplier.totalSpend || 0)}
                    </td>
                    <td className="actions">
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleQuickView(supplier)}
                          className="btn-action quick-view"
                          title="Quick View"
                        >
                          👁️
                        </button>
                        <Link 
                          to={`/suppliers/${supplier.id}`}
                          className="btn-action view"
                          title="View Details"
                        >
                          📋
                        </Link>
                        <Link 
                          to={`/suppliers/${supplier.id}/edit`}
                          className="btn-action edit"
                          title="Edit"
                        >
                          ✏️
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(supplier)}
                          className="btn-action delete"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Quick View Modal */}
      <Modal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        title="Supplier Quick View"
        size="large"
        actions={[
          {
            label: 'Close',
            onClick: () => setShowQuickView(false),
            variant: 'secondary'
          },
          {
            label: 'View Full Profile',
            onClick: () => {
              navigate(`/suppliers/${quickViewSupplier.id}`);
              setShowQuickView(false);
            },
            variant: 'primary'
          }
        ]}
      >
        {quickViewSupplier && (
          <div className="quick-view-content">
            <div className="quick-view-header">
              <div className="supplier-avatar large">
                {quickViewSupplier.name?.charAt(0).toUpperCase()}
              </div>
              <div className="supplier-titles">
                <h2>{quickViewSupplier.name}</h2>
                <p>{quickViewSupplier.companyName}</p>
                <div className="supplier-meta">
                  {getStatusBadge(quickViewSupplier.status)}
                  {getCategoryBadge(quickViewSupplier.category)}
                </div>
              </div>
            </div>

            <div className="quick-view-grid">
              <div className="info-section">
                <h4>Contact Information</h4>
                <div className="info-item">
                  <strong>Email:</strong> {quickViewSupplier.email}
                </div>
                <div className="info-item">
                  <strong>Phone:</strong> {quickViewSupplier.phone}
                </div>
                <div className="info-item">
                  <strong>Contact Person:</strong> {quickViewSupplier.contactPerson}
                </div>
                <div className="info-item">
                  <strong>Address:</strong> {quickViewSupplier.address}, {quickViewSupplier.city}, {quickViewSupplier.country}
                </div>
              </div>

              <div className="info-section">
                <h4>Performance Metrics</h4>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-value">{quickViewSupplier.rating || 0}/5</span>
                    <span className="metric-label">Rating</span>
                    {getRatingStars(quickViewSupplier.rating || 0)}
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">{quickViewSupplier.totalOrders || 0}</span>
                    <span className="metric-label">Total Orders</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">{formatCurrency(quickViewSupplier.totalSpend || 0)}</span>
                    <span className="metric-label">Total Spend</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">{quickViewSupplier.onTimeDelivery || 0}%</span>
                    <span className="metric-label">On Time Delivery</span>
                  </div>
                </div>
              </div>

              {quickViewSupplier.notes && (
                <div className="info-section full-width">
                  <h4>Notes</h4>
                  <p>{quickViewSupplier.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Supplier"
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
          <p>Are you sure you want to delete supplier <strong>{supplierToDelete?.name}</strong>?</p>
          <p className="warning-text">This action cannot be undone. All associated data will be permanently removed.</p>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierDirectory;
