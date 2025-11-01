import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../../../hooks/useInventory';
import { useNotifications } from '../../../hooks/useNotifications';
import SearchBar from '../../common/SearchBar/SearchBar';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './ProductList.css';

const ProductList = () => {
  const { 
    products, 
    loading, 
    error, 
    deleteProduct, 
    updateProductStatus,
    updateStockLevel,
    exportProducts 
  } = useInventory();
  
  const { addNotification } = useNotifications();
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [stockModal, setStockModal] = useState({ isOpen: false, product: null, newStock: 0 });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter, sortConfig]);

  const filterAndSortProducts = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(product => product.quantity <= product.lowStockThreshold);
          break;
        case 'out':
          filtered = filtered.filter(product => product.quantity === 0);
          break;
        case 'over':
          filtered = filtered.filter(product => product.quantity > product.maxStockLevel);
          break;
        default:
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredProducts(filtered);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteModal.product.id);
      addNotification('Product deleted successfully', 'success');
      setDeleteModal({ isOpen: false, product: null });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to delete product', 'error');
    }
  };

  const handleStockUpdate = async () => {
    try {
      await updateStockLevel(stockModal.product.id, stockModal.newStock);
      addNotification('Stock level updated successfully', 'success');
      setStockModal({ isOpen: false, product: null, newStock: 0 });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update stock level', 'error');
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await updateProductStatus(productId, newStatus);
      addNotification('Product status updated successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update product status', 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      addNotification('Please select products first', 'warning');
      return;
    }

    try {
      for (const productId of selectedProducts) {
        switch (action) {
          case 'activate':
            await updateProductStatus(productId, 'active');
            break;
          case 'deactivate':
            await updateProductStatus(productId, 'inactive');
            break;
          case 'export':
            await exportProducts(selectedProducts);
            break;
          default:
            break;
        }
      }
      addNotification(`Bulk ${action} completed for ${selectedProducts.length} products`, 'success');
      setSelectedProducts([]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to perform bulk action', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-badge--active',
      inactive: 'status-badge--inactive',
      discontinued: 'status-badge--discontinued',
      'out-of-stock': 'status-badge--out-of-stock'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--inactive'}`;
  };

  const getStockStatusClass = (product) => {
    if (product.quantity === 0) return 'stock-status--out';
    if (product.quantity <= product.lowStockThreshold) return 'stock-status--low';
    if (product.quantity > product.maxStockLevel) return 'stock-status--over';
    return 'stock-status--normal';
  };

  const getStockStatusText = (product) => {
    if (product.quantity === 0) return 'Out of Stock';
    if (product.quantity <= product.lowStockThreshold) return 'Low Stock';
    if (product.quantity > product.maxStockLevel) return 'Overstocked';
    return 'In Stock';
  };

  const calculateStockValue = (product) => {
    return product.quantity * product.costPrice;
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.filter(category => category);
  };

  const calculateInventoryStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(p => p.quantity <= p.lowStockThreshold && p.quantity > 0).length;
    const outOfStockProducts = products.filter(p => p.quantity === 0).length;
    const totalStockValue = products.reduce((total, product) => total + calculateStockValue(product), 0);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = calculateInventoryStats();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error loading products: {error}</div>;

  return (
    <div className="product-list">
      {/* Header */}
      <div className="product-list-header">
        <div className="header-left">
          <h1>Inventory Management</h1>
          <p>Manage and track your product inventory</p>
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
          <Link to="/inventory/products/add" className="btn btn--primary">
            <i className="icon-plus"></i>
            Add Product
          </Link>
          <button 
            className="btn btn--outline"
            onClick={() => exportProducts()}
          >
            <i className="icon-download"></i>
            Export
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="inventory-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="icon-package"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="icon-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeProducts}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <i className="icon-alert-triangle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.lowStockProducts}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">
            <i className="icon-x-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.outOfStockProducts}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon value">
            <i className="icon-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.totalStockValue)}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="product-filters">
        <div className="filter-group">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search products by name, SKU, or description..."
          />
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
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Stock:</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            <option value="over">Overstocked</option>
            <option value="normal">Normal</option>
          </select>
        </div>
        <div className="filter-group">
          <button 
            className="btn btn--secondary"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
              setStockFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <i className="icon-check-circle"></i>
            <span>{selectedProducts.length} products selected</span>
          </div>
          <div className="bulk-buttons">
            <button 
              className="btn btn--sm btn--success"
              onClick={() => handleBulkAction('activate')}
            >
              <i className="icon-check"></i>
              Activate Selected
            </button>
            <button 
              className="btn btn--sm btn--warning"
              onClick={() => handleBulkAction('deactivate')}
            >
              <i className="icon-pause"></i>
              Deactivate Selected
            </button>
            <button 
              className="btn btn--sm btn--outline"
              onClick={() => handleBulkAction('export')}
            >
              <i className="icon-download"></i>
              Export Selected
            </button>
            <button 
              className="btn btn--sm btn--secondary"
              onClick={() => setSelectedProducts([])}
            >
              <i className="icon-x-circle"></i>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Products Table View */}
      {viewMode === 'table' && (
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th width="40">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  />
                </th>
                <th onClick={() => handleSort('name')} className="sortable">
                  Product
                  {sortConfig.key === 'name' && (
                    <i className={`icon-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('sku')} className="sortable">
                  SKU
                  {sortConfig.key === 'sku' && (
                    <i className={`icon-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('category')} className="sortable">
                  Category
                  {sortConfig.key === 'category' && (
                    <i className={`icon-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('quantity')} className="sortable">
                  Stock
                  {sortConfig.key === 'quantity' && (
                    <i className={`icon-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('costPrice')} className="sortable">
                  Cost Price
                  {sortConfig.key === 'costPrice' && (
                    <i className={`icon-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('sellingPrice')} className="sortable">
                  Selling Price
                  {sortConfig.key === 'sellingPrice' && (
                    <i className={`icon-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th>Stock Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    <div className="no-data-content">
                      <i className="icon-package"></i>
                      <p>No products found</p>
                      <Link to="/inventory/products/add" className="btn btn--primary">
                        Add Your First Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="product-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(prev => [...prev, product.id]);
                          } else {
                            setSelectedProducts(prev => prev.filter(id => id !== product.id));
                          }
                        }}
                      />
                    </td>
                    <td className="product-info">
                      <div className="product-name">
                        <Link to={`/inventory/products/${product.id}`}>{product.name}</Link>
                      </div>
                      <div className="product-description">
                        {product.description}
                      </div>
                    </td>
                    <td className="product-sku">
                      <code>{product.sku}</code>
                    </td>
                    <td className="product-category">
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td className="product-stock">
                      <div className="stock-info">
                        <div className="stock-quantity">{product.quantity}</div>
                        <div className={`stock-status ${getStockStatusClass(product)}`}>
                          {getStockStatusText(product)}
                        </div>
                        {product.quantity > 0 && (
                          <div className="stock-threshold">
                            Low: {product.lowStockThreshold} | Max: {product.maxStockLevel}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="product-cost">
                      {formatCurrency(product.costPrice)}
                    </td>
                    <td className="product-price">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="product-value">
                      <div className="value-amount">
                        {formatCurrency(calculateStockValue(product))}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(product.status)}>
                        {product.status}
                      </span>
                    </td>
                    <td className="product-actions">
                      <div className="action-buttons">
                        <Link 
                          to={`/inventory/products/${product.id}`}
                          className="btn btn--sm btn--outline"
                          title="View Details"
                        >
                          <i className="icon-eye"></i>
                        </Link>
                        <Link
                          to={`/inventory/products/edit/${product.id}`}
                          className="btn btn--sm btn--secondary"
                          title="Edit Product"
                        >
                          <i className="icon-edit"></i>
                        </Link>
                        <button
                          onClick={() => setStockModal({ 
                            isOpen: true, 
                            product, 
                            newStock: product.quantity 
                          })}
                          className="btn btn--sm btn--primary"
                          title="Update Stock"
                        >
                          <i className="icon-refresh-cw"></i>
                        </button>
                        {product.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(product.id, 'inactive')}
                            className="btn btn--sm btn--warning"
                            title="Deactivate"
                          >
                            <i className="icon-pause"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(product.id, 'active')}
                            className="btn btn--sm btn--success"
                            title="Activate"
                          >
                            <i className="icon-play"></i>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, product })}
                          className="btn btn--sm btn--danger"
                          title="Delete Product"
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

      {/* Products Grid View */}
      {viewMode === 'grid' && (
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-content">
                <i className="icon-package"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search criteria or add a new product</p>
                <Link to="/inventory/products/add" className="btn btn--primary">
                  Add New Product
                </Link>
              </div>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="card-header">
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="image-placeholder">
                        <i className="icon-package"></i>
                      </div>
                    )}
                  </div>
                  <div className="product-title">
                    <h3>
                      <Link to={`/inventory/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <code className="product-sku">{product.sku}</code>
                  </div>
                </div>

                <div className="card-content">
                  <div className="product-meta">
                    <div className="meta-item">
                      <label>Category:</label>
                      <span className="category-tag">{product.category}</span>
                    </div>
                    <div className="meta-item">
                      <label>Status:</label>
                      <span className={getStatusBadgeClass(product.status)}>
                        {product.status}
                      </span>
                    </div>
                  </div>

                  <div className="product-description">
                    {product.description}
                  </div>

                  <div className="product-stats">
                    <div className="stat">
                      <label>Current Stock</label>
                      <div className="stock-info">
                        <span className="stock-quantity">{product.quantity}</span>
                        <span className={`stock-status ${getStockStatusClass(product)}`}>
                          {getStockStatusText(product)}
                        </span>
                      </div>
                    </div>
                    <div className="stat">
                      <label>Stock Value</label>
                      <div className="value-amount">
                        {formatCurrency(calculateStockValue(product))}
                      </div>
                    </div>
                  </div>

                  <div className="product-pricing">
                    <div className="price-item">
                      <span>Cost:</span>
                      <span className="cost-price">{formatCurrency(product.costPrice)}</span>
                    </div>
                    <div className="price-item">
                      <span>Price:</span>
                      <span className="selling-price">{formatCurrency(product.sellingPrice)}</span>
                    </div>
                    <div className="price-item">
                      <span>Margin:</span>
                      <span className="margin">
                        {(((product.sellingPrice - product.costPrice) / product.costPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <Link 
                    to={`/inventory/products/${product.id}`}
                    className="btn btn--sm btn--outline"
                  >
                    <i className="icon-eye"></i>
                    View
                  </Link>
                  <Link
                    to={`/inventory/products/edit/${product.id}`}
                    className="btn btn--sm btn--secondary"
                  >
                    <i className="icon-edit"></i>
                    Edit
                  </Link>
                  <button
                    onClick={() => setStockModal({ 
                      isOpen: true, 
                      product, 
                      newStock: product.quantity 
                    })}
                    className="btn btn--sm btn--primary"
                  >
                    <i className="icon-refresh-cw"></i>
                    Stock
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
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        title="Delete Product"
      >
        <div className="delete-modal">
          <div className="warning-icon">
            <i className="icon-alert-triangle"></i>
          </div>
          <p>
            Are you sure you want to delete <strong>"{deleteModal.product?.name}"</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone and will permanently remove the product from inventory.
          </p>
          <div className="modal-actions">
            <button
              className="btn btn--secondary"
              onClick={() => setDeleteModal({ isOpen: false, product: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn--danger"
              onClick={handleDelete}
            >
              Delete Product
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Stock Modal */}
      <Modal
        isOpen={stockModal.isOpen}
        onClose={() => setStockModal({ isOpen: false, product: null, newStock: 0 })}
        title="Update Stock Level"
      >
        <div className="stock-modal">
          <div className="product-info">
            <h4>{stockModal.product?.name}</h4>
            <p>SKU: {stockModal.product?.sku}</p>
            <p>Current Stock: <strong>{stockModal.product?.quantity}</strong></p>
          </div>
          
          <div className="form-group">
            <label htmlFor="newStock">New Stock Quantity</label>
            <input
              type="number"
              id="newStock"
              value={stockModal.newStock}
              onChange={(e) => setStockModal(prev => ({ 
                ...prev, 
                newStock: parseInt(e.target.value) || 0 
              }))}
              min="0"
              className="stock-input"
            />
          </div>

          <div className="stock-thresholds">
            <div className="threshold">
              <span>Low Stock Threshold:</span>
              <span>{stockModal.product?.lowStockThreshold}</span>
            </div>
            <div className="threshold">
              <span>Max Stock Level:</span>
              <span>{stockModal.product?.maxStockLevel}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn--secondary"
              onClick={() => setStockModal({ isOpen: false, product: null, newStock: 0 })}
            >
              Cancel
            </button>
            <button
              className="btn btn--primary"
              onClick={handleStockUpdate}
            >
              Update Stock
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;