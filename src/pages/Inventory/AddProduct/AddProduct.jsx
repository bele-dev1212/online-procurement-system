import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../../hooks/useInventory';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct, categories, loading, fetchCategories } = useInventory();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unitPrice: '',
    costPrice: '',
    quantity: '',
    minStockLevel: '',
    maxStockLevel: '',
    supplier: '',
    supplierSku: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    isActive: true,
    isTaxable: true,
    taxRate: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newProductId, setNewProductId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSKU = () => {
    const prefix = 'PROD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleAutoGenerateSKU = () => {
    setFormData(prev => ({
      ...prev,
      sku: generateSKU()
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      errors.unitPrice = 'Valid unit price is required';
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      errors.costPrice = 'Valid cost price is required';
    }

    if (parseFloat(formData.unitPrice) < parseFloat(formData.costPrice)) {
      errors.unitPrice = 'Unit price cannot be less than cost price';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      errors.quantity = 'Valid quantity is required';
    }

    if (formData.minStockLevel && parseInt(formData.minStockLevel) < 0) {
      errors.minStockLevel = 'Minimum stock level cannot be negative';
    }

    if (formData.maxStockLevel && parseInt(formData.maxStockLevel) < parseInt(formData.minStockLevel)) {
      errors.maxStockLevel = 'Maximum stock level must be greater than minimum';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('Please fix the form errors', 'error');
      return;
    }

    try {
      const productData = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        costPrice: parseFloat(formData.costPrice),
        quantity: parseInt(formData.quantity),
        minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : 0,
        maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : 0,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null
        }
      };

      const result = await addProduct(productData);
      
      if (result.success) {
        setNewProductId(result.product.id);
        setShowSuccessModal(true);
        addNotification('Product added successfully!', 'success');
      }
    } catch (err) {
      addNotification('Failed to add product: ' + err.message, 'error');
    }
  };

  const handleViewProduct = () => {
    navigate(`/inventory/products/${newProductId}`);
  };

  const handleAddAnother = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      unitPrice: '',
      costPrice: '',
      quantity: '',
      minStockLevel: '',
      maxStockLevel: '',
      supplier: '',
      supplierSku: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      isActive: true,
      isTaxable: true,
      taxRate: ''
    });
    setShowSuccessModal(false);
    setNewProductId(null);
  };

  const calculateProfitMargin = () => {
    if (formData.unitPrice && formData.costPrice) {
      const unitPrice = parseFloat(formData.unitPrice);
      const costPrice = parseFloat(formData.costPrice);
      const margin = ((unitPrice - costPrice) / unitPrice) * 100;
      return isNaN(margin) ? 0 : margin.toFixed(2);
    }
    return 0;
  };

  if (loading && !categories.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1>Add New Product</h1>
        <p>Add a new product to your inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-sections">
          {/* Basic Information Section */}
          <section className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="required">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={validationErrors.name ? 'error' : ''}
                  placeholder="Enter product name"
                />
                {validationErrors.name && (
                  <span className="error-message">{validationErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="sku" className="required">SKU</label>
                <div className="sku-input-group">
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={validationErrors.sku ? 'error' : ''}
                    placeholder="Product SKU"
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateSKU}
                    className="generate-sku-btn"
                  >
                    Generate
                  </button>
                </div>
                {validationErrors.sku && (
                  <span className="error-message">{validationErrors.sku}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category" className="required">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={validationErrors.category ? 'error' : ''}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category && (
                  <span className="error-message">{validationErrors.category}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </section>

          {/* Pricing & Stock Section */}
          <section className="form-section">
            <h2>Pricing & Stock Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="costPrice" className="required">Cost Price ($)</label>
                <input
                  type="number"
                  id="costPrice"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={validationErrors.costPrice ? 'error' : ''}
                  placeholder="0.00"
                />
                {validationErrors.costPrice && (
                  <span className="error-message">{validationErrors.costPrice}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="unitPrice" className="required">Unit Price ($)</label>
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={validationErrors.unitPrice ? 'error' : ''}
                  placeholder="0.00"
                />
                {validationErrors.unitPrice && (
                  <span className="error-message">{validationErrors.unitPrice}</span>
                )}
              </div>

              <div className="form-group">
                <label>Profit Margin</label>
                <div className="profit-margin-display">
                  {calculateProfitMargin()}%
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="quantity" className="required">Initial Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className={validationErrors.quantity ? 'error' : ''}
                  placeholder="0"
                />
                {validationErrors.quantity && (
                  <span className="error-message">{validationErrors.quantity}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="minStockLevel">Minimum Stock Level</label>
                <input
                  type="number"
                  id="minStockLevel"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                  min="0"
                  className={validationErrors.minStockLevel ? 'error' : ''}
                  placeholder="0"
                />
                {validationErrors.minStockLevel && (
                  <span className="error-message">{validationErrors.minStockLevel}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="maxStockLevel">Maximum Stock Level</label>
                <input
                  type="number"
                  id="maxStockLevel"
                  name="maxStockLevel"
                  value={formData.maxStockLevel}
                  onChange={handleInputChange}
                  min="0"
                  className={validationErrors.maxStockLevel ? 'error' : ''}
                  placeholder="No limit"
                />
                {validationErrors.maxStockLevel && (
                  <span className="error-message">{validationErrors.maxStockLevel}</span>
                )}
              </div>
            </div>
          </section>

          {/* Additional Information Section */}
          <section className="form-section">
            <h2>Additional Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="supplier">Supplier</label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="Supplier name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="supplierSku">Supplier SKU</label>
                <input
                  type="text"
                  id="supplierSku"
                  name="supplierSku"
                  value={formData.supplierSku}
                  onChange={handleInputChange}
                  placeholder="Supplier's SKU"
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Dimensions (cm)</label>
                <div className="dimensions-group">
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleInputChange}
                    placeholder="Length"
                    step="0.1"
                    min="0"
                  />
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleInputChange}
                    placeholder="Width"
                    step="0.1"
                    min="0"
                  />
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleInputChange}
                    placeholder="Height"
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Settings Section */}
          <section className="form-section">
            <h2>Product Settings</h2>
            <div className="form-grid">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Active Product
                </label>
                <p className="checkbox-help">Inactive products won't be available for sale</p>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isTaxable"
                    checked={formData.isTaxable}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Taxable Product
                </label>
              </div>

              {formData.isTaxable && (
                <div className="form-group">
                  <label htmlFor="taxRate">Tax Rate (%)</label>
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Add Product'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Product Added Successfully"
      >
        <div className="success-modal-content">
          <div className="success-icon">✓</div>
          <p>Your product has been added to the inventory successfully.</p>
          <div className="success-actions">
            <button onClick={handleViewProduct} className="btn-primary">
              View Product
            </button>
            <button onClick={handleAddAnother} className="btn-secondary">
              Add Another Product
            </button>
            <button 
              onClick={() => navigate('/inventory')} 
              className="btn-outline"
            >
              Back to Inventory
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddProduct;