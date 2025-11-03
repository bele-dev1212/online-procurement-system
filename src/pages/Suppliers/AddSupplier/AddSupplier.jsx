import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useSuppliers } from '../../../hooks/useSuppliers';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import { SUPPLIER_CATEGORIES, SUPPLIER_CATEGORY_LABELS } from '../../../utils/enums/supplierCategories';
import './AddSupplier.css';

const AddSupplier = () => {
  const navigate = useNavigate();
  const { createSupplier, loading } = useSuppliers();

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    taxId: '',
    
    // Contact Information
    contactPerson: '',
    contactPosition: '',
    alternateEmail: '',
    alternatePhone: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    
    // Business Information
    category: '',
    establishedYear: '',
    employeeCount: '',
    annualRevenue: '',
    businessType: '',
    
    // Payment & Terms
    paymentTerms: 'net30',
    currency: 'USD',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    
    // Status & Additional
    status: 'pending',
    rating: 0,
    notes: '',
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newSupplierId, setNewSupplierId] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [customTag, setCustomTag] = useState('');

  const businessTypes = [
    'Manufacturer',
    'Distributor',
    'Wholesaler',
    'Retailer',
    'Service Provider',
    'Consultant',
    'Contractor',
    'Importer/Exporter'
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Japan',
    'China',
    'India',
    'Australia',
    'Brazil',
    'Other'
  ];

  const currencies = [
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CAD',
    'AUD',
    'CNY',
    'INR'
  ];

  // Form sections for navigation
  const formSections = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'address', label: 'Address', icon: '📍' },
    { id: 'business', label: 'Business', icon: '🏢' },
    { id: 'payment', label: 'Payment', icon: '💰' },
    { id: 'additional', label: 'Additional', icon: '📝' }
  ];

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateSection = (section) => {
    const sectionFields = {
      basic: ['name', 'companyName', 'email', 'phone'],
      contact: ['contactPerson'],
      address: ['address', 'city', 'country', 'postalCode'],
      business: ['category', 'businessType'],
      payment: ['paymentTerms', 'currency'],
      additional: [] // No required fields in additional section
    };

    const sectionErrors = {};
    sectionFields[section]?.forEach(field => {
      if (!formData[field]?.trim()) {
        sectionErrors[field] = 'This field is required';
      }
    });

    // Additional validations
    if (section === 'basic') {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        sectionErrors.email = 'Please enter a valid email address';
      }
      if (formData.phone && !/^[\\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-(\\)]/g, ''))) {
        sectionErrors.phone = 'Please enter a valid phone number';
      }
    }

    return sectionErrors;
  };

  const handleNextSection = () => {
    const currentIndex = formSections.findIndex(section => section.id === activeSection);
    if (currentIndex < formSections.length - 1) {
      const sectionErrors = validateSection(activeSection);
      
      if (Object.keys(sectionErrors).length > 0) {
        setErrors(sectionErrors);
        return;
      }

      setActiveSection(formSections[currentIndex + 1].id);
      setErrors({});
    }
  };

  const handlePreviousSection = () => {
    const currentIndex = formSections.findIndex(section => section.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(formSections[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all sections
    const allErrors = {};
    formSections.forEach(section => {
      const sectionErrors = validateSection(section.id);
      Object.assign(allErrors, sectionErrors);
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(allErrors)[0];
      document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }

    try {
      const result = await createSupplier(formData);
      if (result.success) {
        setNewSupplierId(result.supplier.id);
        setShowSuccessModal(true);
      }
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    navigate('/suppliers');
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      website: '',
      taxId: '',
      contactPerson: '',
      contactPosition: '',
      alternateEmail: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      category: '',
      establishedYear: '',
      employeeCount: '',
      annualRevenue: '',
      businessType: '',
      paymentTerms: 'net30',
      currency: 'USD',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      status: 'pending',
      rating: 0,
      notes: '',
      tags: []
    });
    setActiveSection('basic');
    setErrors({});
  };

  const isSectionComplete = (section) => {
    const sectionErrors = validateSection(section);
    return Object.keys(sectionErrors).length === 0;
  };

  return (
    <div className="add-supplier">
      <div className="add-supplier-header">
        <div className="breadcrumb">
          <Link to="/suppliers" className="breadcrumb-link">
            Suppliers
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span>Add New Supplier</span>
        </div>
        <h1>Add New Supplier</h1>
        <p>Complete the form below to add a new supplier to your directory</p>
      </div>

      <div className="add-supplier-content">
        {/* Progress Navigation */}
        <div className="form-progress">
          {formSections.map((section, index) => (
            <React.Fragment key={section.id}>
              <div 
                className={`progress-step ${activeSection === section.id ? 'active' : ''} ${
                  isSectionComplete(section.id) ? 'complete' : ''
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="step-icon">{section.icon}</div>
                <span className="step-label">{section.label}</span>
              </div>
              {index < formSections.length - 1 && (
                <div className={`progress-line ${
                  formSections.findIndex(s => s.id === activeSection) > index ? 'complete' : ''
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="supplier-form">
          {errors.submit && (
            <div className="error-message server-error">
              {errors.submit}
            </div>
          )}

          {/* Basic Information Section */}
          {activeSection === 'basic' && (
            <div className="form-section">
              <h2>Basic Information</h2>
              <p className="section-description">
                Provide the essential details about the supplier
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Supplier Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter supplier name"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`form-input ${errors.companyName ? 'error' : ''}`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <span className="error-text">{errors.companyName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="supplier@company.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="form-input"
                    placeholder="https://company.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax ID / VAT Number</label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="form-input"
                    placeholder="Enter tax identification number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          {activeSection === 'contact' && (
            <div className="form-section">
              <h2>Contact Information</h2>
              <p className="section-description">
                Primary contact details for the supplier
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className={`form-input ${errors.contactPerson ? 'error' : ''}`}
                    placeholder="Full name of primary contact"
                  />
                  {errors.contactPerson && <span className="error-text">{errors.contactPerson}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Position/Title</label>
                  <input
                    type="text"
                    name="contactPosition"
                    value={formData.contactPosition}
                    onChange={(e) => handleInputChange('contactPosition', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Sales Manager, Procurement Director"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alternate Email</label>
                  <input
                    type="email"
                    name="alternateEmail"
                    value={formData.alternateEmail}
                    onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                    className="form-input"
                    placeholder="alternate@company.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alternate Phone</label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Information Section */}
          {activeSection === 'address' && (
            <div className="form-section">
              <h2>Address Information</h2>
              <p className="section-description">
                Physical location and mailing address
              </p>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    placeholder="123 Main Street, Suite 100"
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`form-input ${errors.city ? 'error' : ''}`}
                    placeholder="Enter city"
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="form-input"
                    placeholder="Enter state or province"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`form-input ${errors.country ? 'error' : ''}`}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && <span className="error-text">{errors.country}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={`form-input ${errors.postalCode ? 'error' : ''}`}
                    placeholder="Enter postal code"
                  />
                  {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Business Information Section */}
          {activeSection === 'business' && (
            <div className="form-section">
              <h2>Business Information</h2>
              <p className="section-description">
                Details about the supplier's business operations
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`form-input ${errors.category ? 'error' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {supplierCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <span className="error-text">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Business Type *</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className={`form-input ${errors.businessType ? 'error' : ''}`}
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.businessType && <span className="error-text">{errors.businessType}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Established Year</label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                    className="form-input"
                    placeholder="YYYY"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Count</label>
                  <select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Range</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Revenue</label>
                  <select
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Range</option>
                    <option value="0-1M">$0 - $1M</option>
                    <option value="1M-5M">$1M - $5M</option>
                    <option value="5M-10M">$5M - $10M</option>
                    <option value="10M-50M">$10M - $50M</option>
                    <option value="50M-100M">$50M - $100M</option>
                    <option value="100M+">$100M+</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information Section */}
          {activeSection === 'payment' && (
            <div className="form-section">
              <h2>Payment & Banking Information</h2>
              <p className="section-description">
                Payment terms and banking details for transactions
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Payment Terms *</label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    className={`form-input ${errors.paymentTerms ? 'error' : ''}`}
                  >
                    {Object.entries(paymentTerms).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  {errors.paymentTerms && <span className="error-text">{errors.paymentTerms}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Currency *</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className={`form-input ${errors.currency ? 'error' : ''}`}
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                  {errors.currency && <span className="error-text">{errors.currency}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="form-input"
                    placeholder="Name of bank"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="form-input"
                    placeholder="Bank account number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Routing Number</label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                    className="form-input"
                    placeholder="Bank routing number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          {activeSection === 'additional' && (
            <div className="form-section">
              <h2>Additional Information</h2>
              <p className="section-description">
                Additional details and notes about the supplier
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="form-input"
                  >
                    {Object.entries(supplierStatus).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                        onClick={() => handleInputChange('rating', star)}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-value">{formData.rating}/5</span>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Tags</label>
                  <div className="tags-input">
                    <div className="tags-container">
                      {formData.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="tag-input-group">
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="tag-input"
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="btn-tag-add"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="form-input"
                    rows="4"
                    placeholder="Any additional notes or comments about this supplier..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation */}
          <div className="form-navigation">
            <div className="nav-left">
              {activeSection !== 'basic' && (
                <button
                  type="button"
                  onClick={handlePreviousSection}
                  className="btn-outline"
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="nav-right">
              {activeSection !== 'additional' ? (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="btn-primary"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Add Supplier'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessContinue}
        title="Supplier Added Successfully!"
        showCloseButton={false}
        actions={[
          {
            label: 'Add Another Supplier',
            onClick: handleAddAnother,
            variant: 'secondary'
          },
          {
            label: 'View Supplier Directory',
            onClick: handleSuccessContinue,
            variant: 'primary'
          }
        ]}
      >
        <div className="success-modal-content">
          <div className="success-icon">✅</div>
          <h3>Supplier has been added successfully!</h3>
          <p>
            <strong>{formData.name}</strong> has been added to your supplier directory. 
            You can now manage their information, track performance, and create purchase orders.
          </p>
          <div className="success-details">
            <div className="detail-item">
              <strong>Supplier ID:</strong> 
              <span>{newSupplierId}</span>
            </div>
            <div className="detail-item">
              <strong>Status:</strong> 
              <span className={`status-badge status-${formData.status}`}>
                {supplierStatus[formData.status]}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddSupplier;