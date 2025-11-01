import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../../../hooks/useInventory';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './CategoryForm.css';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { 
    categories,
    createCategory, 
    updateCategory, 
    getCategory, 
    loading 
  } = useInventory();
  
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    status: 'active',
    image: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    displayOrder: 0,
    isFeatured: false,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      const category = await getCategory(id);
      setFormData({
        name: category.name,
        description: category.description,
        parentCategory: category.parentCategory || '',
        status: category.status,
        image: category.image || '',
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        seoKeywords: category.seoKeywords || '',
        displayOrder: category.displayOrder || 0,
        isFeatured: category.isFeatured || false,
        notes: category.notes || ''
      });
      
      if (category.image) {
        setImagePreview(category.image);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load category', 'error');
      navigate('/inventory/categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseInt(value) || 0
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const getParentCategories = () => {
    return categories.filter(cat => 
      !cat.parentCategory && (!isEdit || cat.id !== id)
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Category name is required';
    if (formData.name.length > 50) errors.name = 'Category name must be less than 50 characters';
    if (formData.description.length > 500) errors.description = 'Description must be less than 500 characters';
    if (formData.displayOrder < 0) errors.displayOrder = 'Display order cannot be negative';
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => addNotification(error, 'error'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEdit) {
        await updateCategory(id, formData);
        addNotification('Category updated successfully', 'success');
      } else {
        await createCategory(formData);
        addNotification('Category created successfully', 'success');
      }
      navigate('/inventory/categories');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification(`Failed to ${isEdit ? 'update' : 'create'} category`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCategoryStats = () => {
    const totalProducts = categories.reduce((total, cat) => total + (cat.products?.length || 0), 0);
    const activeCategories = categories.filter(cat => cat.status === 'active').length;
    const parentCategories = categories.filter(cat => !cat.parentCategory).length;
    
    return { totalProducts, activeCategories, parentCategories };
  };

  const stats = calculateCategoryStats();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="category-form">
      <div className="form-header">
        <div className="header-left">
          <h1>{isEdit ? 'Edit Category' : 'Create New Category'}</h1>
          <p>{isEdit ? 'Update category information' : 'Add a new product category to organize your inventory'}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setShowPreview(true)}
          >
            <i className="icon-eye"></i>
            Preview
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate('/inventory/categories')}
          >
            <i className="icon-x"></i>
            Cancel
          </button>
        </div>
      </div>

      <div className="form-content">
        <div className="form-main">
          <form onSubmit={handleSubmit} className="category-form-content">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
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
                    maxLength="50"
                  />
                  <div className="help-text">
                    {formData.name.length}/50 characters
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="parentCategory">Parent Category</label>
                  <select
                    id="parentCategory"
                    name="parentCategory"
                    value={formData.parentCategory}
                    onChange={handleInputChange}
                  >
                    <option value="">No Parent (Top Level)</option>
                    {getParentCategories().map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="help-text">
                    Leave empty to create a top-level category
                  </div>
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
                  <label htmlFor="displayOrder">Display Order</label>
                  <input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleNumberChange}
                    min="0"
                  />
                  <div className="help-text">
                    Lower numbers display first
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this category and its products..."
                  rows="4"
                  maxLength="500"
                />
                <div className="help-text">
                  {formData.description.length}/500 characters
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Category Image</h3>
              <div className="image-upload-section">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Category preview" />
                    <button
                      type="button"
                      className="btn btn--sm btn--danger remove-btn"
                      onClick={removeImage}
                    >
                      <i className="icon-trash"></i>
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="upload-area">
                    <input
                      type="file"
                      id="categoryImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <label htmlFor="categoryImage" className="upload-label">
                      <i className="icon-upload"></i>
                      <span>Upload Category Image</span>
                      <span className="upload-hint">Recommended: 400x400px, JPG, PNG, or GIF</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>SEO Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="seoTitle">SEO Title</label>
                  <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="SEO title for search engines"
                    maxLength="60"
                  />
                  <div className="help-text">
                    {formData.seoTitle.length}/60 characters
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="seoKeywords">SEO Keywords</label>
                  <input
                    type="text"
                    id="seoKeywords"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    placeholder="Comma-separated keywords"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="seoDescription">SEO Description</label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  placeholder="SEO description for search engines"
                  rows="3"
                  maxLength="160"
                />
                <div className="help-text">
                  {formData.seoDescription.length}/160 characters
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Featured Category
                  </label>
                  <div className="help-text">
                    Display this category prominently on the website
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="notes">Internal Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Internal notes and comments..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <div className="action-left">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => navigate('/inventory/categories')}
                >
                  Cancel
                </button>
              </div>
              <div className="action-right">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="form-sidebar">
          <div className="sidebar-card">
            <h4>Category Statistics</h4>
            <div className="stats-list">
              <div className="stat-item">
                <span className="label">Total Categories:</span>
                <span className="value">{categories.length}</span>
              </div>
              <div className="stat-item">
                <span className="label">Active Categories:</span>
                <span className="value">{stats.activeCategories}</span>
              </div>
              <div className="stat-item">
                <span className="label">Parent Categories:</span>
                <span className="value">{stats.parentCategories}</span>
              </div>
              <div className="stat-item">
                <span className="label">Total Products:</span>
                <span className="value">{stats.totalProducts}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h4>Quick Tips</h4>
            <ul className="tips-list">
              <li>Use descriptive names that customers will understand</li>
              <li>Organize categories in a logical hierarchy</li>
              <li>Add SEO information to improve search visibility</li>
              <li>Use featured categories to highlight important sections</li>
              <li>Keep category names under 50 characters</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Category Preview"
        size="medium"
      >
        <div className="category-preview">
          <div className="preview-header">
            {imagePreview && (
              <div className="preview-image">
                <img src={imagePreview} alt={formData.name} />
              </div>
            )}
            <h2>{formData.name || 'Category Name'}</h2>
            <div className="preview-meta">
              {formData.parentCategory && (
                <span className="parent-category">Parent: {formData.parentCategory}</span>
              )}
              <span className={`status-badge status-badge--${formData.status}`}>
                {formData.status}
              </span>
              {formData.isFeatured && (
                <span className="featured-badge">Featured</span>
              )}
            </div>
          </div>
          
          <div className="preview-content">
            <div className="preview-section">
              <h4>Description</h4>
              <p>{formData.description || 'No description provided'}</p>
            </div>
            
            {formData.seoTitle && (
              <div className="preview-section">
                <h4>SEO Information</h4>
                <div className="seo-preview">
                  <div className="seo-title">{formData.seoTitle}</div>
                  <div className="seo-url">example.com/categories/{formData.name?.toLowerCase().replace(/\s+/g, '-')}</div>
                  <div className="seo-description">{formData.seoDescription}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn btn--secondary"
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryForm;