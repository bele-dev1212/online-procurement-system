import React, { useState, useEffect } from 'react';
import './BidForm.css';

const BidForm = ({ bidId, onSave, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    rfqId: '',
    bidTitle: '',
    bidDescription: '',
    supplierId: '',
    
    // Bid Details
    bidAmount: '',
    currency: 'USD',
    validityPeriod: 30,
    deliveryDate: '',
    paymentTerms: 'net30',
    incoterms: 'EXW',
    
    // Line Items
    items: [
      {
        id: 1,
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: '',
        unit: 'pcs',
        total: 0
      }
    ],
    
    // Terms & Conditions
    termsAndConditions: '',
    specialNotes: '',
    
    // Documents
    documents: [],
    
    // Submission
    submissionDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [suppliers, setSuppliers] = useState([]);
  const [rfqs, setRfqs] = useState([]);

  // Mock data - replace with actual API calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockSuppliers = [
    { id: 'SUPP-001', name: 'TechCorp Inc.', rating: 4.8, category: 'Electronics' },
    { id: 'SUPP-002', name: 'OfficeWorld Ltd', rating: 4.6, category: 'Office Supplies' },
    { id: 'SUPP-003', name: 'CompuGlobal Ltd', rating: 4.2, category: 'Electronics' },
    { id: 'SUPP-004', name: 'SoftSolutions Corp', rating: 4.4, category: 'Software' },
    { id: 'SUPP-005', name: 'FurniturePro Inc', rating: 4.1, category: 'Furniture' }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockRfqs = [
    { id: 'RFQ-2024-015', title: 'Laptop Procurement Q1 2024', category: 'Electronics', deadline: '2024-02-15' },
    { id: 'RFQ-2024-016', title: 'Office Furniture Supply', category: 'Furniture', deadline: '2024-02-14' },
    { id: 'RFQ-2024-017', title: 'Software License Renewal', category: 'Software', deadline: '2024-03-13' },
    { id: 'RFQ-2024-018', title: 'Network Equipment Upgrade', category: 'Electronics', deadline: '2024-03-12' }
  ];

  useEffect(() => {
    // Load suppliers and RFQs
    setSuppliers(mockSuppliers);
    setRfqs(mockRfqs);

    // If editing existing bid, load bid data
    if (mode === 'edit' && bidId) {
      loadBidData(bidId);
    }
  }, [mode, bidId, mockSuppliers, mockRfqs]);

  const loadBidData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      // const response = await biddingAPI.getBid(id);
      // setFormData(response.data);
      
      // Mock bid data for editing
      setTimeout(() => {
        setFormData({
          rfqId: 'RFQ-2024-015',
          bidTitle: 'Laptop Procurement Bid - TechCorp',
          bidDescription: 'Comprehensive bid for laptop procurement including warranty and support services.',
          supplierId: 'SUPP-001',
          bidAmount: '125000',
          currency: 'USD',
          validityPeriod: 45,
          deliveryDate: '2024-03-15',
          paymentTerms: 'net45',
          incoterms: 'DDP',
          items: [
            {
              id: 1,
              itemName: 'Dell XPS 13',
              description: '13-inch business laptop with Intel i7, 16GB RAM, 512GB SSD',
              quantity: 50,
              unitPrice: '1200',
              unit: 'pcs',
              total: 60000
            },
            {
              id: 2,
              itemName: 'Dell XPS 15',
              description: '15-inch performance laptop with Intel i9, 32GB RAM, 1TB SSD',
              quantity: 25,
              unitPrice: '1800',
              unit: 'pcs',
              total: 45000
            },
            {
              id: 3,
              itemName: 'Extended Warranty',
              description: '3-year extended warranty with on-site support',
              quantity: 75,
              unitPrice: '200',
              unit: 'pcs',
              total: 15000
            }
          ],
          termsAndConditions: 'Prices are valid for 45 days. Delivery within 30 days of order confirmation. Warranty includes on-site support.',
          specialNotes: 'Bulk discount applied. Early payment discount of 2% available for payments within 15 days.',
          documents: [
            { name: 'Technical_Specifications.pdf', size: '2.4 MB' },
            { name: 'Commercial_Offer.pdf', size: '1.8 MB' }
          ],
          submissionDate: '2024-01-15'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading bid:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate total if quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].total = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Recalculate total bid amount
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    setFormData(prev => ({
      ...prev,
      bidAmount: totalAmount.toFixed(2)
    }));
  };

  const addItem = () => {
    const newItem = {
      id: formData.items.length + 1,
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: '',
      unit: 'pcs',
      total: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));

      // Recalculate total bid amount
      const totalAmount = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
      setFormData(prev => ({
        ...prev,
        bidAmount: totalAmount.toFixed(2)
      }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      file: file
    }));

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (index) => {
    const updatedDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      documents: updatedDocuments
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information Validation
    if (!formData.rfqId) newErrors.rfqId = 'RFQ selection is required';
    if (!formData.bidTitle.trim()) newErrors.bidTitle = 'Bid title is required';
    if (!formData.supplierId) newErrors.supplierId = 'Supplier selection is required';
    if (!formData.bidDescription.trim()) newErrors.bidDescription = 'Bid description is required';

    // Bid Details Validation
    if (!formData.bidAmount || parseFloat(formData.bidAmount) <= 0) {
      newErrors.bidAmount = 'Valid bid amount is required';
    }
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';

    // Items Validation
    formData.items.forEach((item, index) => {
      if (!item.itemName.trim()) {
        newErrors[`itemName_${index}`] = 'Item name is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`quantity_${index}`] = 'Valid quantity is required';
      }
      if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) {
        newErrors[`unitPrice_${index}`] = 'Valid unit price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[data-field="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        bidAmount: parseFloat(formData.bidAmount),
        items: formData.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total)
        })),
        status: mode === 'create' ? 'draft' : 'submitted',
        lastUpdated: new Date().toISOString()
      };

      // In real implementation:
      // if (mode === 'create') {
      //   await biddingAPI.createBid(submissionData);
      // } else {
      //   await biddingAPI.updateBid(bidId, submissionData);
      // }

      console.log('Bid submitted:', submissionData);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        if (onSave) {
          onSave(submissionData);
        }
        
        // Show success message
        alert(`Bid ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      }, 1500);

    } catch (error) {
      console.error('Error submitting bid:', error);
      setLoading(false);
      alert('Error submitting bid. Please try again.');
    }
  };

  const handleSaveDraft = () => {
    // Save as draft without validation
    const draftData = {
      ...formData,
      status: 'draft',
      lastUpdated: new Date().toISOString()
    };

    console.log('Draft saved:', draftData);
    alert('Draft saved successfully!');
    
    if (onSave) {
      onSave(draftData);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: '📋' },
    { id: 'items', label: 'Line Items', icon: '📦' },
    { id: 'terms', label: 'Terms & Conditions', icon: '📝' },
    { id: 'documents', label: 'Documents', icon: '📎' },
    { id: 'review', label: 'Review & Submit', icon: '👁️' }
  ];

  const paymentTermsOptions = [
    { value: 'net15', label: 'Net 15 Days' },
    { value: 'net30', label: 'Net 30 Days' },
    { value: 'net45', label: 'Net 45 Days' },
    { value: 'net60', label: 'Net 60 Days' },
    { value: 'advance', label: 'Advance Payment' },
    { value: 'custom', label: 'Custom Terms' }
  ];

  const incotermsOptions = [
    { value: 'EXW', label: 'EXW (Ex Works)' },
    { value: 'FCA', label: 'FCA (Free Carrier)' },
    { value: 'FOB', label: 'FOB (Free On Board)' },
    { value: 'CIF', label: 'CIF (Cost, Insurance & Freight)' },
    { value: 'DAP', label: 'DAP (Delivered At Place)' },
    { value: 'DDP', label: 'DDP (Delivered Duty Paid)' }
  ];

  const unitOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'units', label: 'Units' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'lb', label: 'Pounds' },
    { value: 'm', label: 'Meters' },
    { value: 'ft', label: 'Feet' },
    { value: 'set', label: 'Set' },
    { value: 'lot', label: 'Lot' }
  ];

  if (loading && mode === 'edit') {
    return (
      <div className="bid-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading bid data...</p>
      </div>
    );
  }

  return (
    <div className="bid-form">
      <div className="form-header">
        <h1>{mode === 'create' ? 'Create New Bid' : 'Edit Bid'}</h1>
        <p>Complete all required information to submit your bid</p>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          {/* Basic Information Section */}
          {activeSection === 'basic' && (
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-grid">
                <div className="form-group" data-field="rfqId">
                  <label htmlFor="rfqId">RFQ Reference *</label>
                  <select
                    id="rfqId"
                    value={formData.rfqId}
                    onChange={(e) => handleInputChange('rfqId', e.target.value)}
                    className={errors.rfqId ? 'error' : ''}
                  >
                    <option value="">Select RFQ</option>
                    {rfqs.map(rfq => (
                      <option key={rfq.id} value={rfq.id}>
                        {rfq.id} - {rfq.title} (Deadline: {new Date(rfq.deadline).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  {errors.rfqId && <span className="error-message">{errors.rfqId}</span>}
                </div>

                <div className="form-group" data-field="supplierId">
                  <label htmlFor="supplierId">Supplier *</label>
                  <select
                    id="supplierId"
                    value={formData.supplierId}
                    onChange={(e) => handleInputChange('supplierId', e.target.value)}
                    className={errors.supplierId ? 'error' : ''}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} ⭐ {supplier.rating} - {supplier.category}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && <span className="error-message">{errors.supplierId}</span>}
                </div>

                <div className="form-group full-width" data-field="bidTitle">
                  <label htmlFor="bidTitle">Bid Title *</label>
                  <input
                    type="text"
                    id="bidTitle"
                    value={formData.bidTitle}
                    onChange={(e) => handleInputChange('bidTitle', e.target.value)}
                    placeholder="Enter a descriptive title for your bid"
                    className={errors.bidTitle ? 'error' : ''}
                  />
                  {errors.bidTitle && <span className="error-message">{errors.bidTitle}</span>}
                </div>

                <div className="form-group full-width" data-field="bidDescription">
                  <label htmlFor="bidDescription">Bid Description *</label>
                  <textarea
                    id="bidDescription"
                    value={formData.bidDescription}
                    onChange={(e) => handleInputChange('bidDescription', e.target.value)}
                    placeholder="Provide a detailed description of your bid proposal"
                    rows="4"
                    className={errors.bidDescription ? 'error' : ''}
                  />
                  {errors.bidDescription && <span className="error-message">{errors.bidDescription}</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group" data-field="bidAmount">
                  <label htmlFor="bidAmount">Total Bid Amount *</label>
                  <div className="amount-input">
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="currency-select"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                    <input
                      type="number"
                      id="bidAmount"
                      value={formData.bidAmount}
                      onChange={(e) => handleInputChange('bidAmount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={errors.bidAmount ? 'error' : ''}
                    />
                  </div>
                  {errors.bidAmount && <span className="error-message">{errors.bidAmount}</span>}
                </div>

                <div className="form-group" data-field="validityPeriod">
                  <label htmlFor="validityPeriod">Bid Validity (Days)</label>
                  <input
                    type="number"
                    id="validityPeriod"
                    value={formData.validityPeriod}
                    onChange={(e) => handleInputChange('validityPeriod', e.target.value)}
                    min="1"
                    max="365"
                  />
                </div>

                <div className="form-group" data-field="deliveryDate">
                  <label htmlFor="deliveryDate">Delivery Date *</label>
                  <input
                    type="date"
                    id="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                    className={errors.deliveryDate ? 'error' : ''}
                  />
                  {errors.deliveryDate && <span className="error-message">{errors.deliveryDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="submissionDate">Submission Date</label>
                  <input
                    type="date"
                    id="submissionDate"
                    value={formData.submissionDate}
                    onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="paymentTerms">Payment Terms</label>
                  <select
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  >
                    {paymentTermsOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="incoterms">Incoterms</label>
                  <select
                    id="incoterms"
                    value={formData.incoterms}
                    onChange={(e) => handleInputChange('incoterms', e.target.value)}
                  >
                    {incotermsOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Line Items Section */}
          {activeSection === 'items' && (
            <div className="form-section">
              <h2>Line Items</h2>
              <p className="section-description">
                Add all items included in your bid. The total amount will be calculated automatically.
              </p>

              <div className="items-container">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="item-row">
                    <div className="item-header">
                      <h4>Item #{index + 1}</h4>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => removeItem(index)}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <div className="item-grid">
                      <div className="form-group" data-field={`itemName_${index}`}>
                        <label>Item Name *</label>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          placeholder="Enter item name"
                          className={errors[`itemName_${index}`] ? 'error' : ''}
                        />
                        {errors[`itemName_${index}`] && (
                          <span className="error-message">{errors[`itemName_${index}`]}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>

                      <div className="form-group" data-field={`quantity_${index}`}>
                        <label>Quantity *</label>
                        <div className="quantity-input">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            min="1"
                            step="1"
                            className={errors[`quantity_${index}`] ? 'error' : ''}
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          >
                            {unitOptions.map(unit => (
                              <option key={unit.value} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[`quantity_${index}`] && (
                          <span className="error-message">{errors[`quantity_${index}`]}</span>
                        )}
                      </div>

                      <div className="form-group" data-field={`unitPrice_${index}`}>
                        <label>Unit Price *</label>
                        <div className="price-input">
                          <span className="currency-symbol">$</span>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className={errors[`unitPrice_${index}`] ? 'error' : ''}
                          />
                        </div>
                        {errors[`unitPrice_${index}`] && (
                          <span className="error-message">{errors[`unitPrice_${index}`]}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Total</label>
                        <div className="total-display">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-add-item"
                onClick={addItem}
              >
                + Add Another Item
              </button>

              <div className="items-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Bid Amount:</span>
                  <span>${formData.bidAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Section */}
          {activeSection === 'terms' && (
            <div className="form-section">
              <h2>Terms & Conditions</h2>

              <div className="form-group full-width">
                <label htmlFor="termsAndConditions">Terms and Conditions</label>
                <textarea
                  id="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                  placeholder="Specify your terms and conditions, including warranty, support, and other relevant information..."
                  rows="6"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="specialNotes">Special Notes</label>
                <textarea
                  id="specialNotes"
                  value={formData.specialNotes}
                  onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                  placeholder="Add any special notes, discounts, or additional information for the buyer..."
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* Documents Section */}
          {activeSection === 'documents' && (
            <div className="form-section">
              <h2>Supporting Documents</h2>
              <p className="section-description">
                Upload any supporting documents for your bid (technical specifications, certifications, etc.)
              </p>

              <div className="documents-upload">
                <div className="upload-area">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="fileUpload" className="upload-label">
                    <div className="upload-icon">📎</div>
                    <div className="upload-text">
                      <strong>Click to upload files</strong>
                      <span>or drag and drop</span>
                      <small>PDF, DOC, DOCX, XLS, XLSX (Max 10MB each)</small>
                    </div>
                  </label>
                </div>

                {formData.documents.length > 0 && (
                  <div className="documents-list">
                    <h4>Uploaded Documents</h4>
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-size">{doc.size}</span>
                        <button
                          type="button"
                          className="btn-remove-doc"
                          onClick={() => removeDocument(index)}
                          title="Remove document"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review & Submit Section */}
          {activeSection === 'review' && (
            <div className="form-section">
              <h2>Review & Submit</h2>
              <p className="section-description">
                Please review all information before submitting your bid.
              </p>

              <div className="review-summary">
                <div className="review-section">
                  <h3>Basic Information</h3>
                  <div className="review-grid">
                    <div className="review-item">
                      <label>RFQ:</label>
                      <span>{formData.rfqId || 'Not selected'}</span>
                    </div>
                    <div className="review-item">
                      <label>Supplier:</label>
                      <span>
                        {suppliers.find(s => s.id === formData.supplierId)?.name || 'Not selected'}
                      </span>
                    </div>
                    <div className="review-item">
                      <label>Bid Title:</label>
                      <span>{formData.bidTitle || 'Not provided'}</span>
                    </div>
                    <div className="review-item">
                      <label>Total Amount:</label>
                      <span>${formData.bidAmount}</span>
                    </div>
                    <div className="review-item">
                      <label>Delivery Date:</label>
                      <span>{formData.deliveryDate || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="review-section">
                  <h3>Line Items ({formData.items.length})</h3>
                  <div className="items-review">
                    {formData.items.map((item, index) => (
                      <div key={index} className="review-item-row">
                        <span className="item-name">{item.itemName || 'Unnamed Item'}</span>
                        <span className="item-details">
                          {item.quantity} {item.unit} × ${item.unitPrice} = ${item.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.termsAndConditions && (
                  <div className="review-section">
                    <h3>Terms & Conditions</h3>
                    <div className="terms-review">
                      {formData.termsAndConditions}
                    </div>
                  </div>
                )}

                {formData.documents.length > 0 && (
                  <div className="review-section">
                    <h3>Documents ({formData.documents.length})</h3>
                    <div className="documents-review">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="document-review-item">
                          📎 {doc.name} ({doc.size})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <div className="actions-left">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-draft"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </button>
          </div>

          <div className="actions-right">
            {activeSection !== 'basic' && (
              <button
                type="button"
                className="btn-previous"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex > 0) {
                    setActiveSection(sections[currentIndex - 1].id);
                  }
                }}
              >
                ← Previous
              </button>
            )}

            {activeSection !== 'review' ? (
              <button
                type="button"
                className="btn-next"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1].id);
                  }
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Bid'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BidForm;