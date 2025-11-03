// src/pages/Suppliers/RFQOpportunities/RFQOpportunities.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { suppliersAPI } from '../../../services/api/suppliersAPI';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Notification from '../../../components/common/Notification/Notification';
import Modal from '../../../components/common/Modal/Modal';
import Pagination from '../../../components/common/Pagination/Pagination';
import './RFQOpportunities.css';

const RFQOpportunities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [rfqs, setRfqs] = useState([]);
  const [filteredRfqs, setFilteredRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Modal States
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [savingBid, setSavingBid] = useState(false);

  // Load RFQ opportunities
  const loadRFQOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        dateRange: dateFilter !== 'all' ? dateFilter : undefined,
        search: searchTerm || undefined,
        sort: sortBy,
        order: sortOrder,
        page: currentPage,
        limit: itemsPerPage,
        supplierId: user?.supplierId
      };

      // Remove undefined parameters
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await supplierAPI.getRFQOpportunities(params);
      
      if (response.success) {
        setRfqs(response.data.rfqs || []);
        setFilteredRfqs(response.data.rfqs || []);
      } else {
        throw new Error(response.message || 'Failed to load RFQ opportunities');
      }
    } catch (err) {
      console.error('Failed to load RFQ opportunities:', err);
      setError(err.message || 'Failed to load RFQ opportunities. Please try again.');
      
      // Fallback mock data for development
      if (process.env.NODE_ENV === 'development') {
        setRfqs(getMockRFQs());
        setFilteredRfqs(getMockRFQs());
      }
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, priorityFilter, dateFilter, searchTerm, sortBy, sortOrder, currentPage, itemsPerPage, user?.supplierId]);

  // Initial load and when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadRFQOpportunities();
  }, [loadRFQOpportunities]);

  // Apply filters and search
  useEffect(() => {
    let filtered = rfqs;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(rfq =>
        rfq.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.procurementOrganization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rfq => {
        const status = getRFQStatus(rfq);
        return status.type === statusFilter;
      });
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(rfq => rfq.category === categoryFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(rfq => rfq.priority === priorityFilter);
    }
    
    setFilteredRfqs(filtered);
  }, [rfqs, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  // Quick bid submission
  const handleQuickBid = async (rfqId, bidAmount, notes = '') => {
    try {
      setSavingBid(true);
      
      const bidData = {
        rfqId: rfqId,
        bidAmount: parseFloat(bidAmount),
        notes: notes,
        submittedBy: user?.id,
        supplierId: user?.supplierId,
        currency: 'USD',
        validityPeriod: 30, // days
        deliveryTime: '14 days', // default delivery time
        terms: 'Standard terms and conditions apply'
      };

      const response = await supplierAPI.submitBid(bidData);
      
      if (response.success) {
        setShowQuickView(false);
        setSelectedRfq(null);
        setSuccessMessage('Bid submitted successfully!');
        
        // Refresh the list to update bid status
        await loadRFQOpportunities();
        
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message || 'Failed to submit bid');
      }
    } catch (err) {
      console.error('Failed to submit bid:', err);
      setError(err.message || 'Failed to submit bid. Please try again.');
    } finally {
      setSavingBid(false);
    }
  };

  // Handle quick view
  const handleQuickView = (rfq) => {
    setSelectedRfq(rfq);
    setShowQuickView(true);
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

  // Format deadline with time
  const formatDeadline = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get RFQ status information
  const getRFQStatus = (rfq) => {
    const daysRemaining = getDaysRemaining(rfq.deadline);
    
    if (rfq.status === 'cancelled') {
      return { type: 'cancelled', text: 'Cancelled', class: 'cancelled', icon: '❌' };
    }
    
    if (daysRemaining < 0) {
      return { type: 'expired', text: 'Expired', class: 'expired', icon: '⏰' };
    }
    
    if (daysRemaining === 0) {
      return { type: 'urgent', text: 'Due Today', class: 'urgent', icon: '🚨' };
    }
    
    if (daysRemaining <= 2) {
      return { type: 'urgent', text: `Due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`, class: 'urgent', icon: '⚠️' };
    }
    
    if (daysRemaining <= 7) {
      return { type: 'active', text: `Due in ${daysRemaining} days`, class: 'active', icon: '📅' };
    }
    
    return { type: 'active', text: `Due in ${daysRemaining} days`, class: 'active', icon: '📋' };
  };

  // Get priority information
  const getPriorityInfo = (priority) => {
    const priorityMap = {
      'low': { class: 'priority-low', text: 'Low', icon: '⬇️' },
      'medium': { class: 'priority-medium', text: 'Medium', icon: '➡️' },
      'high': { class: 'priority-high', text: 'High', icon: '⬆️' },
      'urgent': { class: 'priority-urgent', text: 'Urgent', icon: '🚨' }
    };
    
    return priorityMap[priority] || { class: 'priority-medium', text: 'Medium', icon: '➡️' };
  };

  // Get category information
  const getCategoryInfo = (category) => {
    const categoryMap = {
      'raw-materials': { class: 'category-raw', text: 'Raw Materials', icon: '🏭' },
      'equipment': { class: 'category-equipment', text: 'Equipment', icon: '⚙️' },
      'services': { class: 'category-services', text: 'Services', icon: '🔧' },
      'supplies': { class: 'category-supplies', text: 'Supplies', icon: '📦' },
      'electronics': { class: 'category-electronics', text: 'Electronics', icon: '💻' },
      'construction': { class: 'category-construction', text: 'Construction', icon: '🏗️' },
      'office-supplies': { class: 'category-office', text: 'Office Supplies', icon: '📎' }
    };
    
    return categoryMap[category] || { class: 'category-default', text: category, icon: '📋' };
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalRFQs = rfqs.length;
    const activeRFQs = rfqs.filter(rfq => getRFQStatus(rfq).type === 'active').length;
    const urgentRFQs = rfqs.filter(rfq => getRFQStatus(rfq).type === 'urgent').length;
    const totalValue = rfqs.reduce((total, rfq) => total + (rfq.estimatedValue || 0), 0);
    const bidsSubmitted = rfqs.filter(rfq => rfq.hasBid).length;

    return {
      totalRFQs,
      activeRFQs,
      urgentRFQs,
      totalValue,
      bidsSubmitted
    };
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('active');
    setPriorityFilter('all');
    setDateFilter('all');
    setSortBy('deadline');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Check if RFQ matches supplier capabilities
  const matchesSupplierCapabilities = (rfq) => {
    // This would typically check against supplier's registered categories and capabilities
    // For now, return true for all RFQs
    return true;
  };

  // Mock data for development
  const getMockRFQs = () => {
    return [
      {
        id: '1',
        rfqNumber: 'RFQ-2024-001',
        title: 'Industrial Sensors Procurement',
        description: 'Procurement of 500 industrial-grade temperature and pressure sensors for manufacturing facility. Required specifications: IP67 rating, temperature range -40°C to 125°C, 4-20mA output.',
        procurementOrganization: 'Tech Manufacturing Inc.',
        category: 'electronics',
        estimatedValue: 125000,
        deadline: '2024-02-15T17:00:00Z',
        priority: 'high',
        status: 'active',
        items: [
          { name: 'Temperature Sensor', quantity: 300, specifications: 'IP67, -40°C to 125°C' },
          { name: 'Pressure Sensor', quantity: 200, specifications: 'IP67, 0-100 PSI' }
        ],
        requirements: 'ISO 9001 certification required. Minimum 3 years warranty.',
        contactPerson: 'John Smith',
        contactEmail: 'procurement@techmfg.com',
        hasBid: false
      },
      {
        id: '2',
        rfqNumber: 'RFQ-2024-002',
        title: 'Office Furniture Supply',
        description: 'Supply of ergonomic office furniture for new corporate headquarters. Includes executive chairs, standing desks, and conference room furniture.',
        procurementOrganization: 'Global Innovations LLC',
        category: 'supplies',
        estimatedValue: 75000,
        deadline: '2024-01-25T12:00:00Z',
        priority: 'urgent',
        status: 'active',
        items: [
          { name: 'Ergonomic Chair', quantity: 150, specifications: 'Adjustable height, lumbar support' },
          { name: 'Standing Desk', quantity: 100, specifications: 'Electric height adjustment' }
        ],
        requirements: 'BIFMA certification required. Sustainable materials preferred.',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah.johnson@globalinnovations.com',
        hasBid: true
      }
    ];
  };

  const stats = calculateStats();

  if (loading && rfqs.length === 0) {
    return (
      <div className="rfq-opportunities">
        <div className="page-header">
          <h1>RFQ Opportunities</h1>
        </div>
        <LoadingSpinner message="Loading RFQ opportunities..." />
      </div>
    );
  }

  return (
    <div className="rfq-opportunities">
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
            <h1>RFQ Opportunities</h1>
            <p>Browse and bid on requests for quotations from procurement organizations</p>
            <div className="header-stats">
              <span className="stat-item">
                <strong>{stats.totalRFQs}</strong> total RFQs
              </span>
              <span className="stat-item">
                <strong>{stats.activeRFQs}</strong> active
              </span>
              <span className="stat-item">
                <strong>{stats.urgentRFQs}</strong> urgent
              </span>
              <span className="stat-item">
                <strong>{stats.bidsSubmitted}</strong> bids submitted
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={loadRFQOpportunities}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link to="/supplier/capabilities" className="btn btn-secondary">
              Manage Capabilities
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="rfq-stats">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{stats.totalRFQs}</div>
          <div className="stat-label">Total RFQs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.activeRFQs}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-value">{stats.urgentRFQs}</div>
          <div className="stat-label">Urgent</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
          <div className="stat-label">Total Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.bidsSubmitted}</div>
          <div className="stat-label">Bids Submitted</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-toolbar">
          <div className="search-section">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search RFQs by title, description, organization..."
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
                <option value="active">Active</option>
                <option value="urgent">Urgent</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select 
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Categories</option>
                <option value="raw-materials">Raw Materials</option>
                <option value="equipment">Equipment</option>
                <option value="services">Services</option>
                <option value="supplies">Supplies</option>
                <option value="electronics">Electronics</option>
                <option value="construction">Construction</option>
                <option value="office-supplies">Office Supplies</option>
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
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="date-filter">Deadline:</label>
              <select 
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Time</option>
                <option value="today">Due Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
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

      {/* RFQ Grid */}
      <div className="rfq-grid-section">
        <div className="section-header">
          <h2>
            Available Opportunities ({filteredRfqs.length})
            {loading && <span className="loading-indicator">Updating...</span>}
          </h2>
          
          <div className="sort-options">
            <label htmlFor="sort-by">Sort by:</label>
            <select 
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading}
            >
              <option value="deadline">Deadline</option>
              <option value="estimatedValue">Value</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="createdAt">Date Posted</option>
            </select>
          </div>
        </div>

        {filteredRfqs.length > 0 ? (
          <>
            <div className="rfq-grid">
              {filteredRfqs.map(rfq => {
                const status = getRFQStatus(rfq);
                const priority = getPriorityInfo(rfq.priority);
                const category = getCategoryInfo(rfq.category);
                const daysRemaining = getDaysRemaining(rfq.deadline);
                const matchesCapabilities = matchesSupplierCapabilities(rfq);
                
                return (
                  <div key={rfq.id} className={`rfq-card ${!matchesCapabilities ? 'capability-mismatch' : ''}`}>
                    <div className="rfq-header">
                      <div className="rfq-title-section">
                        <h3 className="rfq-title" title={rfq.title}>
                          {rfq.title}
                        </h3>
                        <span className="rfq-number">{rfq.rfqNumber}</span>
                      </div>
                      <div className="rfq-status-section">
                        <span className={`status-badge ${status.class}`}>
                          <span className="status-icon">{status.icon}</span>
                          {status.text}
                        </span>
                        <span className={`priority-badge ${priority.class}`}>
                          {priority.icon} {priority.text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="rfq-content">
                      <div className="rfq-meta">
                        <div className="meta-item">
                          <span className="label">Organization:</span>
                          <span className="value">{rfq.procurementOrganization}</span>
                        </div>
                        <div className="meta-item">
                          <span className="label">Category:</span>
                          <span className={`value category-tag ${category.class}`}>
                            {category.icon} {category.text}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="label">Estimated Value:</span>
                          <span className="value highlight">{formatCurrency(rfq.estimatedValue)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="label">Deadline:</span>
                          <span className="value deadline">{formatDeadline(rfq.deadline)}</span>
                        </div>
                        {daysRemaining !== null && (
                          <div className="meta-item">
                            <span className="label">Time Remaining:</span>
                            <span className={`value ${status.class}`}>
                              {daysRemaining > 0 ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}` : 'Expired'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="rfq-description">
                        <p>{rfq.description}</p>
                      </div>

                      {rfq.items && rfq.items.length > 0 && (
                        <div className="rfq-items">
                          <div className="items-label">{rfq.items.length} item(s):</div>
                          <div className="items-preview">
                            {rfq.items.slice(0, 2).map((item, index) => (
                              <span key={index} className="item-tag">
                                {item.quantity}x {item.name}
                              </span>
                            ))}
                            {rfq.items.length > 2 && (
                              <span className="more-items">+{rfq.items.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {!matchesCapabilities && (
                        <div className="capability-warning">
                          ⚠️ Outside your registered capabilities
                        </div>
                      )}
                    </div>

                    <div className="rfq-actions">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleQuickView(rfq)}
                        disabled={loading}
                      >
                        Quick View
                      </button>
                      
                      <Link 
                        to={`/supplier/rfq-opportunities/${rfq.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Full Details
                      </Link>
                      
                      {status.type === 'active' && daysRemaining > 0 && matchesCapabilities && (
                        <Link 
                          to={`/supplier/rfq-opportunities/${rfq.id}/bid`}
                          className="btn btn-primary btn-sm"
                        >
                          {rfq.hasBid ? 'Update Bid' : 'Submit Bid'}
                        </Link>
                      )}
                      
                      {rfq.hasBid && (
                        <span className="bid-submitted-badge">
                          ✅ Bid Submitted
                        </span>
                      )}
                      
                      {status.type === 'expired' && (
                        <span className="expired-badge">
                          ❌ Expired
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredRfqs.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredRfqs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No RFQ Opportunities Found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search filters to find more RFQ opportunities.'
                : "There are currently no RFQ opportunities available. New opportunities will appear here when procurement organizations post them."
              }
            </p>
            <div className="empty-actions">
              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') ? (
                <button 
                  className="btn btn-outline"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              ) : (
                <Link to="/supplier/profile" className="btn btn-primary">
                  Complete Your Profile
                </Link>
              )}
              <button 
                className="btn btn-outline"
                onClick={loadRFQOpportunities}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        title="RFQ Quick View"
        size="large"
      >
        {selectedRfq && (
          <div className="quick-view-content">
            <div className="quick-view-header">
              <h3>{selectedRfq.title}</h3>
              <span className="rfq-number">{selectedRfq.rfqNumber}</span>
            </div>
            
            <div className="quick-view-meta">
              <div className="meta-grid">
                <div className="meta-item">
                  <strong>Organization:</strong>
                  <span>{selectedRfq.procurementOrganization}</span>
                </div>
                <div className="meta-item">
                  <strong>Category:</strong>
                  <span>{getCategoryInfo(selectedRfq.category).text}</span>
                </div>
                <div className="meta-item">
                  <strong>Estimated Value:</strong>
                  <span className="highlight">{formatCurrency(selectedRfq.estimatedValue)}</span>
                </div>
                <div className="meta-item">
                  <strong>Deadline:</strong>
                  <span>{formatDeadline(selectedRfq.deadline)}</span>
                </div>
              </div>
            </div>
            
            <div className="quick-view-description">
              <h4>Description</h4>
              <p>{selectedRfq.description}</p>
            </div>
            
            {selectedRfq.requirements && (
              <div className="quick-view-requirements">
                <h4>Requirements</h4>
                <p>{selectedRfq.requirements}</p>
              </div>
            )}
            
            <div className="quick-view-actions">
              <Link 
                to={`/supplier/rfq-opportunities/${selectedRfq.id}`}
                className="btn btn-outline"
              >
                View Full Details
              </Link>
              
              {getRFQStatus(selectedRfq).type === 'active' && getDaysRemaining(selectedRfq.deadline) > 0 && (
                <Link 
                  to={`/supplier/rfq-opportunities/${selectedRfq.id}/bid`}
                  className="btn btn-primary"
                >
                  {selectedRfq.hasBid ? 'Update Bid' : 'Submit Bid'}
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RFQOpportunities;