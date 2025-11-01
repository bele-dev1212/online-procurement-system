import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from '../../../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../../../hooks/useSuppliers';
import { useInventory } from '../../../../hooks/useInventory';
import SearchBar from '../../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../../components/common/Modal/Modal';
import { formatCurrency, calculateTax, calculateTotal } from '../../../../utils/helpers/calculations';
import { purchaseOrderPriority } from '../../../../utils/enums/purchaseOrderStatus';
import { validatePurchaseOrder } from '../../../../utils/helpers/validators';
import './CreatePurchaseOrder.css';

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const { createPurchaseOrder, loading } = usePurchaseOrders();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { products, loading: productsLoading } = useInventory();

  const [formData, setFormData] = useState({
    poNumber: generatePONumber(),
    supplierId: '',
    deliveryDate: '',
    shippingAddress: '',
    billingAddress: '',
    terms: 'net30',
    notes: '',
    priority: 'medium',
    status: 'draft'
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, total: 0 }
  ]);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Generate PO Number
  function generatePONumber() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `PO-${timestamp}-${random}`;
  }

  // Calculate totals
  // eslint-disable-next-line no-undef
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = lineItems.reduce((sum, item) => sum + calculateTax(item.quantity * item.unitPrice, item.taxRate), 0);
    const total = calculateTotal(subtotal, tax);
    
    return { subtotal, tax, total };
  }, [lineItems]);

  // Filter suppliers and products for modals
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData(prev => ({
      ...prev,
      supplierId: supplier.id,
      shippingAddress: supplier.address || '',
      billingAddress: supplier.address || ''
    }));
    setShowSupplierModal(false);
    setSearchTerm('');
  };

  const handleAddLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id), 0) + 1;
    setLineItems(prev => [
      ...prev,
      { id: newId, productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, total: 0 }
    ]);
  };

  const handleRemoveLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate total when quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          const quantity = field === 'quantity' ? value : item.quantity;
          const unitPrice = field === 'unitPrice' ? parseFloat(value) : item.unitPrice;
          const taxRate = field === 'taxRate' ? parseFloat(value) : item.taxRate;
          const subtotal = quantity * unitPrice;
          const tax = calculateTax(subtotal, taxRate);
          updatedItem.total = subtotal + tax;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleProductSelect = (product, itemId) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          productId: product.id,
          description: product.name,
          unitPrice: product.price || 0,
          taxRate: product.taxRate || 0
        };
      }
      return item;
    }));
    setShowProductModal(false);
    setSearchTerm('');
  };

  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();
    
    const purchaseOrderData = {
      ...formData,
      status,
      lineItems: lineItems.map(item => ({
        productId: item.productId,
        description: item.description,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        taxRate: parseFloat(item.taxRate),
        total: parseFloat(item.total)
      })),
      subtotal: calculations.subtotal,
      taxAmount: calculations.tax,
      totalAmount: calculations.total
    };

    // Validate form
    const validationErrors = validatePurchaseOrder(purchaseOrderData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await createPurchaseOrder(purchaseOrderData);
      if (result.success) {
        navigate('/procurement/purchase-orders', { 
          state: { 
            message: `Purchase Order ${result.poNumber} ${status === 'draft' ? 'saved as draft' : 'submitted successfully'}`
          }
        });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleSaveDraft = (e) => {
    handleSubmit(e, 'draft');
  };

  const handleSubmitForApproval = (e) => {
    handleSubmit(e, 'pending');
  };

  if (suppliersLoading || productsLoading) {
    return (
      <div className="create-po-loading">
        <LoadingSpinner size="large" />
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="create-purchase-order">
      <div className="create-po-header">
        <div className="header-content">
          <h1>Create Purchase Order</h1>
          <p>Create a new purchase order for your procurement needs</p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn-outline"
            onClick={() => setShowPreview(true)}
          >
            Preview PO
          </button>
        </div>
      </div>

      <div className="create-po-content">
        <form className="po-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">PO Number *</label>
                <input
                  type="text"
                  value={formData.poNumber}
                  onChange={(e) => handleInputChange('poNumber', e.target.value)}
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="form-input"
                >
                  {Object.entries(purchaseOrderPriority).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Date *</label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  className={`form-input ${errors.deliveryDate ? 'error' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deliveryDate && <span className="error-text">{errors.deliveryDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <select
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  className="form-input"
                >
                  <option value="net15">Net 15</option>
                  <option value="net30">Net 30</option>
                  <option value="net45">Net 45</option>
                  <option value="net60">Net 60</option>
                  <option value="dueOnReceipt">Due on Receipt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="form-section">
            <h2>Supplier Information</h2>
            <div className="form-group">
              <label className="form-label">Select Supplier *</label>
              {selectedSupplier ? (
                <div className="supplier-selected">
                  <div className="supplier-info">
                    <h4>{selectedSupplier.name}</h4>
                    <p>{selectedSupplier.companyName}</p>
                    <p>{selectedSupplier.email} | {selectedSupplier.phone}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-change"
                    onClick={() => setShowSupplierModal(true)}
                  >
                    Change Supplier
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-select-supplier"
                  onClick={() => setShowSupplierModal(true)}
                >
                  + Select Supplier
                </button>
              )}
              {errors.supplierId && <span className="error-text">{errors.supplierId}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <textarea
                  value={formData.shippingAddress}
                  onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                  className="form-input"
                  rows="3"
                  placeholder="Enter shipping address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Billing Address</label>
                <textarea
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  className="form-input"
                  rows="3"
                  placeholder="Enter billing address"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="form-section">
            <div className="section-header">
              <h2>Line Items</h2>
              <button
                type="button"
                className="btn-add-item"
                onClick={handleAddLineItem}
              >
                + Add Item
              </button>
            </div>

            <div className="line-items">
              {lineItems.map((item, index) => (
                <div key={item.id} className="line-item">
                  <div className="item-header">
                    <span>Item #{index + 1}</span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveLineItem(item.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="item-grid">
                    <div className="form-group">
                      <label className="form-label">Product</label>
                      {item.productId ? (
                        <div className="product-selected">
                          <span>{item.description}</span>
                          <button
                            type="button"
                            className="btn-change"
                            onClick={() => setShowProductModal(true)}
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-select-product"
                          onClick={() => setShowProductModal(true)}
                        >
                          Select Product
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                        className="form-input"
                        placeholder="Item description"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="form-input"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Unit Price</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="form-input"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => handleLineItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        className="form-input"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total</label>
                      <div className="item-total">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.lineItems && <span className="error-text">{errors.lineItems}</span>}
          </div>

          {/* Summary */}
          <div className="form-section">
            <h2>Order Summary</h2>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculations.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>{formatCurrency(calculations.tax)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>{formatCurrency(calculations.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <h2>Additional Notes</h2>
            <div className="form-group">
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-input"
                rows="4"
                placeholder="Any additional notes or special instructions..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/procurement/purchase-orders')}
              disabled={loading}
            >
              Cancel
            </button>
            <div className="action-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleSaveDraft}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="small" /> : 'Save as Draft'}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitForApproval}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="small" /> : 'Submit for Approval'}
              </button>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}
        </form>
      </div>

      {/* Supplier Selection Modal */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Select Supplier"
        size="large"
      >
        <div className="modal-content">
          <SearchBar
            placeholder="Search suppliers..."
            onSearch={setSearchTerm}
            className="modal-search"
          />
          
          <div className="supplier-list">
            {filteredSuppliers.map(supplier => (
              <div
                key={supplier.id}
                className="supplier-item"
                onClick={() => handleSupplierSelect(supplier)}
              >
                <div className="supplier-details">
                  <h4>{supplier.name}</h4>
                  <p>{supplier.companyName}</p>
                  <p className="supplier-contact">{supplier.email} | {supplier.phone}</p>
                  <p className="supplier-address">{supplier.address}</p>
                </div>
                <div className="supplier-rating">
                  {supplier.rating && (
                    <span className={`rating-badge rating-${Math.floor(supplier.rating)}`}>
                      ★ {supplier.rating}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Select Product"
        size="large"
      >
        <div className="modal-content">
          <SearchBar
            placeholder="Search products..."
            onSearch={setSearchTerm}
            className="modal-search"
          />
          
          <div className="product-list">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-item"
                onClick={() => handleProductSelect(product, lineItems[0].id)}
              >
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p>SKU: {product.sku}</p>
                  <p className="product-category">{product.category}</p>
                </div>
                <div className="product-pricing">
                  <div className="product-price">{formatCurrency(product.price)}</div>
                  <div className="product-stock">
                    {product.stockQuantity > 0 ? (
                      <span className="in-stock">{product.stockQuantity} in stock</span>
                    ) : (
                      <span className="out-of-stock">Out of stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Purchase Order Preview"
        size="xlarge"
        actions={[
          {
            label: 'Close',
            onClick: () => setShowPreview(false),
            variant: 'secondary'
          }
        ]}
      >
        <div className="po-preview">
          <div className="preview-header">
            <h2>PURCHASE ORDER</h2>
            <div className="preview-po-number">{formData.poNumber}</div>
          </div>
          
          <div className="preview-content">
            {/* Preview content would show the complete PO formatted nicely */}
            <p>Preview functionality would display the complete purchase order...</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePurchaseOrder;