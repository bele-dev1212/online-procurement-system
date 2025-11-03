// src/pages/Inventory/InventoryManagement/InventoryManagement.jsx
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInventory } from '../../../hooks/useInventory';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import { CurrencyFormatters, DataFormatters, NumberFormatters } from '../../../utils/helpers/formatters';
import { INVENTORY_STATUS } from '../../../utils/enums/inventoryStatus';
import './InventoryManagement.css';

const { formatCurrency } = CurrencyFormatters;
const { formatDate } = DataFormatters;
const { formatNumber } = NumberFormatters;
/*const INVENTORY_STATUS = {
  active: 'Active',
  inactive: 'Inactive', 
  discontinued: 'Discontinued',
  coming_soon: 'Coming Soon'

}; 
*/
const InventoryManagement = () => {
  const navigate = useNavigate();
  const { 
    inventory, 
    loading, 
    error,
    updateStock,
    deleteProduct,
    refetch 
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ type: 'add', quantity: 0, reason: '' });
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [viewMode, setViewMode] = useState('table');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [outOfStockThreshold, setOutOfStockThreshold] = useState(0);

  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(product => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

      const matchesStock = stockFilter === 'all' || 
        (stockFilter === 'out_of_stock' && product.stockQuantity <= outOfStockThreshold) ||
        (stockFilter === 'low_stock' && product.stockQuantity > outOfStockThreshold && product.stockQuantity <= lowStockThreshold) ||
        (stockFilter === 'in_stock' && product.stockQuantity > lowStockThreshold);

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });

    // Sort inventory
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'stockQuantity' || sortBy === 'price' || sortBy === 'cost') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortBy === 'lastRestocked') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [inventory, searchTerm, categoryFilter, statusFilter, stockFilter, sortBy, sortOrder, lowStockThreshold, outOfStockThreshold]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    inventory.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  }, [inventory]);

  // Pagination
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  // Inventory statistics
  const inventoryStats = useMemo(() => {
    const totalValue = inventory.reduce((sum, product) => sum + (product.stockQuantity * product.cost), 0);
    const lowStockCount = inventory.filter(product => 
      product.stockQuantity > outOfStockThreshold && product.stockQuantity <= lowStockThreshold
    ).length;
    const outOfStockCount = inventory.filter(product => 
      product.stockQuantity <= outOfStockThreshold
    ).length;
    const totalSKUs = inventory.length;

    return {
      totalValue,
      lowStockCount,
      outOfStockCount,
      totalSKUs,
      inStockCount: totalSKUs - outOfStockCount - lowStockCount
    };
  }, [inventory, lowStockThreshold, outOfStockThreshold]);

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

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedInventory.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedInventory.map(product => product.id));
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
      refetch();
    }
  };

  const handleStockUpdateClick = (product) => {
    setProductToUpdate(product);
    setStockUpdate({ type: 'add', quantity: 0, reason: '' });
    setShowStockModal(true);
  };

  const handleStockUpdate = async () => {
    if (!productToUpdate || !stockUpdate.quantity) return;

    try {
      const newQuantity = stockUpdate.type === 'add' 
        ? productToUpdate.stockQuantity + parseInt(stockUpdate.quantity)
        : productToUpdate.stockQuantity - parseInt(stockUpdate.quantity);

      await updateStock(productToUpdate.id, newQuantity, stockUpdate.reason);
      setShowStockModal(false);
      setProductToUpdate(null);
      setStockUpdate({ type: 'add', quantity: 0, reason: '' });
      refetch();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) return;

    switch (bulkAction) {
      case 'export':
        alert(`Exporting ${selectedProducts.length} products`);
        break;
      case 'disable':
        alert(`Disabling ${selectedProducts.length} products`);
        break;
      case 'delete':
        alert(`Deleting ${selectedProducts.length} products`);
        break;
      default:
        break;
    }

    setSelectedProducts([]);
    setBulkAction('');
  };

  const getStockStatus = (quantity) => {
    if (quantity <= outOfStockThreshold) return 'out_of_stock';
    if (quantity <= lowStockThreshold) return 'low_stock';
    return 'in_stock';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', label: 'Active', icon: '🟢' },
      inactive: { class: 'status-inactive', label: 'Inactive', icon: '⚫' },
      discontinued: { class: 'status-discontinued', label: 'Discontinued', icon: '🔴' },
      coming_soon: { class: 'status-coming-soon', label: 'Coming Soon', icon: '🟡' }
    };

    const config = statusConfig[status] || { class: 'status-default', label: status, icon: '❓' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getStockBadge = (quantity) => {
    const status = getStockStatus(quantity);
    const stockConfig = {
      out_of_stock: { class: 'stock-out', label: 'Out of Stock' },
      low_stock: { class: 'stock-low', label: 'Low Stock' },
      in_stock: { class: 'stock-in', label: 'In Stock' }
    };

    const config = stockConfig[status];
    return <span className={`stock-badge ${config.class}`}>{config.label}</span>;
  };

  const getStockLevelColor = (quantity) => {
    const status = getStockStatus(quantity);
    const colors = {
      out_of_stock: '#ef4444',
      low_stock: '#f59e0b',
      in_stock: '#10b981'
    };
    return colors[status];
  };

  const calculateStockValue = (product) => {
    return product.stockQuantity * product.cost;
  };

  const calculateProfitMargin = (product) => {
    if (!product.price || !product.cost) return 0;
    return ((product.price - product.cost) / product.price) * 100;
  };

  const renderProductCard = (product) => {
    const profitMargin = calculateProfitMargin(product);
    const stockValue = calculateStockValue(product);

    return (
      <div key={product.id} className="product-card">
        <div className="card-header">
          <div className="product-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="image-placeholder">
                {product.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="product-basic">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-sku">SKU: {product.sku}</p>
            <div className="product-meta">
              {getStatusBadge(product.status)}
              {getStockBadge(product.stockQuantity)}
            </div>
          </div>
          <div className="card-actions">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleSelectProduct(product.id)}
              className="checkbox"
            />
          </div>
        </div>

        <div className="card-content">
          <div className="product-details">
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{product.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Supplier:</span>
              <span className="detail-value">{product.supplier || 'N/A'}</span>
            </div>
            {product.description && (
              <div className="detail-item full-width">
                <span className="detail-label">Description:</span>
                <span className="detail-value description">{product.description}</span>
              </div>
            )}
          </div>

          <div className="stock-info">
            <div className="stock-level">
              <div className="stock-bar">
                <div 
                  className="stock-fill"
                  style={{ 
                    width: `${Math.min((product.stockQuantity / (lowStockThreshold * 3)) * 100, 100)}%`,
                    backgroundColor: getStockLevelColor(product.stockQuantity)
                  }}
                ></div>
              </div>
              <div className="stock-quantity">
                <span className="quantity">{formatNumber(product.stockQuantity)}</span>
                <span className="unit">{product.unit || 'units'}</span>
              </div>
            </div>
          </div>

          <div className="pricing-info">
            <div className="price-item">
              <span className="price-label">Cost:</span>
              <span className="price-value cost">{formatCurrency(product.cost)}</span>
            </div>
            <div className="price-item">
              <span className="price-label">Price:</span>
              <span className="price-value price">{formatCurrency(product.price)}</span>
            </div>
            <div className="price-item">
              <span className="price-label">Margin:</span>
              <span className={`price-value margin ${profitMargin >= 0 ? 'positive' : 'negative'}`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="financial-summary">
            <div className="financial-item">
              <span className="financial-label">Stock Value:</span>
              <span className="financial-value">{formatCurrency(stockValue)}</span>
            </div>
          </div>

          {product.lastRestocked && (
            <div className="restock-info">
              <span className="restock-label">Last Restocked:</span>
              <span className="restock-date">{formatDate(product.lastRestocked)}</span>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="footer-actions">
            <button 
              onClick={() => handleStockUpdateClick(product)}
              className="btn-action stock-update"
            >
              📦 Update Stock
            </button>
            <Link 
              to={`/inventory/products/${product.id}/edit`}
              className="btn-action edit"
            >
              ✏️ Edit
            </Link>
            <div className="action-dropdown">
              <button className="btn-action more">⋯</button>
              <div className="dropdown-menu">
                <Link 
                  to={`/inventory/products/${product.id}`}
                  className="dropdown-item"
                >
                  👁️ View Details
                </Link>
                <button 
                  onClick={() => navigate('/procurement/create-purchase-order', { 
                    state: { productId: product.id } 
                  })}
                  className="dropdown-item"
                >
                  📝 Create PO
                </button>
                <button 
                  onClick={() => handleDeleteClick(product)}
                  className="dropdown-item delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryTable = () => {
    return (
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === paginatedInventory.length && paginatedInventory.length > 0}
                  onChange={handleSelectAll}
                  className="checkbox"
                />
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Product {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('sku')} className="sortable">
                SKU {sortBy === 'sku' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Category</th>
              <th onClick={() => handleSort('stockQuantity')} className="sortable">
                Stock {sortBy === 'stockQuantity' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th onClick={() => handleSort('cost')} className="sortable">
                Cost {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('price')} className="sortable">
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Stock Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map(product => {
              const stockValue = calculateStockValue(product);
              const profitMargin = calculateProfitMargin(product);

              return (
                <tr key={product.id} className={selectedProducts.includes(product.id) ? 'selected' : ''}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="checkbox"
                    />
                  </td>
                  <td className="product-info">
                    <div className="product-main">
                      <div className="product-image small">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="image-placeholder small">
                            {product.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="product-name">{product.name}</div>
                        {product.supplier && (
                          <div className="product-supplier">{product.supplier}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="sku">
                    <code>{product.sku}</code>
                  </td>
                  <td className="category">
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td className="stock">
                    <div className="stock-display">
                      <div className="stock-bar small">
                        <div 
                          className="stock-fill"
                          style={{ 
                            width: `${Math.min((product.stockQuantity / (lowStockThreshold * 3)) * 100, 100)}%`,
                            backgroundColor: getStockLevelColor(product.stockQuantity)
                          }}
                        ></div>
                      </div>
                      <div className="stock-details">
                        <span className="stock-quantity">{formatNumber(product.stockQuantity)}</span>
                        {getStockBadge(product.stockQuantity)}
                      </div>
                    </div>
                  </td>
                  <td className="status">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="cost">
                    {formatCurrency(product.cost)}
                  </td>
                  <td className="price">
                    {formatCurrency(product.price)}
                    {profitMargin > 0 && (
                      <div className="margin-indicator">
                        {profitMargin.toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="stock-value">
                    {formatCurrency(stockValue)}
                  </td>
                  <td className="actions">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleStockUpdateClick(product)}
                        className="btn-action stock"
                        title="Update Stock"
                      >
                        📦
                      </button>
                      <Link 
                        to={`/inventory/products/${product.id}/edit`}
                        className="btn-action edit"
                        title="Edit"
                      >
                        ✏️
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(product)}
                        className="btn-action delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="inventory-management-loading">
        <LoadingSpinner size="large" />
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-management-error">
        <div className="error-content">
          <h3>Error Loading Inventory</h3>
          <p>{error}</p>
          <button onClick={refetch} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-management">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-content">
          <h1>Inventory Management</h1>
          <p>Manage and track your product inventory</p>
        </div>
        <div className="header-actions">
          <Link to="/inventory/products/add" className="btn-primary">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="inventory-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{formatNumber(inventoryStats.totalSKUs)}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{formatCurrency(inventoryStats.totalValue)}</h3>
              <p>Total Inventory Value</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{inventoryStats.lowStockCount}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{inventoryStats.outOfStockCount}</h3>
              <p>Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Stock Threshold Settings */}
        <div className="threshold-settings">
          <div className="setting-group">
            <label>Low Stock Threshold:</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
              className="threshold-input"
              min="1"
            />
          </div>
          <div className="setting-group">
            <label>Out of Stock Threshold:</label>
            <input
              type="number"
              value={outOfStockThreshold}
              onChange={(e) => setOutOfStockThreshold(parseInt(e.target.value) || 0)}
              className="threshold-input"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="inventory-controls">
        <div className="controls-left">
          <SearchBar
            placeholder="Search products by name, SKU, description..."
            onSearch={handleSearch}
            className="search-bar"
          />
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {Object.entries(INVENTORY_STATUS).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <select 
            value={stockFilter} 
            onChange={(e) => setStockFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        <div className="controls-right">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="sku">Sort by SKU</option>
            <option value="stockQuantity">Sort by Stock</option>
            <option value="cost">Sort by Cost</option>
            <option value="price">Sort by Price</option>
            <option value="lastRestocked">Sort by Last Restocked</option>
          </select>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              ☰
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ▦
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-actions-info">
            <span>{selectedProducts.length} products selected</span>
          </div>
          <div className="bulk-actions-controls">
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Bulk Actions</option>
              <option value="export">Export Selected</option>
              <option value="disable">Disable Selected</option>
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
              onClick={() => setSelectedProducts([])}
              className="btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Inventory Content */}
      <div className="inventory-content">
        {filteredInventory.length === 0 ? (
          <div className="no-products">
            <div className="no-products-content">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <Link to="/inventory/products/add" className="btn-primary">
                Add Your First Product
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="inventory-grid">
            {paginatedInventory.map(renderProductCard)}
          </div>
        ) : (
          renderInventoryTable()
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

      {/* Stock Update Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title="Update Stock Level"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowStockModal(false),
            variant: 'secondary'
          },
          {
            label: 'Update Stock',
            onClick: handleStockUpdate,
            variant: 'primary',
            disabled: !stockUpdate.quantity
          }
        ]}
      >
        {productToUpdate && (
          <div className="stock-update-modal">
            <div className="product-info">
              <h4>{productToUpdate.name}</h4>
              <p>SKU: {productToUpdate.sku}</p>
              <p>Current Stock: {formatNumber(productToUpdate.stockQuantity)} {productToUpdate.unit || 'units'}</p>
            </div>

            <div className="update-form">
              <div className="form-group">
                <label>Update Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="add"
                      checked={stockUpdate.type === 'add'}
                      onChange={(e) => setStockUpdate(prev => ({ ...prev, type: e.target.value }))}
                    />
                    <span>Add Stock</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="remove"
                      checked={stockUpdate.type === 'remove'}
                      onChange={(e) => setStockUpdate(prev => ({ ...prev, type: e.target.value }))}
                    />
                    <span>Remove Stock</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="form-input"
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-group">
                <label>Reason (Optional)</label>
                <input
                  type="text"
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate(prev => ({ ...prev, reason: e.target.value }))}
                  className="form-input"
                  placeholder="e.g., New shipment, Customer return"
                />
              </div>

              {stockUpdate.quantity > 0 && (
                <div className="stock-preview">
                  <p>
                    New stock level will be:{' '}
                    <strong>
                      {stockUpdate.type === 'add' 
                        ? productToUpdate.stockQuantity + stockUpdate.quantity
                        : productToUpdate.stockQuantity - stockUpdate.quantity
                      }
                    </strong>
                  </p>
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
        title="Delete Product"
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
          <p>Are you sure you want to delete product <strong>{productToDelete?.name}</strong>?</p>
          <p className="warning-text">
            This action cannot be undone. All inventory history and associated data will be permanently removed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
