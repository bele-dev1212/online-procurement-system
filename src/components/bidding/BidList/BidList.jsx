import React, { useState, useEffect, useMemo } from 'react';
import './BidList.css';

const BidList = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    rfq: 'all',
    supplier: 'all',
    dateRange: 'all'
  });
  const [sortConfig, setSortConfig] = useState({ key: 'submissionDate', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBids, setSelectedBids] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  // Mock data - replace with actual API calls
  const mockBids = [
    {
      id: 'BID-2024-001',
      rfqNumber: 'RFQ-2024-015',
      rfqTitle: 'Laptop Procurement Q1 2024',
      supplier: {
        id: 'SUPP-001',
        name: 'TechCorp Inc.',
        rating: 4.8
      },
      amount: 125000,
      currency: 'USD',
      submissionDate: new Date('2024-01-15T14:30:00Z'),
      validityDate: new Date('2024-02-15T23:59:59Z'),
      status: 'submitted',
      priority: 'high',
      evaluationScore: 92,
      items: [
        { name: 'Dell XPS 13', quantity: 50, unitPrice: 1200 },
        { name: 'Dell XPS 15', quantity: 25, unitPrice: 1800 }
      ],
      documents: 3,
      notes: 'Includes extended warranty and on-site support',
      lastUpdated: new Date('2024-01-15T14:30:00Z')
    },
    {
      id: 'BID-2024-002',
      rfqNumber: 'RFQ-2024-016',
      rfqTitle: 'Office Furniture Supply',
      supplier: {
        id: 'SUPP-002',
        name: 'OfficeWorld Ltd',
        rating: 4.6
      },
      amount: 87500,
      currency: 'USD',
      submissionDate: new Date('2024-01-14T11:20:00Z'),
      validityDate: new Date('2024-02-14T23:59:59Z'),
      status: 'under_review',
      priority: 'medium',
      evaluationScore: 88,
      items: [
        { name: 'Ergonomic Chair', quantity: 100, unitPrice: 350 },
        { name: 'Standing Desk', quantity: 50, unitPrice: 450 },
        { name: 'Filing Cabinet', quantity: 25, unitPrice: 300 }
      ],
      documents: 2,
      notes: 'Bulk discount applied',
      lastUpdated: new Date('2024-01-14T16:45:00Z')
    },
    {
      id: 'BID-2024-003',
      rfqNumber: 'RFQ-2024-015',
      rfqTitle: 'Laptop Procurement Q1 2024',
      supplier: {
        id: 'SUPP-003',
        name: 'CompuGlobal Ltd',
        rating: 4.2
      },
      amount: 118500,
      currency: 'USD',
      submissionDate: new Date('2024-01-14T09:15:00Z'),
      validityDate: new Date('2024-02-14T23:59:59Z'),
      status: 'submitted',
      priority: 'high',
      evaluationScore: 85,
      items: [
        { name: 'Dell XPS 13', quantity: 50, unitPrice: 1150 },
        { name: 'Dell XPS 15', quantity: 25, unitPrice: 1750 }
      ],
      documents: 4,
      notes: 'Early payment discount available',
      lastUpdated: new Date('2024-01-14T09:15:00Z')
    },
    {
      id: 'BID-2024-004',
      rfqNumber: 'RFQ-2024-017',
      rfqTitle: 'Software License Renewal',
      supplier: {
        id: 'SUPP-004',
        name: 'SoftSolutions Corp',
        rating: 4.4
      },
      amount: 156000,
      currency: 'USD',
      submissionDate: new Date('2024-01-13T16:40:00Z'),
      validityDate: new Date('2024-03-13T23:59:59Z'),
      status: 'approved',
      priority: 'medium',
      evaluationScore: 95,
      items: [
        { name: 'Microsoft Office 365', quantity: 200, unitPrice: 150 },
        { name: 'Adobe Creative Cloud', quantity: 50, unitPrice: 420 }
      ],
      documents: 5,
      notes: 'Includes training and support',
      lastUpdated: new Date('2024-01-14T10:20:00Z')
    },
    {
      id: 'BID-2024-005',
      rfqNumber: 'RFQ-2024-016',
      rfqTitle: 'Office Furniture Supply',
      supplier: {
        id: 'SUPP-005',
        name: 'FurniturePro Inc',
        rating: 4.1
      },
      amount: 92000,
      currency: 'USD',
      submissionDate: new Date('2024-01-13T14:10:00Z'),
      validityDate: new Date('2024-02-13T23:59:59Z'),
      status: 'rejected',
      priority: 'low',
      evaluationScore: 72,
      items: [
        { name: 'Ergonomic Chair', quantity: 100, unitPrice: 380 },
        { name: 'Standing Desk', quantity: 50, unitPrice: 480 },
        { name: 'Filing Cabinet', quantity: 25, unitPrice: 320 }
      ],
      documents: 3,
      notes: 'Delivery timeline too long',
      lastUpdated: new Date('2024-01-14T08:30:00Z')
    },
    {
      id: 'BID-2024-006',
      rfqNumber: 'RFQ-2024-018',
      rfqTitle: 'Network Equipment Upgrade',
      supplier: {
        id: 'SUPP-006',
        name: 'NetTech Solutions',
        rating: 4.7
      },
      amount: 234500,
      currency: 'USD',
      submissionDate: new Date('2024-01-12T10:05:00Z'),
      validityDate: new Date('2024-03-12T23:59:59Z'),
      status: 'awarded',
      priority: 'high',
      evaluationScore: 96,
      items: [
        { name: 'Cisco Switch 48-port', quantity: 10, unitPrice: 4500 },
        { name: 'Ubiquiti Access Points', quantity: 25, unitPrice: 1800 },
        { name: 'Network Cables & Accessories', quantity: 1, unitPrice: 15500 }
      ],
      documents: 6,
      notes: 'Includes installation and configuration',
      lastUpdated: new Date('2024-01-13T15:20:00Z')
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'awarded', label: 'Awarded' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const rfqOptions = [
    { value: 'all', label: 'All RFQs' },
    ...mockBids
      .filter((bid, index, self) => self.findIndex(b => b.rfqNumber === bid.rfqNumber) === index)
      .map(bid => ({ value: bid.rfqNumber, label: `${bid.rfqNumber} - ${bid.rfqTitle}` }))
  ];

  const supplierOptions = [
    { value: 'all', label: 'All Suppliers' },
    ...mockBids
      .filter((bid, index, self) => self.findIndex(b => b.supplier.id === bid.supplier.id) === index)
      .map(bid => ({ value: bid.supplier.id, label: bid.supplier.name }))
  ];

  useEffect(() => {
    // Simulate API call
    const fetchBids = async () => {
      try {
        setLoading(true);
        // In real implementation:
        // const response = await biddingAPI.getBids(filters);
        // setBids(response.data);
        
        setTimeout(() => {
          setBids(mockBids);
          setLoading(false);
        }, 1200);
      } catch (error) {
        console.error('Error fetching bids:', error);
        setLoading(false);
      }
    };

    fetchBids();
  }, [filters]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const handleBidSelection = (bidId, checked) => {
    const newSelected = new Set(selectedBids);
    if (checked) {
      newSelected.add(bidId);
    } else {
      newSelected.delete(bidId);
    }
    setSelectedBids(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBids(new Set(filteredAndSortedBids.map(bid => bid.id)));
    } else {
      setSelectedBids(new Set());
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', class: 'status-draft', icon: '📝' },
      submitted: { label: 'Submitted', class: 'status-submitted', icon: '📤' },
      under_review: { label: 'Under Review', class: 'status-under-review', icon: '🔍' },
      approved: { label: 'Approved', class: 'status-approved', icon: '✅' },
      rejected: { label: 'Rejected', class: 'status-rejected', icon: '❌' },
      awarded: { label: 'Awarded', class: 'status-awarded', icon: '🏆' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled', icon: '🚫' }
    };

    const config = statusConfig[status] || { label: status, class: 'status-default', icon: '⚪' };
    
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { label: 'High', class: 'priority-high' },
      medium: { label: 'Medium', class: 'priority-medium' },
      low: { label: 'Low', class: 'priority-low' }
    };

    const config = priorityConfig[priority] || { label: priority, class: 'priority-default' };
    
    return <span className={`priority-badge ${config.class}`}>{config.label}</span>;
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and sort bids
  const filteredAndSortedBids = useMemo(() => {
    let filtered = bids.filter(bid => {
      const matchesSearch = 
        bid.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.rfqTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || bid.status === filters.status;
      const matchesRfq = filters.rfq === 'all' || bid.rfqNumber === filters.rfq;
      const matchesSupplier = filters.supplier === 'all' || bid.supplier.id === filters.supplier;

      return matchesSearch && matchesStatus && matchesRfq && matchesSupplier;
    });

    // Sort bids
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'supplier') {
        aValue = a.supplier.name;
        bValue = b.supplier.name;
      } else if (sortConfig.key === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [bids, searchTerm, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBids.length / itemsPerPage);
  const paginatedBids = filteredAndSortedBids.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBidAction = (bidId, action) => {
    switch (action) {
      case 'view':
        console.log('View bid:', bidId);
        // navigate(`/bidding/bids/${bidId}`);
        break;
      case 'evaluate':
        console.log('Evaluate bid:', bidId);
        // navigate(`/bidding/evaluation/${bidId}`);
        break;
      case 'compare':
        console.log('Compare bid:', bidId);
        // openComparisonModal(bidId);
        break;
      case 'download':
        console.log('Download bid documents:', bidId);
        // downloadBidDocuments(bidId);
        break;
      default:
        console.log('Action:', action, 'for bid:', bidId);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedBids.size === 0) return;

    switch (action) {
      case 'export':
        console.log('Export selected bids:', Array.from(selectedBids));
        break;
      case 'compare':
        console.log('Compare selected bids:', Array.from(selectedBids));
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedBids.size} selected bid(s)?`)) {
          setBids(prev => prev.filter(bid => !selectedBids.has(bid.id)));
          setSelectedBids(new Set());
        }
        break;
      default:
        console.log('Bulk action:', action);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="bid-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading bids...</p>
      </div>
    );
  }

  return (
    <div className="bid-list">
      {/* Header */}
      <div className="bid-list-header">
        <div className="header-content">
          <h1>Bid Management</h1>
          <p>Manage and evaluate supplier bids for procurement requests</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            + Create New Bid
          </button>
          <button className="btn-secondary">
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bid-list-controls">
        <div className="controls-left">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search bids, RFQs, suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              📋
            </button>
            <button
              className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              🗂️
            </button>
          </div>
        </div>

        <div className="controls-right">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="page-size-select"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="bid-list-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>RFQ:</label>
          <select
            value={filters.rfq}
            onChange={(e) => handleFilterChange('rfq', e.target.value)}
          >
            {rfqOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Supplier:</label>
          <select
            value={filters.supplier}
            onChange={(e) => handleFilterChange('supplier', e.target.value)}
          >
            {supplierOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button 
            className="btn-clear-filters"
            onClick={() => setFilters({
              status: 'all',
              rfq: 'all',
              supplier: 'all',
              dateRange: 'all'
            })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBids.size > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <strong>{selectedBids.size}</strong> bid(s) selected
          </div>
          <div className="bulk-buttons">
            <button 
              className="btn-bulk export"
              onClick={() => handleBulkAction('export')}
            >
              📥 Export Selected
            </button>
            <button 
              className="btn-bulk compare"
              onClick={() => handleBulkAction('compare')}
            >
              ⚖️ Compare Selected
            </button>
            <button 
              className="btn-bulk delete"
              onClick={() => handleBulkAction('delete')}
            >
              🗑️ Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Bids List */}
      <div className="bids-container">
        {viewMode === 'table' ? (
          <TableView 
            bids={paginatedBids}
            selectedBids={selectedBids}
            onBidSelect={handleBidSelection}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            onBidAction={handleBidAction}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getSortIcon={getSortIcon}
          />
        ) : (
          <CardView 
            bids={paginatedBids}
            selectedBids={selectedBids}
            onBidSelect={handleBidSelection}
            onBidAction={handleBidAction}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
          />
        )}

        {filteredAndSortedBids.length === 0 && (
          <div className="no-bids">
            <div className="no-bids-icon">📭</div>
            <h3>No Bids Found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedBids.length > 0 && (
        <div className="bid-list-pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedBids.length)} of {filteredAndSortedBids.length} bids
          </div>
          
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              ««
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              «
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              »
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Table View Component
const TableView = ({ 
  bids, 
  selectedBids, 
  onBidSelect, 
  onSelectAll, 
  onSort, 
  onBidAction,
  getStatusBadge,
  getPriorityBadge,
  formatCurrency,
  formatDate,
  getSortIcon 
}) => (
  <div className="table-view">
    <table className="bids-table">
      <thead>
        <tr>
          <th className="col-checkbox">
            <input
              type="checkbox"
              checked={bids.length > 0 && bids.every(bid => selectedBids.has(bid.id))}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
          </th>
          <th className="col-id" onClick={() => onSort('id')}>
            Bid ID {getSortIcon('id')}
          </th>
          <th className="col-rfq" onClick={() => onSort('rfqNumber')}>
            RFQ {getSortIcon('rfqNumber')}
          </th>
          <th className="col-supplier" onClick={() => onSort('supplier')}>
            Supplier {getSortIcon('supplier')}
          </th>
          <th className="col-amount" onClick={() => onSort('amount')}>
            Amount {getSortIcon('amount')}
          </th>
          <th className="col-status" onClick={() => onSort('status')}>
            Status {getSortIcon('status')}
          </th>
          <th className="col-date" onClick={() => onSort('submissionDate')}>
            Submitted {getSortIcon('submissionDate')}
          </th>
          <th className="col-score" onClick={() => onSort('evaluationScore')}>
            Score {getSortIcon('evaluationScore')}
          </th>
          <th className="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {bids.map(bid => (
          <tr key={bid.id} className={selectedBids.has(bid.id) ? 'selected' : ''}>
            <td className="col-checkbox">
              <input
                type="checkbox"
                checked={selectedBids.has(bid.id)}
                onChange={(e) => onBidSelect(bid.id, e.target.checked)}
              />
            </td>
            <td className="col-id">
              <div className="bid-id">{bid.id}</div>
              {getPriorityBadge(bid.priority)}
            </td>
            <td className="col-rfq">
              <div className="rfq-number">{bid.rfqNumber}</div>
              <div className="rfq-title">{bid.rfqTitle}</div>
            </td>
            <td className="col-supplier">
              <div className="supplier-name">{bid.supplier.name}</div>
              <div className="supplier-rating">
                {'★'.repeat(Math.floor(bid.supplier.rating))}
                {'☆'.repeat(5 - Math.floor(bid.supplier.rating))}
                <span className="rating-value">({bid.supplier.rating})</span>
              </div>
            </td>
            <td className="col-amount">
              <div className="amount">{formatCurrency(bid.amount, bid.currency)}</div>
              <div className="items-count">{bid.items.length} items</div>
            </td>
            <td className="col-status">
              {getStatusBadge(bid.status)}
            </td>
            <td className="col-date">
              {formatDate(bid.submissionDate)}
            </td>
            <td className="col-score">
              {bid.evaluationScore ? (
                <div className="score-badge">
                  {bid.evaluationScore}/100
                </div>
              ) : (
                <span className="no-score">-</span>
              )}
            </td>
            <td className="col-actions">
              <div className="action-buttons">
                <button 
                  className="btn-action view"
                  onClick={() => onBidAction(bid.id, 'view')}
                  title="View Bid Details"
                >
                  👁️
                </button>
                <button 
                  className="btn-action evaluate"
                  onClick={() => onBidAction(bid.id, 'evaluate')}
                  title="Evaluate Bid"
                >
                  📊
                </button>
                <button 
                  className="btn-action compare"
                  onClick={() => onBidAction(bid.id, 'compare')}
                  title="Compare with Others"
                >
                  ⚖️
                </button>
                <button 
                  className="btn-action download"
                  onClick={() => onBidAction(bid.id, 'download')}
                  title="Download Documents"
                >
                  📥
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Card View Component
const CardView = ({ 
  bids, 
  selectedBids, 
  onBidSelect, 
  onBidAction,
  getStatusBadge,
  getPriorityBadge,
  formatCurrency,
  formatDate,
  formatDateTime 
}) => (
  <div className="card-view">
    <div className="bids-grid">
      {bids.map(bid => (
        <div key={bid.id} className={`bid-card ${selectedBids.has(bid.id) ? 'selected' : ''}`}>
          <div className="card-header">
            <input
              type="checkbox"
              checked={selectedBids.has(bid.id)}
              onChange={(e) => onBidSelect(bid.id, e.target.checked)}
              className="card-checkbox"
            />
            <div className="card-title">
              <h4>{bid.id}</h4>
              {getPriorityBadge(bid.priority)}
            </div>
            {getStatusBadge(bid.status)}
          </div>

          <div className="card-content">
            <div className="card-field">
              <label>RFQ:</label>
              <span className="rfq-info">
                <strong>{bid.rfqNumber}</strong>
                <br />
                {bid.rfqTitle}
              </span>
            </div>

            <div className="card-field">
              <label>Supplier:</label>
              <span className="supplier-info">
                <strong>{bid.supplier.name}</strong>
                <br />
                <span className="rating">
                  {'★'.repeat(Math.floor(bid.supplier.rating))}
                  {'☆'.repeat(5 - Math.floor(bid.supplier.rating))}
                  ({bid.supplier.rating})
                </span>
              </span>
            </div>

            <div className="card-field">
              <label>Amount:</label>
              <span className="amount-info">
                <strong>{formatCurrency(bid.amount, bid.currency)}</strong>
                <br />
                <span className="items-info">{bid.items.length} items • {bid.documents} documents</span>
              </span>
            </div>

            <div className="card-field">
              <label>Submitted:</label>
              <span>{formatDateTime(bid.submissionDate)}</span>
            </div>

            <div className="card-field">
              <label>Valid Until:</label>
              <span>{formatDate(bid.validityDate)}</span>
            </div>

            {bid.evaluationScore && (
              <div className="card-field">
                <label>Evaluation Score:</label>
                <div className="score-display">
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${bid.evaluationScore}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{bid.evaluationScore}/100</span>
                </div>
              </div>
            )}

            {bid.notes && (
              <div className="card-field notes">
                <label>Notes:</label>
                <p className="notes-text">{bid.notes}</p>
              </div>
            )}
          </div>

          <div className="card-actions">
            <button 
              className="btn-card-action primary"
              onClick={() => onBidAction(bid.id, 'view')}
            >
              View Details
            </button>
            <button 
              className="btn-card-action secondary"
              onClick={() => onBidAction(bid.id, 'evaluate')}
            >
              Evaluate
            </button>
            <button 
              className="btn-card-action icon"
              onClick={() => onBidAction(bid.id, 'compare')}
              title="Compare"
            >
              ⚖️
            </button>
            <button 
              className="btn-card-action icon"
              onClick={() => onBidAction(bid.id, 'download')}
              title="Download"
            >
              📥
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BidList;