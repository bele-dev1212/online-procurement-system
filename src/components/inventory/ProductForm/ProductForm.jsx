import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../../../hooks/useInventory';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './ProductForm.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { 
    createProduct, 
    updateProduct, 
    getProduct, 
    loading, 
    categories 
  } = useInventory();
  
  const { suppliers } = useSuppliers();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    
    // Inventory Information
    quantity: 0,
    lowStockThreshold: 10,
    maxStockLevel: 1000,
    reorderPoint: 25,
    
    // Pricing Information
    costPrice: 0,
    sellingPrice: 0,
    taxRate: 0,
    
    // Product Details
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    color: '',
    size: '',
    material: '',
    
    // Supplier Information
    supplier: '',
    supplierSku: '',
    leadTime: 0,
    
    // Product Status
    status: 'active',
    isSerialized: false,
    isBatched: false,
    
    // Additional Information
    warrantyPeriod: 0,
    shelfLife: '',
    storageConditions: '',
    handlingInstructions: '',
    
    // Images
    images: [],
    
    // SEO & Marketing
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    } else {
      generateSKU();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const product = await getProduct(id);
      setFormData({
        ...product,
        dimensions: product.dimensions || { length: '', width: '', height: '' },
        images: product.images || [],
        supplier: product.supplier || '',
        supplierSku: product.supplierSku || '',
        leadTime: product.leadTime || 0,
        warrantyPeriod: product.warrantyPeriod || 0,
        shelfLife: product.shelfLife || '',
        storageConditions: product.storageConditions || '',
        handlingInstructions: product.handlingInstructions || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        keywords: product.keywords || '',
        notes: product.notes || ''
      });
      
      if (product.images && product.images.length > 0) {
        setImagePreview(product.images);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load product', 'error');
      navigate('/inventory/products');
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const sku = `SKU-${timestamp}-${random}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImagePreview(prev => [...prev, ...newImages]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateMargin = () => {
    if (!formData.costPrice || !formData.sellingPrice) return 0;
    return ((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100;
  };

  const calculateMarkup = () => {
    if (!formData.costPrice || !formData.sellingPrice) return 0;
    return ((formData.sellingPrice - formData.costPrice) / formData.sellingPrice) * 100;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.costPrice < 0) errors.costPrice = 'Cost price cannot be negative';
    if (formData.sellingPrice < 0) errors.sellingPrice = 'Selling price cannot be negative';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (formData.lowStockThreshold < 0) errors.lowStockThreshold = 'Low stock threshold cannot be negative';
    if (formData.maxStockLevel < 0) errors.maxStockLevel = 'Max stock level cannot be negative';
    
    if (formData.sellingPrice > 0 && formData.costPrice > formData.sellingPrice) {
      errors.sellingPrice = 'Selling price should be greater than cost price';
    }
    
    if (formData.maxStockLevel > 0 && formData.lowStockThreshold >= formData.maxStockLevel) {
      errors.lowStockThreshold = 'Low stock threshold should be less than max stock level';
    }

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
      const submissionData = {
        ...formData,
        margin: calculateMargin(),
        markup: calculateMarkup()
      };

      if (isEdit) {
        await updateProduct(id, submissionData);
        addNotification('Product updated successfully', 'success');
      } else {
        await createProduct(submissionData);
        addNotification('Product created successfully', 'success');
      }
      navigate('/inventory/products');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification(`Failed to ${isEdit ? 'update' : 'create'} product`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      console.log('Form has errors, but saving as draft anyway');
    }

    setIsSubmitting(true);
    
    try {
      const draftData = {
        ...formData,
        status: 'draft',
        margin: calculateMargin(),
        markup: calculateMarkup()
      };

      if (isEdit) {
        await updateProduct(id, draftData);
        addNotification('Product draft saved', 'success');
      } else {
        await createProduct(draftData);
        addNotification('Product draft created', 'success');
      }
      navigate('/inventory/products');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to save draft', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'icon-info' },
    { id: 'inventory', label: 'Inventory', icon: 'icon-package' },
    { id: 'pricing', label: 'Pricing', icon: 'icon-dollar-sign' },
    { id: 'details', label: 'Details', icon: 'icon-file-text' },
    { id: 'supplier', label: 'Supplier', icon: 'icon-truck' },
    { id: 'media', label: 'Media', icon: 'icon-image' },
    { id: 'seo', label: 'SEO', icon: 'icon-search' }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="product-form">
      <div className="form-header">
        <div className="header-left">
          <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p>{isEdit ? 'Update product information' : 'Create a new product in inventory'}</p>
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
            onClick={() => navigate('/inventory/products')}
          >
            <i className="icon-x"></i>
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form-content">
        {/* Tab Navigation */}
        <div className="form-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="form-body">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Product Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sku">SKU *</label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Product SKU"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="brand">Brand</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Product brand"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="model">Model</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Model number"
                    />
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
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the product features, specifications, and usage..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Inventory Information Tab */}
          {activeTab === 'inventory' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Inventory Management</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="quantity">Current Quantity *</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleNumberChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lowStockThreshold">Low Stock Threshold *</label>
                    <input
                      type="number"
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleNumberChange}
                      min="0"
                      required
                    />
                    <div className="help-text">Alert when stock falls below this level</div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reorderPoint">Reorder Point *</label>
                    <input
                      type="number"
                      id="reorderPoint"
                      name="reorderPoint"
                      value={formData.reorderPoint}
                      onChange={handleNumberChange}
                      min="0"
                      required
                    />
                    <div className="help-text">Automatically create purchase order at this level</div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="maxStockLevel">Max Stock Level *</label>
                    <input
                      type="number"
                      id="maxStockLevel"
                      name="maxStockLevel"
                      value={formData.maxStockLevel}
                      onChange={handleNumberChange}
                      min="0"
                      required
                    />
                    <div className="help-text">Maximum allowed stock quantity</div>
                  </div>
                </div>

                <div className="inventory-alerts">
                  <h4>Stock Status</h4>
                  <div className="alert-info">
                    {formData.quantity === 0 && (
                      <div className="alert alert-danger">
                        <i className="icon-alert-triangle"></i>
                        <strong>Out of Stock:</strong> Current quantity is 0
                      </div>
                    )}
                    {formData.quantity > 0 && formData.quantity <= formData.lowStockThreshold && (
                      <div className="alert alert-warning">
                        <i className="icon-alert-circle"></i>
                        <strong>Low Stock:</strong> Only {formData.quantity} units remaining
                      </div>
                    )}
                    {formData.quantity > formData.maxStockLevel && (
                      <div className="alert alert-info">
                        <i className="icon-info"></i>
                        <strong>Overstocked:</strong> Exceeds maximum stock level
                      </div>
                    )}
                    {formData.quantity > formData.lowStockThreshold && formData.quantity <= formData.maxStockLevel && (
                      <div className="alert alert-success">
                        <i className="icon-check-circle"></i>
                        <strong>Stock Level Normal</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isSerialized"
                        checked={formData.isSerialized}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Serialized Product
                    </label>
                    <div className="help-text">Each unit has a unique serial number</div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isBatched"
                        checked={formData.isBatched}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Batched Product
                    </label>
                    <div className="help-text">Track inventory by batch numbers</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Information Tab */}
          {activeTab === 'pricing' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Pricing Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="costPrice">Cost Price ($) *</label>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleNumberChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sellingPrice">Selling Price ($) *</label>
                    <input
                      type="number"
                      id="sellingPrice"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleNumberChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="taxRate">Tax Rate (%)</label>
                    <input
                      type="number"
                      id="taxRate"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleNumberChange}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="pricing-summary">
                  <h4>Pricing Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="label">Cost Price:</span>
                      <span className="value">{formatCurrency(formData.costPrice)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Selling Price:</span>
                      <span className="value">{formatCurrency(formData.sellingPrice)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Profit Margin:</span>
                      <span className={`value ${calculateMargin() >= 0 ? 'positive' : 'negative'}`}>
                        {calculateMargin().toFixed(2)}%
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Markup:</span>
                      <span className={`value ${calculateMarkup() >= 0 ? 'positive' : 'negative'}`}>
                        {calculateMarkup().toFixed(2)}%
                      </span>
                    </div>
                    {formData.taxRate > 0 && (
                      <div className="summary-item">
                        <span className="label">Tax Amount:</span>
                        <span className="value">
                          {formatCurrency(formData.sellingPrice * (formData.taxRate / 100))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Details Tab */}
          {activeTab === 'details' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Product Specifications</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="weight">Weight (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleNumberChange}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dimensions.length">Length (cm)</label>
                    <input
                      type="number"
                      id="dimensions.length"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dimensions.width">Width (cm)</label>
                    <input
                      type="number"
                      id="dimensions.width"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dimensions.height">Height (cm)</label>
                    <input
                      type="number"
                      id="dimensions.height"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="color">Color</label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="Product color"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="size">Size</label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="Product size"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="material">Material</label>
                    <input
                      type="text"
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      placeholder="Product material"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Product Lifecycle</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="warrantyPeriod">Warranty Period (months)</label>
                    <input
                      type="number"
                      id="warrantyPeriod"
                      name="warrantyPeriod"
                      value={formData.warrantyPeriod}
                      onChange={handleNumberChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shelfLife">Shelf Life</label>
                    <input
                      type="text"
                      id="shelfLife"
                      name="shelfLife"
                      value={formData.shelfLife}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 years, 6 months"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="storageConditions">Storage Conditions</label>
                  <textarea
                    id="storageConditions"
                    name="storageConditions"
                    value={formData.storageConditions}
                    onChange={handleInputChange}
                    placeholder="Special storage requirements..."
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="handlingInstructions">Handling Instructions</label>
                  <textarea
                    id="handlingInstructions"
                    name="handlingInstructions"
                    value={formData.handlingInstructions}
                    onChange={handleInputChange}
                    placeholder="Special handling instructions..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Supplier Information Tab */}
          {activeTab === 'supplier' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Supplier Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="supplier">Primary Supplier</label>
                    <select
                      id="supplier"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="supplierSku">Supplier SKU</label>
                    <input
                      type="text"
                      id="supplierSku"
                      name="supplierSku"
                      value={formData.supplierSku}
                      onChange={handleInputChange}
                      placeholder="Supplier's product code"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="leadTime">Lead Time (days)</label>
                    <input
                      type="number"
                      id="leadTime"
                      name="leadTime"
                      value={formData.leadTime}
                      onChange={handleNumberChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Product Images</h3>
                <div className="image-upload-section">
                  <div className="upload-area">
                    <input
                      type="file"
                      id="productImages"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <label htmlFor="productImages" className="upload-label">
                      <i className="icon-upload"></i>
                      <span>Click to upload product images</span>
                      <span className="upload-hint">Supports JPG, PNG, GIF - Max 5MB each</span>
                    </label>
                  </div>

                  {imagePreview.length > 0 && (
                    <div className="image-preview">
                      <h4>Uploaded Images ({imagePreview.length})</h4>
                      <div className="preview-grid">
                        {imagePreview.map((image, index) => (
                          <div key={index} className="preview-item">
                            <img src={image.preview || image} alt={`Product ${index + 1}`} />
                            <button
                              type="button"
                              className="btn btn--sm btn--danger remove-btn"
                              onClick={() => removeImage(index)}
                            >
                              <i className="icon-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>SEO & Marketing</h3>
                <div className="form-group">
                  <label htmlFor="metaTitle">Meta Title</label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="SEO title for search engines"
                    maxLength="60"
                  />
                  <div className="help-text">
                    {formData.metaTitle.length}/60 characters
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="metaDescription">Meta Description</label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="SEO description for search engines"
                    rows="3"
                    maxLength="160"
                  />
                  <div className="help-text">
                    {formData.metaDescription.length}/160 characters
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="keywords">Keywords</label>
                  <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="Comma-separated keywords"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Internal Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Internal notes and comments..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <div className="action-left">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/inventory/products')}
            >
              Cancel
            </button>
            {!isEdit && (
              <button
                type="button"
                className="btn btn--outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                Save as Draft
              </button>
            )}
          </div>
          <div className="action-right">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Product Preview"
        size="large"
      >
        <div className="product-preview">
          <div className="preview-header">
            <h2>{formData.name || 'Product Name'}</h2>
            <div className="preview-meta">
              <span className="sku">SKU: {formData.sku || 'N/A'}</span>
              <span className={`status-badge status-badge--${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
          
          <div className="preview-content">
            <div className="preview-section">
              <h4>Basic Information</h4>
              <div className="preview-grid">
                <div><strong>Category:</strong> {formData.category || 'N/A'}</div>
                <div><strong>Brand:</strong> {formData.brand || 'N/A'}</div>
                <div><strong>Model:</strong> {formData.model || 'N/A'}</div>
              </div>
              <div className="preview-description">
                <strong>Description:</strong>
                <p>{formData.description || 'No description provided'}</p>
              </div>
            </div>
            
            <div className="preview-section">
              <h4>Inventory & Pricing</h4>
              <div className="preview-grid">
                <div><strong>Current Stock:</strong> {formData.quantity}</div>
                <div><strong>Low Stock Threshold:</strong> {formData.lowStockThreshold}</div>
                <div><strong>Cost Price:</strong> {formatCurrency(formData.costPrice)}</div>
                <div><strong>Selling Price:</strong> {formatCurrency(formData.sellingPrice)}</div>
                <div><strong>Profit Margin:</strong> {calculateMargin().toFixed(2)}%</div>
              </div>
            </div>
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

export default ProductForm;