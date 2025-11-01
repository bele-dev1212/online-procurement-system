import React, { useState, useEffect } from 'react';
import { useInventory } from '../../../hooks/useInventory';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import './Categories.css';

const Categories = () => {
  const { 
    categories, 
    loading, 
    fetchCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    getCategoryStats 
  } = useInventory();
  
  const { addNotification } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      loadCategoryStats();
    }
  }, [categories]);

  const loadCategoryStats = async () => {
    try {
      const stats = await getCategoryStats();
      setCategoryStats(stats);
    } catch (error) {
      console.error('Failed to load category stats:', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortConfig.key === 'productCount') {
      const aCount = categoryStats[a.id]?.productCount || 0;
      const bCount = categoryStats[b.id]?.productCount || 0;
      return sortConfig.direction === 'asc' ? aCount - bCount : bCount - aCount;
    }

    if (sortConfig.key === 'totalValue') {
      const aValue = categoryStats[a.id]?.totalValue || 0;
      const bValue = categoryStats[b.id]?.totalValue || 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await addCategory(categoryForm);
      setShowAddModal(false);
      resetForm();
      addNotification('Category added successfully!', 'success');
    } catch (error) {
      addNotification('Failed to add category: ' + error.message, 'error');
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(selectedCategory.id, categoryForm);
      setShowEditModal(false);
      resetForm();
      addNotification('Category updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to update category: ' + error.message, 'error');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      setShowDeleteModal(false);
      addNotification('Category deleted successfully!', 'success');
    } catch (error) {
      addNotification('Failed to delete category: ' + error.message, 'error');
    }
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      parentCategory: '',
      isActive: true
    });
    setSelectedCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      isActive: category.isActive
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getParentCategoryName = (parentId) => {
    if (!parentId) return '-';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div className="header-content">
          <h1>Inventory Categories</h1>
          <p>Manage product categories and organize your inventory</p>
        </div>
        <button 
          className="btn-primary btn-add-category"
          onClick={openAddModal}
        >
          + Add Category
        </button>
      </div>

      {/* Category Statistics */}
      <div className="categories-stats">
        <div className="stat-card">
          <div className="stat-value">{categories.length}</div>
          <div className="stat-label">Total Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {categories.filter(cat => cat.isActive).length}
          </div>
          <div className="stat-label">Active Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Object.values(categoryStats).reduce((total, stat) => total + (stat.productCount || 0), 0)}
          </div>
          <div className="stat-label">Total Products</div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="categories-controls">
        <div className="search-container">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search categories..."
          />
        </div>
        <div className="results-count">
          {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {/* Categories Table */}
      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th 
                className="sortable" 
                onClick={() => handleSort('name')}
              >
                Category Name {getSortIcon('name')}
              </th>
              <th>Description</th>
              <th>Parent Category</th>
              <th 
                className="sortable" 
                onClick={() => handleSort('productCount')}
              >
                Products {getSortIcon('productCount')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('totalValue')}
              >
                Total Value {getSortIcon('totalValue')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('isActive')}
              >
                Status {getSortIcon('isActive')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map(category => (
              <tr key={category.id} className={!category.isActive ? 'inactive' : ''}>
                <td className="category-name">
                  <div className="name-wrapper">
                    <span className="name">{category.name}</span>
                    {category.isActive || <span className="status-badge inactive-badge">Inactive</span>}
                  </div>
                </td>
                <td className="category-description">
                  {category.description || '-'}
                </td>
                <td className="parent-category">
                  {getParentCategoryName(category.parentCategory)}
                </td>
                <td className="product-count">
                  {categoryStats[category.id]?.productCount || 0}
                </td>
                <td className="total-value">
                  {formatCurrency(categoryStats[category.id]?.totalValue)}
                </td>
                <td className="status">
                  <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => openEditModal(category)}
                    title="Edit Category"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => openDeleteModal(category)}
                    title="Delete Category"
                    disabled={categoryStats[category.id]?.productCount > 0}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No categories found</h3>
            <p>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
            </p>
            {!searchTerm && (
              <button className="btn-primary" onClick={openAddModal}>
                Create Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Category"
      >
        <form onSubmit={handleAddCategory} className="category-form">
          <div className="form-group">
            <label htmlFor="name" className="required">Category Name</label>
            <input
              type="text"
              id="name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter category name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              placeholder="Enter category description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="parentCategory">Parent Category</label>
            <select
              id="parentCategory"
              value={categoryForm.parentCategory}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, parentCategory: e.target.value }))}
            >
              <option value="">No Parent Category</option>
              {categories
                .filter(cat => cat.isActive && cat.id !== selectedCategory?.id)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={categoryForm.isActive}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <span className="checkmark"></span>
              Active Category
            </label>
            <p className="checkbox-help">Inactive categories won't be available for new products</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!categoryForm.name.trim()}
              className="btn-primary"
            >
              Add Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Category"
      >
        <form onSubmit={handleEditCategory} className="category-form">
          <div className="form-group">
            <label htmlFor="edit-name" className="required">Category Name</label>
            <input
              type="text"
              id="edit-name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter category name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              placeholder="Enter category description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-parentCategory">Parent Category</label>
            <select
              id="edit-parentCategory"
              value={categoryForm.parentCategory}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, parentCategory: e.target.value }))}
            >
              <option value="">No Parent Category</option>
              {categories
                .filter(cat => cat.isActive && cat.id !== selectedCategory?.id)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={categoryForm.isActive}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <span className="checkmark"></span>
              Active Category
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!categoryForm.name.trim()}
              className="btn-primary"
            >
              Update Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Category"
        size="small"
      >
        <div className="delete-confirmation">
          <div className="warning-icon">⚠️</div>
          <h3>Delete "{selectedCategory?.name}"?</h3>
          <p>
            {categoryStats[selectedCategory?.id]?.productCount > 0 ? (
              <>
                This category contains <strong>{categoryStats[selectedCategory.id].productCount} products</strong>. 
                You cannot delete a category that has products assigned to it. 
                Please reassign or delete the products first.
              </>
            ) : (
              "Are you sure you want to delete this category? This action cannot be undone."
            )}
          </p>
          
          <div className="delete-actions">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCategory}
              disabled={categoryStats[selectedCategory?.id]?.productCount > 0}
              className="btn-danger"
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;