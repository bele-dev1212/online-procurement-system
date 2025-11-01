import React, { useState, useEffect } from 'react';
import { useInventory } from '../../../hooks/useInventory';
import { useNotifications } from '../../../hooks/useNotifications';
import SearchBar from '../../common/SearchBar/SearchBar';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './CategoryList.css';

const CategoryList = () => {
  const { 
    categories, 
    loading, 
    error, 
    deleteCategory,
    updateCategoryStatus,
    getProductsByCategory
  } = useInventory();
  
  const { addNotification } = useNotifications();
  
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [productsModal, setProductsModal] = useState({ isOpen: false, category: null, products: [] });
  

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, statusFilter]);

  const filterCategories = () => {
    let filtered = categories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.parentCategory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(category => category.status === statusFilter);
    }

    setFilteredCategories(filtered);
  };

  const handleDelete = async () => {
    try {
      // Check if category has products
      const categoryProducts = await getProductsByCategory(deleteModal.category.id);
      
      if (categoryProducts.length > 0) {
        addNotification(`Cannot delete category with ${categoryProducts.length} products`, 'error');
        return;
      }

      await deleteCategory(deleteModal.category.id);
      addNotification('Category deleted successfully', 'success');
      setDeleteModal({ isOpen: false, category: null });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to delete category', 'error');
    }
  };

  const handleStatusChange = async (categoryId, newStatus) => {
    try {
      await updateCategoryStatus(categoryId, newStatus);
      addNotification('Category status updated successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update category status', 'error');
    }
  };

  const handleViewProducts = async (category) => {
    try {
      const products = await getProductsByCategory(category.id);
      setProductsModal({ isOpen: true, category, products });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load category products', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-badge--active',
      inactive: 'status-badge--inactive',
      archived: 'status-badge--archived'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--inactive'}`;
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentCategory);
  };

  const getSubCategories = (parentId) => {
    return categories.filter(cat => cat.parentCategory === parentId);
  };

  const calculateCategoryStats = (categoryId) => {
    const categoryProducts = categories.find(cat => cat.id === categoryId)?.products || [];
    const totalProducts = categoryProducts.length;
    const activeProducts = categoryProducts.filter(p => p.status === 'active').length;
    const lowStockProducts = categoryProducts.filter(p => p.quantity <= p.lowStockThreshold && p.quantity > 0).length;
    const outOfStockProducts = categoryProducts.filter(p => p.quantity === 0).length;

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts
    };
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error loading categories: {error}</div>;

  return (
    <div className="category-list">
      {/* Header */}
      <div className="category-list-header">
        <div className="header-left">
          <h1>Product Categories</h1>
          <p>Manage and organize your product categories</p>
        </div>
        <div className="header-actions">
          <button className="btn btn--primary" onClick={() => window.location.href = '/inventory/categories/add'}>
            <i className="icon-plus"></i>
            Add Category
          </button>
          <button className="btn btn--outline" onClick={() => window.print()}>
            <i className="icon-printer"></i>
            Print
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="category-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="icon-folder"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Total Categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="icon-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{categories.filter(c => c.status === 'active').length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon parent">
            <i className="icon-layers"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{getParentCategories().length}</div>
            <div className="stat-label">Parent Categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon products">
            <i className="icon-package"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {formatNumber(categories.reduce((total, cat) => total + (cat.products?.length || 0), 0))}
            </div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="category-filters">
        <div className="filter-group">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search categories by name or description..."
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
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="filter-group">
          <button 
            className="btn btn--secondary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Categories Tree View */}
      <div className="categories-tree">
        <div className="tree-header">
          <h3>Category Hierarchy</h3>
          <span className="categories-count">{filteredCategories.length} categories</span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="no-categories">
            <div className="no-categories-content">
              <i className="icon-folder"></i>
              <h4>No categories found</h4>
              <p>Try adjusting your search criteria or create a new category</p>
              <button 
                className="btn btn--primary"
                onClick={() => window.location.href = '/inventory/categories/add'}
              >
                Create First Category
              </button>
            </div>
          </div>
        ) : (
          <div className="tree-content">
            {getParentCategories()
              .filter(parent => filteredCategories.some(cat => cat.id === parent.id || cat.parentCategory === parent.name))
              .map(parentCategory => (
                <div key={parentCategory.id} className="category-node parent">
                  <div className="category-card">
                    <div className="category-header">
                      <div className="category-info">
                        <h4>{parentCategory.name}</h4>
                        <span className={getStatusBadgeClass(parentCategory.status)}>
                          {parentCategory.status}
                        </span>
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn btn--sm btn--outline"
                          onClick={() => handleViewProducts(parentCategory)}
                          title="View Products"
                        >
                          <i className="icon-eye"></i>
                          Products
                        </button>
                        <button
                          className="btn btn--sm btn--secondary"
                          onClick={() => window.location.href = `/inventory/categories/edit/${parentCategory.id}`}
                          title="Edit Category"
                        >
                          <i className="icon-edit"></i>
                        </button>
                        {parentCategory.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(parentCategory.id, 'inactive')}
                            className="btn btn--sm btn--warning"
                            title="Deactivate"
                          >
                            <i className="icon-pause"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(parentCategory.id, 'active')}
                            className="btn btn--sm btn--success"
                            title="Activate"
                          >
                            <i className="icon-play"></i>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, category: parentCategory })}
                          className="btn btn--sm btn--danger"
                          title="Delete Category"
                        >
                          <i className="icon-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className="category-description">
                      {parentCategory.description}
                    </div>

                    <div className="category-stats">
                      <div className="stat-item">
                        <div className="stat-value">
                          {formatNumber(calculateCategoryStats(parentCategory.id).totalProducts)}
                        </div>
                        <div className="stat-label">Products</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">
                          {formatNumber(getSubCategories(parentCategory.name).length)}
                        </div>
                        <div className="stat-label">Sub-categories</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">
                          {formatNumber(calculateCategoryStats(parentCategory.id).activeProducts)}
                        </div>
                        <div className="stat-label">Active</div>
                      </div>
                    </div>

                    {/* Sub-categories */}
                    {getSubCategories(parentCategory.name).length > 0 && (
                      <div className="sub-categories">
                        <div className="sub-categories-header">
                          <h5>Sub-categories ({getSubCategories(parentCategory.name).length})</h5>
                        </div>
                        <div className="sub-categories-list">
                          {getSubCategories(parentCategory.name).map(subCategory => (
                            <div key={subCategory.id} className="category-node child">
                              <div className="category-card">
                                <div className="category-header">
                                  <div className="category-info">
                                    <h5>{subCategory.name}</h5>
                                    <span className={getStatusBadgeClass(subCategory.status)}>
                                      {subCategory.status}
                                    </span>
                                  </div>
                                  <div className="category-actions">
                                    <button
                                      className="btn btn--sm btn--outline"
                                      onClick={() => handleViewProducts(subCategory)}
                                      title="View Products"
                                    >
                                      <i className="icon-eye"></i>
                                      Products
                                    </button>
                                    <button
                                      className="btn btn--sm btn--secondary"
                                      onClick={() => window.location.href = `/inventory/categories/edit/${subCategory.id}`}
                                      title="Edit Category"
                                    >
                                      <i className="icon-edit"></i>
                                    </button>
                                    {subCategory.status === 'active' ? (
                                      <button
                                        onClick={() => handleStatusChange(subCategory.id, 'inactive')}
                                        className="btn btn--sm btn--warning"
                                        title="Deactivate"
                                      >
                                        <i className="icon-pause"></i>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleStatusChange(subCategory.id, 'active')}
                                        className="btn btn--sm btn--success"
                                        title="Activate"
                                      >
                                        <i className="icon-play"></i>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setDeleteModal({ isOpen: true, category: subCategory })}
                                      className="btn btn--sm btn--danger"
                                      title="Delete Category"
                                    >
                                      <i className="icon-trash"></i>
                                    </button>
                                  </div>
                                </div>

                                <div className="category-description">
                                  {subCategory.description}
                                </div>

                                <div className="category-stats">
                                  <div className="stat-item">
                                    <div className="stat-value">
                                      {formatNumber(calculateCategoryStats(subCategory.id).totalProducts)}
                                    </div>
                                    <div className="stat-label">Products</div>
                                  </div>
                                  <div className="stat-item">
                                    <div className="stat-value">
                                      {formatNumber(calculateCategoryStats(subCategory.id).activeProducts)}
                                    </div>
                                    <div className="stat-label">Active</div>
                                  </div>
                                  <div className="stat-item">
                                    <div className="stat-value">
                                      {formatNumber(calculateCategoryStats(subCategory.id).lowStockProducts)}
                                    </div>
                                    <div className="stat-label">Low Stock</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            }

            {/* Categories without parent */}
            {filteredCategories
              .filter(cat => !cat.parentCategory && !getParentCategories().some(parent => parent.id === cat.id))
              .map(category => (
                <div key={category.id} className="category-node parent">
                  <div className="category-card">
                    <div className="category-header">
                      <div className="category-info">
                        <h4>{category.name}</h4>
                        <span className={getStatusBadgeClass(category.status)}>
                          {category.status}
                        </span>
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn btn--sm btn--outline"
                          onClick={() => handleViewProducts(category)}
                          title="View Products"
                        >
                          <i className="icon-eye"></i>
                          Products
                        </button>
                        <button
                          className="btn btn--sm btn--secondary"
                          onClick={() => window.location.href = `/inventory/categories/edit/${category.id}`}
                          title="Edit Category"
                        >
                          <i className="icon-edit"></i>
                        </button>
                        {category.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(category.id, 'inactive')}
                            className="btn btn--sm btn--warning"
                            title="Deactivate"
                          >
                            <i className="icon-pause"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(category.id, 'active')}
                            className="btn btn--sm btn--success"
                            title="Activate"
                          >
                            <i className="icon-play"></i>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, category })}
                          className="btn btn--sm btn--danger"
                          title="Delete Category"
                        >
                          <i className="icon-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className="category-description">
                      {category.description}
                    </div>

                    <div className="category-stats">
                      <div className="stat-item">
                        <div className="stat-value">
                          {formatNumber(calculateCategoryStats(category.id).totalProducts)}
                        </div>
                        <div className="stat-label">Products</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">
                          {formatNumber(calculateCategoryStats(category.id).activeProducts)}
                        </div>
                        <div className="stat-label">Active</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">
                          {formatNumber(calculateCategoryStats(category.id).lowStockProducts)}
                        </div>
                        <div className="stat-label">Low Stock</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        title="Delete Category"
      >
        <div className="delete-modal">
          <div className="warning-icon">
            <i className="icon-alert-triangle"></i>
          </div>
          <p>
            Are you sure you want to delete category <strong>"{deleteModal.category?.name}"</strong>?
          </p>
          {deleteModal.category && (
            <div className="delete-warning">
              <p>
                This action cannot be undone and will permanently remove the category.
              </p>
              <p className="warning-text">
                ⚠️ You cannot delete categories that have associated products.
              </p>
            </div>
          )}
          <div className="modal-actions">
            <button
              className="btn btn--secondary"
              onClick={() => setDeleteModal({ isOpen: false, category: null })}
            >
              Cancel
            </button>
            <button
              className="btn btn--danger"
              onClick={handleDelete}
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>

      {/* Products Modal */}
      <Modal
        isOpen={productsModal.isOpen}
        onClose={() => setProductsModal({ isOpen: false, category: null, products: [] })}
        title={`Products in ${productsModal.category?.name}`}
        size="large"
      >
        <div className="products-modal">
          {productsModal.products.length === 0 ? (
            <div className="no-products">
              <i className="icon-package"></i>
              <p>No products found in this category</p>
            </div>
          ) : (
            <div className="products-list">
              <div className="products-count">
                {productsModal.products.length} products found
              </div>
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsModal.products.map(product => (
                      <tr key={product.id}>
                        <td className="product-name">{product.name}</td>
                        <td className="product-sku">{product.sku}</td>
                        <td className="product-stock">{product.quantity}</td>
                        <td>
                          <span className={`status-badge status-badge--${product.status}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="product-actions">
                          <button
                            className="btn btn--sm btn--outline"
                            onClick={() => window.location.href = `/inventory/products/${product.id}`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              className="btn btn--secondary"
              onClick={() => setProductsModal({ isOpen: false, category: null, products: [] })}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;