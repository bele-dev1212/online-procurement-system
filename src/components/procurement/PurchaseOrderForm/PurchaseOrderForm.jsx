import React, { useState, useEffect } from 'react';
import './PurchaseOrderForm.css';

const PurchaseOrderForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create', // 'create' | 'edit' | 'clone'
  suppliers = [],
  products = [],
  userInfo = {},
  className = ''
}) => {
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    supplier: '',
    department: '',
    project: '',
    currency: 'USD',
    
    // Items
    items: [],
    
    // Terms & Conditions
    paymentTerms: 'net30',
    deliveryTerms: 'FOB',
    notes: '',
    termsAndConditions: '',
    
    // Approval
    requiresApproval: true,
    approvers: []
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Step definitions
  const steps = [
    { id: 1, title: 'Basic Information', icon: '📋' },
    { id: 2, title: 'Items & Pricing', icon: '📦' },
    { id: 3, title: 'Terms & Conditions', icon: '📝' },
    { id: 4, title: 'Review & Submit', icon: '👁️' }
  ];

  // Default suppliers if none provided
  const defaultSuppliers = [
    {
      id: 'S001',
      name: 'Tech Supplies Inc.',
      contact: 'John Smith',
      email: 'john@techsupplies.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, San Francisco, CA 94102',
      paymentTerms: 'net30',
      currency: 'USD',
      categories: ['Electronics', 'IT Equipment']
    },
    {
      id: 'S002',
      name: 'Office Furniture Co.',
      contact: 'Maria Garcia',
      email: 'maria@officefurniture.com',
      phone: '+1 (555) 234-5678',
      address: '456 Office Ave, New York, NY 10001',
      paymentTerms: 'net45',
      currency: 'USD',
      categories: ['Furniture', 'Office Supplies']
    },
    {
      id: 'S003',
      name: 'Industrial Supplies Corp.',
      contact: 'Robert Brown',
      email: 'robert@industrialsupplies.com',
      phone: '+1 (555) 345-6789',
      address: '789 Industrial Blvd, Chicago, IL 60601',
      paymentTerms: 'net15',
      currency: 'USD',
      categories: ['Industrial', 'Safety Equipment']
    }
  ];

  // Default products if none provided
  const defaultProducts = [
    {
      id: 'P001',
      name: 'Laptop Dell XPS 13',
      sku: 'DLXPS13-001',
      category: 'Electronics',
      unitPrice: 1200,
      currency: 'USD',
      supplier: 'S001',
      description: '13-inch laptop with Intel i7 processor, 16GB RAM, 512GB SSD',
      inStock: true
    },
    {
      id: 'P002',
      name: 'Monitor 24" LED',
      sku: 'MON24LED-001',
      category: 'Electronics',
      unitPrice: 300,
      currency: 'USD',
      supplier: 'S001',
      description: '24-inch LED monitor, 1920x1080 resolution',
      inStock: true
    },
    {
      id: 'P003',
      name: 'Ergonomic Chair',
      sku: 'ERGCHAIR-001',
      category: 'Furniture',
      unitPrice: 250,
      currency: 'USD',
      supplier: 'S002',
      description: 'Adjustable ergonomic office chair with lumbar support',
      inStock: true
    },
    {
      id: 'P004',
      name: 'Standing Desk',
      sku: 'STDESK-001',
      category: 'Furniture',
      unitPrice: 400,
      currency: 'USD',
      supplier: 'S002',
      description: 'Electric height-adjustable standing desk',
      inStock: false
    },
    {
      id: 'P005',
      name: 'Safety Equipment Set',
      sku: 'SAFESET-001',
      category: 'Safety',
      unitPrice: 150,
      currency: 'USD',
      supplier: 'S003',
      description: 'Complete safety equipment set including helmet, gloves, and vest',
      inStock: true
    }
  ];

  const suppliersToUse = suppliers.length > 0 ? suppliers : defaultSuppliers;
  const productsToUse = products.length > 0 ? products : defaultProducts;

  // Default user info
  const defaultUserInfo = {
    id: 'U001',
    name: 'John Procurement',
    email: 'john.procurement@company.com',
    department: 'Procurement',
    role: 'Procurement Manager'
  };

  const userInfoToUse = { ...defaultUserInfo, ...userInfo };

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        poDate: initialData.poDate || new Date().toISOString().split('T')[0]
      }));
      
      if (initialData.supplier) {
        const supplier = suppliersToUse.find(s => s.id === initialData.supplier);
        setSelectedSupplier(supplier);
      }
    } else if (mode === 'create') {
      // Generate PO number
      const today = new Date();
      const poNumber = `PO-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        poNumber,
        department: userInfoToUse.department
      }));
    }
  }, [initialData, mode, suppliersToUse, userInfoToUse]);

  // Update available products when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      const supplierProducts = productsToUse.filter(product => 
        product.supplier === selectedSupplier.id
      );
      setAvailableProducts(supplierProducts);
    } else {
      setAvailableProducts([]);
    }
  }, [selectedSupplier, productsToUse]);

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.poNumber.trim()) newErrors.poNumber = 'PO Number is required';
        if (!formData.poDate) newErrors.poDate = 'PO Date is required';
        if (!formData.expectedDelivery) newErrors.expectedDelivery = 'Expected Delivery Date is required';
        if (!formData.supplier) newErrors.supplier = 'Supplier is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (formData.expectedDelivery && formData.poDate && new Date(formData.expectedDelivery) <= new Date(formData.poDate)) {
          newErrors.expectedDelivery = 'Delivery date must be after PO date';
        }
        break;

      case 2:
        if (formData.items.length === 0) {
          newErrors.items = 'At least one item is required';
        } else {
          formData.items.forEach((item, index) => {
            if (!item.product) newErrors[`items[${index}].product`] = 'Product is required';
            if (!item.quantity || item.quantity <= 0) newErrors[`items[${index}].quantity`] = 'Valid quantity is required';
            if (!item.unitPrice || item.unitPrice <= 0) newErrors[`items[${index}].unitPrice`] = 'Valid unit price is required';
          });
        }
        break;

      case 3:
        if (!formData.paymentTerms) newErrors.paymentTerms = 'Payment terms are required';
        if (!formData.deliveryTerms) newErrors.deliveryTerms = 'Delivery terms are required';
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliersToUse.find(s => s.id === supplierId);
    setSelectedSupplier(supplier);
    handleInputChange('supplier', supplierId);
    
    // Update currency and payment terms based on supplier
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        currency: supplier.currency || 'USD',
        paymentTerms: supplier.paymentTerms || 'net30'
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate total if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].total = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Clear item errors
    if (errors[`items[${index}].${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`items[${index}].${field}`]: ''
      }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          product: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
          unit: 'pcs'
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleProductSelect = (index, productId) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      handleItemChange(index, 'product', productId);
      handleItemChange(index, 'description', product.description);
      handleItemChange(index, 'unitPrice', product.unitPrice);
      handleItemChange(index, 'sku', product.sku);
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      const submissionData = {
        ...formData,
        totalAmount: formData.items.reduce((sum, item) => sum + (item.total || 0), 0),
        createdBy: userInfoToUse.name,
        createdAt: new Date().toISOString(),
        status: formData.requiresApproval ? 'pending_approval' : 'draft'
      };

      onSubmit?.(submissionData);
    }
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency
    }).format(amount);
  };

  // Render steps
  const renderStep1 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Basic Information</h3>
        <p>Enter the basic details for your purchase order</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="poNumber" className="form-label required">
            PO Number
          </label>
          <input
            id="poNumber"
            type="text"
            value={formData.poNumber}
            onChange={(e) => handleInputChange('poNumber', e.target.value)}
            className={`form-input ${errors.poNumber ? 'error' : ''}`}
            placeholder="e.g., PO-2024-001"
            disabled={mode === 'edit'}
          />
          {errors.poNumber && <div className="error-message">{errors.poNumber}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="poDate" className="form-label required">
            PO Date
          </label>
          <input
            id="poDate"
            type="date"
            value={formData.poDate}
            onChange={(e) => handleInputChange('poDate', e.target.value)}
            className={`form-input ${errors.poDate ? 'error' : ''}`}
          />
          {errors.poDate && <div className="error-message">{errors.poDate}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="expectedDelivery" className="form-label required">
            Expected Delivery
          </label>
          <input
            id="expectedDelivery"
            type="date"
            value={formData.expectedDelivery}
            onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
            className={`form-input ${errors.expectedDelivery ? 'error' : ''}`}
          />
          {errors.expectedDelivery && <div className="error-message">{errors.expectedDelivery}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="currency" className="form-label required">
            Currency
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="form-select"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="supplier" className="form-label required">
            Supplier
          </label>
          <select
            id="supplier"
            value={formData.supplier}
            onChange={(e) => handleSupplierChange(e.target.value)}
            className={`form-select ${errors.supplier ? 'error' : ''}`}
          >
            <option value="">Select a supplier</option>
            {suppliersToUse.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplier && <div className="error-message">{errors.supplier}</div>}
          
          {selectedSupplier && (
            <div className="supplier-details">
              <div className="supplier-contact">
                <strong>Contact:</strong> {selectedSupplier.contact}
              </div>
              <div className="supplier-email">
                <strong>Email:</strong> {selectedSupplier.email}
              </div>
              <div className="supplier-phone">
                <strong>Phone:</strong> {selectedSupplier.phone}
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="department" className="form-label required">
            Department
          </label>
          <select
            id="department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className={`form-select ${errors.department ? 'error' : ''}`}
          >
            <option value="">Select department</option>
            <option value="Procurement">Procurement</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
          {errors.department && <div className="error-message">{errors.department}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="project" className="form-label">
            Project / Cost Center
          </label>
          <input
            id="project"
            type="text"
            value={formData.project}
            onChange={(e) => handleInputChange('project', e.target.value)}
            className="form-input"
            placeholder="e.g., Project Alpha"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Items & Pricing</h3>
        <p>Add items to your purchase order</p>
      </div>

      {errors.items && <div className="error-message full-width">{errors.items}</div>}

      <div className="items-section">
        <div className="items-header">
          <h4>Order Items</h4>
          <button
            type="button"
            className="add-item-btn"
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>

        {formData.items.length === 0 ? (
          <div className="empty-items">
            <div className="empty-icon">📦</div>
            <p>No items added yet</p>
            <button
              type="button"
              className="add-item-btn primary"
              onClick={handleAddItem}
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="items-list">
            {formData.items.map((item, index) => (
              <div key={item.id} className="item-row">
                <div className="item-number">{index + 1}</div>
                
                <div className="item-fields">
                  <div className="form-group">
                    <label className="form-label required">Product</label>
                    <select
                      value={item.product}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className={`form-select ${errors[`items[${index}].product`] ? 'error' : ''}`}
                    >
                      <option value="">Select product</option>
                      {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.unitPrice)}
                        </option>
                      ))}
                    </select>
                    {errors[`items[${index}].product`] && (
                      <div className="error-message">{errors[`items[${index}].product`]}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="form-textarea"
                      rows="2"
                      placeholder="Product description"
                    />
                  </div>

                  <div className="item-details">
                    <div className="form-group">
                      <label className="form-label required">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={`form-input ${errors[`items[${index}].quantity`] ? 'error' : ''}`}
                      />
                      {errors[`items[${index}].quantity`] && (
                        <div className="error-message">{errors[`items[${index}].quantity`]}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="form-select"
                      >
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="m">Meters</option>
                        <option value="l">Liters</option>
                        <option value="set">Set</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className={`form-input ${errors[`items[${index}].unitPrice`] ? 'error' : ''}`}
                      />
                      {errors[`items[${index}].unitPrice`] && (
                        <div className="error-message">{errors[`items[${index}].unitPrice`]}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total</label>
                      <div className="item-total">
                        {formatCurrency(item.total || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => handleRemoveItem(index)}
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {formData.items.length > 0 && (
          <div className="order-summary">
            <h4>Order Summary</h4>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Terms & Conditions</h3>
        <p>Specify payment and delivery terms</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="paymentTerms" className="form-label required">
            Payment Terms
          </label>
          <select
            id="paymentTerms"
            value={formData.paymentTerms}
            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
            className={`form-select ${errors.paymentTerms ? 'error' : ''}`}
          >
            <option value="net15">Net 15 Days</option>
            <option value="net30">Net 30 Days</option>
            <option value="net45">Net 45 Days</option>
            <option value="net60">Net 60 Days</option>
            <option value="dueOnReceipt">Due on Receipt</option>
          </select>
          {errors.paymentTerms && <div className="error-message">{errors.paymentTerms}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="deliveryTerms" className="form-label required">
            Delivery Terms
          </label>
          <select
            id="deliveryTerms"
            value={formData.deliveryTerms}
            onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
            className={`form-select ${errors.deliveryTerms ? 'error' : ''}`}
          >
            <option value="FOB">FOB (Free On Board)</option>
            <option value="CIF">CIF (Cost, Insurance & Freight)</option>
            <option value="EXW">EXW (Ex Works)</option>
            <option value="DDP">DDP (Delivered Duty Paid)</option>
          </select>
          {errors.deliveryTerms && <div className="error-message">{errors.deliveryTerms}</div>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes" className="form-label">
            Notes / Special Instructions
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-textarea"
            rows="3"
            placeholder="Any special instructions or notes for the supplier..."
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="termsAndConditions" className="form-label">
            Terms & Conditions
          </label>
          <textarea
            id="termsAndConditions"
            value={formData.termsAndConditions}
            onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
            className="form-textarea"
            rows="4"
            placeholder="Standard terms and conditions..."
          />
        </div>

        <div className="form-group full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.requiresApproval}
              onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkmark"></span>
            This purchase order requires approval
          </label>
          <div className="checkbox-description">
            If checked, the PO will be submitted for approval before being sent to the supplier.
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Review & Submit</h3>
        <p>Review your purchase order before submitting</p>
      </div>

      <div className="review-section">
        <div className="review-grid">
          <div className="review-card">
            <h4>Basic Information</h4>
            <div className="review-item">
              <span>PO Number:</span>
              <strong>{formData.poNumber}</strong>
            </div>
            <div className="review-item">
              <span>PO Date:</span>
              <span>{new Date(formData.poDate).toLocaleDateString()}</span>
            </div>
            <div className="review-item">
              <span>Expected Delivery:</span>
              <span>{new Date(formData.expectedDelivery).toLocaleDateString()}</span>
            </div>
            <div className="review-item">
              <span>Supplier:</span>
              <span>{selectedSupplier?.name}</span>
            </div>
            <div className="review-item">
              <span>Department:</span>
              <span>{formData.department}</span>
            </div>
            <div className="review-item">
              <span>Currency:</span>
              <span>{formData.currency}</span>
            </div>
          </div>

          <div className="review-card">
            <h4>Order Summary</h4>
            <div className="review-items">
              {formData.items.map((item) => (
                <div key={item.id} className="review-item-row">
                  <div className="item-info">
                    <div className="item-name">
                      {availableProducts.find(p => p.id === item.product)?.name || 'Product'}
                    </div>
                    <div className="item-details">
                      {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="item-total">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
            <div className="review-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="review-card">
            <h4>Terms & Conditions</h4>
            <div className="review-item">
              <span>Payment Terms:</span>
              <span>{formData.paymentTerms}</span>
            </div>
            <div className="review-item">
              <span>Delivery Terms:</span>
              <span>{formData.deliveryTerms}</span>
            </div>
            <div className="review-item">
              <span>Requires Approval:</span>
              <span>{formData.requiresApproval ? 'Yes' : 'No'}</span>
            </div>
            {formData.notes && (
              <div className="review-item full-width">
                <span>Notes:</span>
                <span>{formData.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="submit-notes">
          <div className="note-item">
            <span className="note-icon">💡</span>
            <span>Review all information carefully before submitting</span>
          </div>
          <div className="note-item">
            <span className="note-icon">⏳</span>
            <span>
              {formData.requiresApproval 
                ? 'This PO will be submitted for approval' 
                : 'This PO will be created as a draft'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`purchase-order-form ${className}`}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="form-header">
          <h2 className="form-title">
            {mode === 'create' && 'Create Purchase Order'}
            {mode === 'edit' && 'Edit Purchase Order'}
            {mode === 'clone' && 'Clone Purchase Order'}
          </h2>
          <div className="form-subtitle">
            {formData.poNumber && `PO: ${formData.poNumber}`}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={step.id} className="step-container">
              <div 
                className={`step-circle ${currentStep >= step.id ? 'active' : ''} ${
                  currentStep === step.id ? 'current' : ''
                }`}
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
              >
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              <div className="step-label">{step.title}</div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="form-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <div className="actions-left">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrevStep}
                disabled={loading}
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="actions-right">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={loading}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className={`btn btn-success ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    {formData.requiresApproval ? 'Submitting for Approval...' : 'Creating PO...'}
                  </>
                ) : (
                  formData.requiresApproval ? 'Submit for Approval' : 'Create Purchase Order'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;