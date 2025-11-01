import React, { useState, useEffect, useMemo } from 'react';
import './PurchaseOrderList.css';

const PurchaseOrderList = ({
  purchaseOrders = [],
  onOrderClick,
  onEditOrder,
  onDeleteOrder,
  onApproveOrder,
  onExportOrders,
  onCreateOrder,
  loading = false,
  showFilters = true,
  showActions = true,
  pageSize = 10,
  className = ''}) => {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    supplier: 'all',
    dateRange: 'all',
    search: '',
    priority: 'all'
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid' | 'card'

  // Status options with colors and icons
  const statusOptions = {
    draft: { label: 'Draft', color: 'gray', icon: '📝' },
    pending_approval: { label: 'Pending Approval', color: 'orange', icon: '⏳' },
    approved: { label: 'Approved', color: 'blue', icon: '✅' },
    rejected: { label: 'Rejected', color: 'red', icon: '❌' },
    ordered: { label: 'Ordered', color: 'purple', icon: '📦' },
    shipped: { label: 'Shipped', color: 'teal', icon: '🚚' },
    delivered: { label: 'Delivered', color: 'green', icon: '📬' },
    cancelled: { label: 'Cancelled', color: 'gray', icon: '🚫' }
  };

  // Priority options
  const priorityOptions = {
    low: { label: 'Low', color: 'gray' },
    medium: { label: 'Medium', color: 'blue' },
    high: { label: 'High', color: 'orange' },
    urgent: { label: 'Urgent', color: 'red' }
  };

  // Mock data if none provided
  const defaultOrders = useMemo(() => [
    {
      id: 'PO-2024-001',
      poNumber: 'PO-2024-001',
      supplier: {
        id: 'S001',
        name: 'Tech Supplies Inc.',
        contact: 'John Smith',
        email: 'john@techsupplies.com'
      },
      items: [
        { name: 'Laptop Dell XPS 13', quantity: 5, unitPrice: 1200, total: 6000 },
        { name: 'Monitor 24" LED', quantity: 3, unitPrice: 300, total: 900 }
      ],
      totalAmount: 6900,
      status: 'approved',
      priority: 'high',
      createdAt: new Date('2024-01-15'),
      expectedDelivery: new Date('2024-02-01'),
      createdBy: 'Sarah Johnson',
      department: 'IT',
      currency: 'USD',
      notes: 'Priority order for new hires',
      attachments: 2,
      approvalHistory: [
        { user: 'Mike Chen', action: 'approved', timestamp: new Date('2024-01-16') }
      ]
    },
    {
      id: 'PO-2024-002',
      poNumber: 'PO-2024-002',
      supplier: {
        id: 'S002',
        name: 'Office Furniture Co.',
        contact: 'Maria Garcia',
        email: 'maria@officefurniture.com'
      },
      items: [
        { name: 'Ergonomic Chair', quantity: 10, unitPrice: 250, total: 2500 },
        { name: 'Standing Desk', quantity: 5, unitPrice: 400, total: 2000 }
      ],
      totalAmount: 4500,
      status: 'pending_approval',
      priority: 'medium',
      createdAt: new Date('2024-01-18'),
      expectedDelivery: new Date('2024-02-15'),
      createdBy: 'David Wilson',
      department: 'HR',
      currency: 'USD',
      notes: 'For new office setup',
      attachments: 1,
      approvalHistory: []
    },
    {
      id: 'PO-2024-003',
      poNumber: 'PO-2024-003',
      supplier: {
        id: 'S003',
        name: 'Software Solutions Ltd.',
        contact: 'Robert Brown',
        email: 'robert@softwaresolutions.com'
      },
      items: [
        { name: 'Project Management Software', quantity: 1, unitPrice: 5000, total: 5000 },
        { name: 'Annual Maintenance', quantity: 1, unitPrice: 1000, total: 1000 }
      ],
      totalAmount: 6000,
      status: 'draft',
      priority: 'low',
      createdAt: new Date('2024-01-20'),
      expectedDelivery: new Date('2024-03-01'),
      createdBy: 'Lisa Taylor',
      department: 'Operations',
      currency: 'USD',
      notes: 'Budget approval pending',
      attachments: 0,
      approvalHistory: []
    },
    {
      id: 'PO-2024-004',
      poNumber: 'PO-2024-004',
      supplier: {
        id: 'S004',
        name: 'Industrial Supplies Corp.',
        contact: 'James Wilson',
        email: 'james@industrialsupplies.com'
      },
      items: [
        { name: 'Safety Equipment Set', quantity: 20, unitPrice: 150, total: 3000 },
        { name: 'Protective Gear', quantity: 15, unitPrice: 80, total: 1200 }
      ],
      totalAmount: 4200,
      status: 'ordered',
      priority: 'medium',
      createdAt: new Date('2024-01-10'),
      expectedDelivery: new Date('2024-01-25'),
      createdBy: 'Mike Chen',
      department: 'Operations',
      currency: 'USD',
      notes: 'Standard safety stock',
      attachments: 3,
      approvalHistory: [
        { user: 'Sarah Johnson', action: 'approved', timestamp: new Date('2024-01-11') }
      ]
    },
    {
      id: 'PO-2024-005',
      poNumber: 'PO-2024-005',
      supplier: {
        id: 'S005',
        name: 'Marketing Materials Inc.',
        contact: 'Emily Davis',
        email: 'emily@marketingmaterials.com'
      },
      items: [
        { name: 'Brochures', quantity: 5000, unitPrice: 2, total: 10000 },
        { name: 'Business Cards', quantity: 1000, unitPrice: 0.5, total: 500 }
      ],
      totalAmount: 10500,
      status: 'shipped',
      priority: 'high',
      createdAt: new Date('2024-01-05'),
      expectedDelivery: new Date('2024-01-20'),
      createdBy: 'Anna Roberts',
      department: 'Marketing',
      currency: 'USD',
      notes: 'For Q1 campaign',
      attachments: 2,
      approvalHistory: [
        { user: 'David Wilson', action: 'approved', timestamp: new Date('2024-01-06') }
      ]
    }
  ], []);

  const ordersToUse = purchaseOrders.length > 0 ? purchaseOrders : defaultOrders;

  // Extract unique suppliers for filter
  const suppliers = useMemo(() => {
    const uniqueSuppliers = [...new Set(ordersToUse.map(order => order.supplier.name))];
    return uniqueSuppliers.map(name => ({
      value: name,
      label: name
    }));
  }, [ordersToUse]);

  // Filter and sort orders
  useEffect(() => {
    let result = [...ordersToUse];

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(order => order.status === filters.status);
    }

    if (filters.supplier !== 'all') {
      result = result.filter(order => order.supplier.name === filters.supplier);
    }

    if (filters.priority !== 'all') {
      result = result.filter(order => order.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(order => 
        order.poNumber.toLowerCase().includes(searchLower) ||
        order.supplier.name.toLowerCase().includes(searchLower) ||
        order.createdBy.toLowerCase().includes(searchLower) ||
        order.department.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }

      result = result.filter(order => new Date(order.createdAt) >= startDate);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'supplier') {
          aValue = a.supplier.name;
          bValue = b.supplier.name;
        } else if (sortConfig.key === 'createdBy') {
          aValue = a.createdBy;
          bValue = b.createdBy;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [ordersToUse, filters, sortConfig]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSelectOrder = (orderId, checked) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrders(paginatedOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    switch (bulkAction) {
      case 'approve':
        onApproveOrder?.(selectedOrders);
        break;
      case 'delete':
        onDeleteOrder?.(selectedOrders);
        break;
      case 'export':
        onExportOrders?.(selectedOrders);
        break;
      default:
        break;
    }

    setSelectedOrders([]);
    setBulkAction('');
  };

  

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions[status];
    return (
      <span className={`status-badge status-${statusConfig.color}`}>
        {statusConfig.icon} {statusConfig.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = priorityOptions[priority];
    return (
      <span className={`priority-badge priority-${priorityConfig.color}`}>
        {priorityConfig.label}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDelivery = (expectedDelivery) => {
    const today = new Date();
    const deliveryDate = new Date(expectedDelivery);
    const diffTime = deliveryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'red' };
    if (diffDays === 0) return { text: 'Today', color: 'orange' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'orange' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'blue' };
    return { text: `${diffDays} days`, color: 'green' };
  };

  // Table View
  const renderTableView = () => (
    <div className="orders-table-container">
      <table className="orders-table">
        <thead>
          <tr>
            {showActions && (
              <th className="select-column">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            <th 
              className="sortable"
              onClick={() => handleSort('poNumber')}
            >
              PO Number {sortConfig.key === 'poNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Supplier</th>
            <th 
              className="sortable"
              onClick={() => handleSort('totalAmount')}
            >
              Amount {sortConfig.key === 'totalAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Status</th>
            <th>Priority</th>
            <th 
              className="sortable"
              onClick={() => handleSort('createdAt')}
            >
              Created {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Expected Delivery</th>
            <th 
              className="sortable"
              onClick={() => handleSort('createdBy')}
            >
              Created By {sortConfig.key === 'createdBy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Department</th>
            {showActions && <th className="actions-column">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => (
            <tr 
              key={order.id}
              className={`order-row order-status-${order.status} ${
                selectedOrders.includes(order.id) ? 'selected' : ''
              }`}
              onClick={() => onOrderClick?.(order)}
            >
              {showActions && (
                <td className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              <td className="po-number">
                <strong>{order.poNumber}</strong>
              </td>
              <td className="supplier">
                <div className="supplier-info">
                  <div className="supplier-name">{order.supplier.name}</div>
                  <div className="supplier-contact">{order.supplier.contact}</div>
                </div>
              </td>
              <td className="amount">
                {formatCurrency(order.totalAmount, order.currency)}
              </td>
              <td className="status">
                {getStatusBadge(order.status)}
              </td>
              <td className="priority">
                {getPriorityBadge(order.priority)}
              </td>
              <td className="created-date">
                {formatDate(order.createdAt)}
              </td>
              <td className="delivery-date">
                <div className="delivery-info">
                  <div>{formatDate(order.expectedDelivery)}</div>
                  <div className={`delivery-days ${getDaysUntilDelivery(order.expectedDelivery).color}`}>
                    {getDaysUntilDelivery(order.expectedDelivery).text}
                  </div>
                </div>
              </td>
              <td className="created-by">
                {order.createdBy}
              </td>
              <td className="department">
                {order.department}
              </td>
              {showActions && (
                <td className="actions" onClick={(e) => e.stopPropagation()}>
                  <div className="action-buttons">
                    {order.status === 'draft' && (
                      <button
                        className="action-btn edit-btn"
                        onClick={() => onEditOrder?.(order)}
                        title="Edit Order"
                      >
                        ✏️
                      </button>
                    )}
                    {order.status === 'pending_approval' && (
                      <button
                        className="action-btn approve-btn"
                        onClick={() => onApproveOrder?.([order.id])}
                        title="Approve Order"
                      >
                        ✅
                      </button>
                    )}
                    {(order.status === 'draft' || order.status === 'pending_approval') && (
                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDeleteOrder?.([order.id])}
                        title="Delete Order"
                      >
                        🗑️
                      </button>
                    )}
                    <button
                      className="action-btn view-btn"
                      onClick={() => onOrderClick?.(order)}
                      title="View Details"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Card View
  const renderCardView = () => (
    <div className="orders-grid">
      {paginatedOrders.map((order) => (
        <div
          key={order.id}
          className={`order-card order-status-${order.status} ${
            selectedOrders.includes(order.id) ? 'selected' : ''
          }`}
          onClick={() => onOrderClick?.(order)}
        >
          {showActions && (
            <div className="card-select">
              <input
                type="checkbox"
                checked={selectedOrders.includes(order.id)}
                onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="card-header">
            <div className="card-title">
              <h3>{order.poNumber}</h3>
              {getStatusBadge(order.status)}
            </div>
            {getPriorityBadge(order.priority)}
          </div>

          <div className="card-supplier">
            <div className="supplier-name">{order.supplier.name}</div>
            <div className="supplier-contact">{order.supplier.contact}</div>
          </div>

          <div className="card-details">
            <div className="detail-item">
              <span className="label">Amount:</span>
              <span className="value">{formatCurrency(order.totalAmount, order.currency)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Created:</span>
              <span className="value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Delivery:</span>
              <span className="value">
                {formatDate(order.expectedDelivery)}
                <span className={`delivery-days ${getDaysUntilDelivery(order.expectedDelivery).color}`}>
                  ({getDaysUntilDelivery(order.expectedDelivery).text})
                </span>
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Department:</span>
              <span className="value">{order.department}</span>
            </div>
          </div>

          {showActions && (
            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
              <div className="action-buttons">
                {order.status === 'draft' && (
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEditOrder?.(order)}
                    title="Edit Order"
                  >
                    ✏️ Edit
                  </button>
                )}
                {order.status === 'pending_approval' && (
                  <button
                    className="action-btn approve-btn"
                    onClick={() => onApproveOrder?.([order.id])}
                    title="Approve Order"
                  >
                    ✅ Approve
                  </button>
                )}
                <button
                  className="action-btn view-btn"
                  onClick={() => onOrderClick?.(order)}
                  title="View Details"
                >
                  👁️ View
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`purchase-order-list ${className}`}>
      {/* Header */}
      <div className="list-header">
        <div className="header-left">
          <h2 className="list-title">Purchase Orders</h2>
          <div className="list-stats">
            <span className="stat total">{filteredOrders.length} orders</span>
            <span className="stat pending">
              {filteredOrders.filter(o => o.status === 'pending_approval').length} pending
            </span>
            <span className="stat amount">
              {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0))} total
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              📊
            </button>
            <button
              className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              🃏
            </button>
          </div>
          
          <button
            className="create-btn"
            onClick={() => onCreateOrder?.()}
            disabled={loading}
          >
            📄 Create PO
          </button>
          
          <button
            className="export-btn"
            onClick={() => onExportOrders?.(selectedOrders.length > 0 ? selectedOrders : filteredOrders)}
            disabled={loading || filteredOrders.length === 0}
          >
            📤 Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="list-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search PO numbers, suppliers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              {Object.entries(statusOptions).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.value} value={supplier.value}>
                  {supplier.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              {Object.entries(priorityOptions).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
          
          <button
            className="clear-filters"
            onClick={() => setFilters({
              status: 'all',
              supplier: 'all',
              dateRange: 'all',
              search: '',
              priority: 'all'
            })}
          >
            Clear
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {showActions && selectedOrders.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <strong>{selectedOrders.length}</strong> orders selected
          </div>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="bulk-select"
          >
            <option value="">Bulk Actions</option>
            <option value="approve">Approve Selected</option>
            <option value="export">Export Selected</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button
            className="bulk-apply"
            onClick={handleBulkAction}
            disabled={!bulkAction}
          >
            Apply
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="orders-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading purchase orders...</p>
          </div>
        ) : paginatedOrders.length > 0 ? (
          viewMode === 'table' ? renderTableView() : renderCardView()
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No purchase orders found</h3>
            <p>Try adjusting your filters or create a new purchase order.</p>
            <button
              className="create-btn"
              onClick={() => onCreateOrder?.()}
            >
              Create Your First PO
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > pageSize && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;