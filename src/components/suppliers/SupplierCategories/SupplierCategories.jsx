import React, { useState, useEffect } from 'react';
import { useSupplierCategories } from '../../../hooks/useSupplierCategories';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import SearchBar from '../../common/SearchBar/SearchBar';
import './SupplierCategories.css';

const SupplierCategories = () => {
  const { 
    categories, 
    loading, 
    error, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    recalculateCategoryStats 
  } = useSupplierCategories();
  
  const { suppliers } = useSuppliers();
  const { addNotification } = useNotifications();

  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    status: 'active',
    requirements: [],
    riskLevel: 'low'
  });

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm]);

  const filterCategories = () => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
      status: 'active',
      requirements: [],
      riskLevel: 'low'
    });
    setEditingCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: updatedRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    const updatedRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, requirements: updatedRequirements }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== '')
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        addNotification('Category updated successfully', 'success');
      } else {
        await createCategory(categoryData);
        addNotification('Category created successfully', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification(`Failed to ${editingCategory ? 'update' : 'create'} category`, 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      parentCategory: category.parentCategory || '',
      status: category.status,
      requirements: category.requirements || [],
      riskLevel: category.riskLevel || 'low'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      // Check if category has suppliers
      const categorySuppliers = suppliers.filter(s => s.category === deleteModal.category.name);
      
      if (categorySuppliers.length > 0) {
        addNotification(`Cannot delete category with ${categorySuppliers.length} associated suppliers`, 'error');
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

  const getSuppliersInCategory = (categoryName) => {
    return suppliers.filter(supplier => supplier.category === categoryName);
  };

  const getRiskLevelClass = (riskLevel) => {
    const riskClasses = {
      low: 'risk-level--low',
      medium: 'risk-level--medium',
      high: 'risk-level--high',
      critical: 'risk-level--critical'
    };
    return `risk-level ${riskClasses[riskLevel] || 'risk-level--low'}`;
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-badge--${status}`;
  };

  const calculateCategoryStats = (categoryName) => {
    const categorySuppliers = getSuppliersInCategory(categoryName);
    const activeSuppliers = categorySuppliers.filter(s => s.status === 'active');
    const approvedSuppliers = categorySuppliers.filter(s => s.approvalStatus === 'approved');
    const avgRating = categorySuppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / categorySuppliers.length || 0;
    
    return {
      totalSuppliers: categorySuppliers.length,
      activeSuppliers: activeSuppliers.length,
      approvedSuppliers: approvedSuppliers.length,
      avgRating: avgRating.toFixed(1)
    };
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentCategory);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error loading categories: {error}</div>;

  return (
    <div className="supplier-categories">
      {/* Header */}
      <div className="categories-header">
        <div className="header-left">
          <h1>Supplier Categories</h1>
          <p>Manage supplier categories and classifications</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn--primary"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="icon-plus"></i>
            Add Category
          </button>
          <button 
            className="btn btn--outline"
            onClick={() => recalculateCategoryStats()}
          >
            <i className="icon-refresh-cw"></i>
            Recalculate Stats
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="categories-filters">
        <div className="search-container">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search categories by name or description..."
          />
        </div>
        <div className="filter-info">
          <span>{filteredCategories.length} categories found</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {filteredCategories.length === 0 ? (
          <div className="no-categories">
            <div className="no-categories-content">
              <i className="icon-folder"></i>
              <h3>No categories found</h3>
              <p>Create your first supplier category to get started</p>
              <button 
                className="btn btn--primary"
                onClick={() => setIsModalOpen(true)}
              >
                Create Category
              </button>
            </div>
          </div>
        ) : (
          filteredCategories.map(category => {
            const stats = calculateCategoryStats(category.name);
            const subCategories = categories.filter(cat => cat.parentCategory === category.name);

            return (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <div className="category-title">
                    <h3>{category.name}</h3>
                    <span className={getStatusBadgeClass(category.status)}>
                      {category.status}
                    </span>
                  </div>
                  <div className="category-actions">
                    <button 
                      className="btn btn--sm btn--outline"
                      onClick={() => handleEdit(category)}
                      title="Edit Category"
                    >
                      <i className="icon-edit"></i>
                    </button>
                    <button 
                      className="btn btn--sm btn--danger"
                      onClick={() => setDeleteModal({ isOpen: true, category })}
                      title="Delete Category"
                    >
                      <i className="icon-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="category-description">
                  {category.description}
                </div>

                {/* Risk Level */}
                <div className="category-risk">
                  <span className="risk-label">Risk Level:</span>
                  <span className={getRiskLevelClass(category.riskLevel)}>
                    {category.riskLevel}
                  </span>
                </div>

                {/* Statistics */}
                <div className="category-stats">
                  <div className="stat-item">
                    <div className="stat-value">{stats.totalSuppliers}</div>
                    <div className="stat-label">Total Suppliers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.activeSuppliers}</div>
                    <div className="stat-label">Active</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.approvedSuppliers}</div>
                    <div className="stat-label">Approved</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.avgRating}</div>
                    <div className="stat-label">Avg Rating</div>
                  </div>
                </div>

                {/* Requirements */}
                {category.requirements && category.requirements.length > 0 && (
                  <div className="category-requirements">
                    <h4>Requirements:</h4>
                    <ul>
                      {category.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sub-categories */}
                {subCategories.length > 0 && (
                  <div className="sub-categories">
                    <h4>Sub-categories ({subCategories.length}):</h4>
                    <div className="sub-categories-list">
                      {subCategories.map(subCat => (
                        <span key={subCat.id} className="sub-category-tag">
                          {subCat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parent Category */}
                {category.parentCategory && (
                  <div className="parent-category">
                    <span className="parent-label">Parent:</span>
                    <span className="parent-name">{category.parentCategory}</span>
                  </div>
                )}

                <div className="category-footer">
                  <div className="category-meta">
                    <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                    {category.updatedAt && (
                      <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter category description"
              rows="3"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="parentCategory">Parent Category</label>
              <select
                id="parentCategory"
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleInputChange}
              >
                <option value="">No Parent Category</option>
                {getParentCategories()
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                  .map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="riskLevel">Risk Level</label>
              <select
                id="riskLevel"
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="requirements-header">
              <label>Category Requirements</label>
              <button
                type="button"
                className="btn btn--sm btn--outline"
                onClick={addRequirement}
              >
                <i className="icon-plus"></i>
                Add Requirement
              </button>
            </div>
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="requirement-item">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="Enter requirement"
                />
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={() => removeRequirement(index)}
                >
                  <i className="icon-x"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

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
            Are you sure you want to delete the category <strong>"{deleteModal.category?.name}"</strong>?
          </p>
          {deleteModal.category && (
            <div className="delete-warning">
              <p>
                This action will affect <strong>{getSuppliersInCategory(deleteModal.category.name).length}</strong> suppliers in this category.
              </p>
              <p className="warning-text">
                ⚠️ You cannot delete categories that have associated suppliers.
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
              disabled={deleteModal.category && getSuppliersInCategory(deleteModal.category.name).length > 0}
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierCategories;