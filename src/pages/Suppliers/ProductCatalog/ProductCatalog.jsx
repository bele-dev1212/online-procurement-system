// src/pages/Suppliers/ProductCatalog/ProductCatalog.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { suppliersAPI } from '../../../services/api/suppliersAPI';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import ProductForm from '../../../components/inventory/ProductForm/ProductForm';
import StockAlert from '../../../components/inventory/StockAlert/StockAlert';
import ConfirmDialog from '../../../components/common/Modal/ConfirmDialog';
import Notification from '../../../components/common/Notification/Notification';
import './ProductCatalog.css';

const ProductCatalog = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'asc');

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortBy,
        order: sortOrder,
        page: 1,
        limit: 100 // Adjust based on your pagination needs
      };

      const response = await supplierAPI.getProducts(params);
      
      if (response.success) {
        setProducts(response.data.products || []);
        setFilteredProducts(response.data.products || []);
      } else {
        throw new Error(response.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products. Please try again.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Initial load and when filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update URL search params when filters change
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (sortBy !== 'name') params.sort = sortBy;
    if (sortOrder !== 'asc') params.order = sortOrder;
    
    setSearchParams(params);
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder, setSearchParams]);

  // Handle product creation
  const handleAddProduct = async (productData) => {
    try {
      setLoading(true);
      const response = await supplierAPI.createProduct(productData);
      
      if (response.success) {
        setShowAddModal(false);
        setEditingProduct(null);
        setSuccessMessage('Product added successfully!');
        await loadProducts(); // Refresh the list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to add product');
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      setError(err.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle product update
  const handleUpdateProduct = async (productData) => {
    try {
      setLoading(true);
      const response = await supplierAPI.updateProduct(editingProduct.id, productData);
      
      if (response.success) {
        setShowAddModal(false);
        setEditingProduct(null);
        setSuccessMessage('Product updated successfully!');
        await loadProducts();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      setError(err.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      setLoading(true);
      const response = await supplierAPI.deleteProduct(productToDelete.id);
      
      if (response.success) {
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        setSuccessMessage('Product deleted successfully!');
        await loadProducts();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(err.message || 'Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  // Handle form submission (both add and edit)
  const handleFormSubmit = (productData) => {
    if (editingProduct) {
      handleUpdateProduct(productData);
    } else {
      handleAddProduct(productData);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  // Get unique categories for filter
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  if (loading && products.length === 0) {
    return (
      <div className="product-catalog">
        <div className="catalog-header">
          <h1>Product Catalog</h1>
        </div>
        <LoadingSpinner message="Loading your products..." />
      </div>
    );
  }

  return (
    <div className="product-catalog">
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
      <div className="catalog-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Product Catalog</h1>
            <p>Manage your product inventory and catalog</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              <span className="btn-icon">+</span>
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Toolbar */}
      <div className="catalog-toolbar">
        <div className="toolbar-section">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search products by name, SKU, or description..."
            disabled={loading}
          />
        </div>
        
        <div className="toolbar-section">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select 
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={loading}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

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
              <option value="inactive">Inactive</option>
              <option value="out-of-stock">Out of Stock</option>
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
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="createdAt">Date Added</option>
              <option value="updatedAt">Last Updated</option>
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
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
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

      {/* Stock Alerts */}
      <StockAlert 
        products={products}
        onViewProduct={handleEditProduct}
      />

      {/* Products Grid/List */}
      <div className="products-section">
        <div className="section-header">
          <h2>
            Products ({filteredProducts.length})
            {loading && <span className="loading-indicator">Updating...</span>}
          </h2>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="image-placeholder">
                    {product.category?.charAt(0) || '📦'}
                  </div>
                  
                  <div className="product-badges">
                    {getStockStatus(product.stock) === 'out-of-stock' && (
                      <span className="badge badge-danger">Out of Stock</span>
                    )}
                    {getStockStatus(product.stock) === 'low-stock' && (
                      <span className="badge badge-warning">Low Stock</span>
                    )}
                    {!product.isActive && (
                      <span className="badge badge-secondary">Inactive</span>
                    )}
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-sku">SKU: {product.sku || 'N/A'}</p>
                  <p className="product-category">{product.category}</p>
                  <p className="product-description">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Price:</span>
                      <span className="meta-value">{formatPrice(product.price)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Stock:</span>
                      <span className={`meta-value stock-${getStockStatus(product.stock)}`}>
                        {product.stock} units
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Status:</span>
                      <span className={`meta-value status-${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="product-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleEditProduct(product)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteClick(product)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                  <Link 
                    to={`/supplier/catalog/${product.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your search filters to find more products.'
                : 'Get started by adding your first product to your catalog.'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Product
              </button>
            )}
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <button 
                className="btn btn-outline"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="large"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={
          productToDelete ? 
          `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.` 
          : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </div>
  );
};

export default ProductCatalog;