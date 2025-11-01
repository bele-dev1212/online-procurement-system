import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useSupplierCategories } from '../../../hooks/useSupplierCategories';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './SupplierForm.css';

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { 
    createSupplier, 
    updateSupplier, 
    getSupplier, 
    loading  } = useSuppliers();
  
  const { categories } = useSupplierCategories();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    category: '',
    taxId: '',
    website: '',
    
    // Contact Information
    contactPerson: '',
    contactRole: '',
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    
    // Business Information
    businessType: '',
    yearEstablished: '',
    employeeCount: '',
    annualRevenue: '',
    ownershipType: '',
    
    // Bank Information
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    iban: '',
    swiftCode: '',
    
    // Compliance & Certifications
    certifications: [''],
    complianceStatus: 'pending',
    
    // Performance & Status
    status: 'pending',
    approvalStatus: 'pending',
    rating: 0,
    performance: 0,
    
    // Additional Details
    paymentTerms: 'net30',
    deliveryTime: '',
    qualityRating: 0,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (isEdit) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    try {
      const supplier = await getSupplier(id);
      setFormData({
        ...supplier,
        address: supplier.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        certifications: supplier.certifications || [''],
        yearEstablished: supplier.yearEstablished || '',
        employeeCount: supplier.employeeCount || '',
        annualRevenue: supplier.annualRevenue || '',
        ownershipType: supplier.ownershipType || '',
        bankName: supplier.bankName || '',
        accountNumber: supplier.accountNumber || '',
        routingNumber: supplier.routingNumber || '',
        iban: supplier.iban || '',
        swiftCode: supplier.swiftCode || '',
        paymentTerms: supplier.paymentTerms || 'net30',
        deliveryTime: supplier.deliveryTime || '',
        qualityRating: supplier.qualityRating || 0,
        notes: supplier.notes || ''
      });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load supplier', 'error');
      navigate('/suppliers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCertificationChange = (index, value) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications[index] = value;
    setFormData(prev => ({ ...prev, certifications: updatedCertifications }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const removeCertification = (index) => {
    if (formData.certifications.length > 1) {
      const updatedCertifications = formData.certifications.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, certifications: updatedCertifications }));
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData(prev => ({ ...prev, rating: newRating }));
  };

  const handleQualityRatingChange = (newRating) => {
    setFormData(prev => ({ ...prev, qualityRating: newRating }));
  };

  const handlePerformanceChange = (e) => {
    setFormData(prev => ({ ...prev, performance: parseInt(e.target.value) }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Supplier name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.category) errors.category = 'Category is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return errors;
  };

  const handleSubmit = async (e, status = 'active') => {
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
        status: status,
        certifications: formData.certifications.filter(cert => cert.trim() !== ''),
        // Auto-calculate some fields if not provided
        rating: formData.rating || 0,
        performance: formData.performance || 0,
        qualityRating: formData.qualityRating || 0
      };

      if (isEdit) {
        await updateSupplier(id, submissionData);
        addNotification('Supplier updated successfully', 'success');
      } else {
        await createSupplier(submissionData);
        addNotification('Supplier created successfully', 'success');
      }
      navigate('/suppliers');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification(`Failed to ${isEdit ? 'update' : 'create'} supplier`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // For drafts, we can be more lenient with validation
      console.log('Form has errors, but saving as draft anyway');
    }

    setIsSubmitting(true);
    
    try {
      const draftData = {
        ...formData,
        status: 'draft',
        certifications: formData.certifications.filter(cert => cert.trim() !== '')
      };

      if (isEdit) {
        await updateSupplier(id, draftData);
        addNotification('Supplier draft saved', 'success');
      } else {
        await createSupplier(draftData);
        addNotification('Supplier draft created', 'success');
      }
      navigate('/suppliers');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to save draft', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (currentRating, onRatingChange, size = 'medium') => {
    return (
      <div className={`star-rating ${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= currentRating ? 'filled' : ''}`}
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => {
              if (size === 'large') {
                // Visual feedback for hover
              }
            }}
          >
            ★
          </button>
        ))}
        <span className="rating-value">{currentRating}.0</span>
      </div>
    );
  };

  const renderPerformanceMeter = () => {
    return (
      <div className="performance-meter">
        <input
          type="range"
          min="0"
          max="100"
          value={formData.performance}
          onChange={handlePerformanceChange}
          className="performance-slider"
        />
        <div className="performance-labels">
          <span>0%</span>
          <span className="performance-value">{formData.performance}%</span>
          <span>100%</span>
        </div>
        <div className="performance-bar">
          <div 
            className={`performance-fill performance--${formData.performance >= 80 ? 'excellent' : formData.performance >= 60 ? 'good' : formData.performance >= 40 ? 'average' : 'poor'}`}
            style={{ width: `${formData.performance}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'icon-user' },
    { id: 'contact', label: 'Contact', icon: 'icon-phone' },
    { id: 'business', label: 'Business', icon: 'icon-briefcase' },
    { id: 'banking', label: 'Banking', icon: 'icon-credit-card' },
    { id: 'compliance', label: 'Compliance', icon: 'icon-shield' },
    { id: 'performance', label: 'Performance', icon: 'icon-trending-up' }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="supplier-form">
      <div className="form-header">
        <div className="header-left">
          <h1>{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h1>
          <p>{isEdit ? 'Update supplier information' : 'Create a new supplier profile'}</p>
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
            onClick={() => navigate('/suppliers')}
          >
            <i className="icon-x"></i>
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'active')} className="supplier-form-content">
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
                    <label htmlFor="name">Supplier Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter supplier company name"
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
                    <label htmlFor="taxId">Tax ID / VAT Number</label>
                    <input
                      type="text"
                      id="taxId"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      placeholder="Enter tax identification number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the supplier's business and services..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contactPerson">Contact Person *</label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Full name of contact person"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contactRole">Role/Position</label>
                    <input
                      type="text"
                      id="contactRole"
                      name="contactRole"
                      value={formData.contactRole}
                      onChange={handleInputChange}
                      placeholder="e.g., Sales Manager, Procurement Head"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@company.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="Mobile phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fax">Fax Number</label>
                    <input
                      type="tel"
                      id="fax"
                      name="fax"
                      value={formData.fax}
                      onChange={handleInputChange}
                      placeholder="Fax number"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="address.street">Street Address</label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.city">City</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.state">State/Province</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      placeholder="State or province"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.zipCode">ZIP/Postal Code</label>
                    <input
                      type="text"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.country">Country</label>
                    <input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Information Tab */}
          {activeTab === 'business' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Business Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="businessType">Business Type</label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Business Type</option>
                      <option value="corporation">Corporation</option>
                      <option value="llc">LLC</option>
                      <option value="partnership">Partnership</option>
                      <option value="sole-proprietorship">Sole Proprietorship</option>
                      <option value="non-profit">Non-Profit</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ownershipType">Ownership Type</label>
                    <select
                      id="ownershipType"
                      name="ownershipType"
                      value={formData.ownershipType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Ownership</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="government">Government</option>
                      <option value="subsidiary">Subsidiary</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="yearEstablished">Year Established</label>
                    <input
                      type="number"
                      id="yearEstablished"
                      name="yearEstablished"
                      value={formData.yearEstablished}
                      onChange={handleInputChange}
                      placeholder="1990"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="employeeCount">Employee Count</label>
                    <input
                      type="number"
                      id="employeeCount"
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleInputChange}
                      placeholder="Number of employees"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="annualRevenue">Annual Revenue (USD)</label>
                    <input
                      type="number"
                      id="annualRevenue"
                      name="annualRevenue"
                      value={formData.annualRevenue}
                      onChange={handleInputChange}
                      placeholder="Annual revenue in USD"
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="paymentTerms">Payment Terms</label>
                    <select
                      id="paymentTerms"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleInputChange}
                    >
                      <option value="net15">Net 15</option>
                      <option value="net30">Net 30</option>
                      <option value="net45">Net 45</option>
                      <option value="net60">Net 60</option>
                      <option value="due-on-receipt">Due on Receipt</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryTime">Delivery Time (Days)</label>
                    <input
                      type="number"
                      id="deliveryTime"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleInputChange}
                      placeholder="Average delivery time in days"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banking Information Tab */}
          {activeTab === 'banking' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Banking Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="bankName">Bank Name</label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="Bank name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="accountNumber">Account Number</label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Bank account number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="routingNumber">Routing Number</label>
                    <input
                      type="text"
                      id="routingNumber"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                      placeholder="Bank routing number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="iban">IBAN</label>
                    <input
                      type="text"
                      id="iban"
                      name="iban"
                      value={formData.iban}
                      onChange={handleInputChange}
                      placeholder="International Bank Account Number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="swiftCode">SWIFT/BIC Code</label>
                    <input
                      type="text"
                      id="swiftCode"
                      name="swiftCode"
                      value={formData.swiftCode}
                      onChange={handleInputChange}
                      placeholder="SWIFT or BIC code"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Compliance & Certifications</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="complianceStatus">Compliance Status</label>
                    <select
                      id="complianceStatus"
                      name="complianceStatus"
                      value={formData.complianceStatus}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Pending Review</option>
                      <option value="compliant">Compliant</option>
                      <option value="non-compliant">Non-Compliant</option>
                      <option value="conditional">Conditional</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="approvalStatus">Approval Status</label>
                    <select
                      id="approvalStatus"
                      name="approvalStatus"
                      value={formData.approvalStatus}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="under-review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div className="certifications-header">
                    <label>Certifications & Accreditations</label>
                    <button
                      type="button"
                      className="btn btn--sm btn--outline"
                      onClick={addCertification}
                    >
                      <i className="icon-plus"></i>
                      Add Certification
                    </button>
                  </div>
                  {formData.certifications.map((certification, index) => (
                    <div key={index} className="certification-item">
                      <input
                        type="text"
                        value={certification}
                        onChange={(e) => handleCertificationChange(index, e.target.value)}
                        placeholder="e.g., ISO 9001, ISO 14001, OSHA Certified"
                      />
                      <button
                        type="button"
                        className="btn btn--sm btn--danger"
                        onClick={() => removeCertification(index)}
                        disabled={formData.certifications.length === 1}
                      >
                        <i className="icon-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Performance Metrics</h3>
                
                <div className="rating-section">
                  <div className="rating-group">
                    <label>Overall Rating</label>
                    {renderStarRating(formData.rating, handleRatingChange, 'large')}
                  </div>
                  
                  <div className="rating-group">
                    <label>Quality Rating</label>
                    {renderStarRating(formData.qualityRating, handleQualityRatingChange, 'large')}
                  </div>
                </div>

                <div className="form-group">
                  <label>Performance Score: {formData.performance}%</label>
                  {renderPerformanceMeter()}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Supplier Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes & Comments</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes, comments, or special instructions..."
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
              onClick={() => navigate('/suppliers')}
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
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Supplier' : 'Create Supplier')}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Supplier Preview"
        size="large"
      >
        <div className="supplier-preview">
          <div className="preview-header">
            <h2>{formData.name || 'Supplier Name'}</h2>
            <div className="preview-meta">
              <span className="category-badge">{formData.category || 'Uncategorized'}</span>
              <span className={`status-badge status-badge--${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
          
          <div className="preview-content">
            <div className="preview-section">
              <h4>Contact Information</h4>
              <div className="preview-grid">
                <div><strong>Contact:</strong> {formData.contactPerson || 'N/A'}</div>
                <div><strong>Email:</strong> {formData.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {formData.phone || 'N/A'}</div>
                <div><strong>Address:</strong> {formData.address.street ? `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.zipCode}` : 'N/A'}</div>
              </div>
            </div>
            
            <div className="preview-section">
              <h4>Business Information</h4>
              <div className="preview-grid">
                <div><strong>Business Type:</strong> {formData.businessType || 'N/A'}</div>
                <div><strong>Year Established:</strong> {formData.yearEstablished || 'N/A'}</div>
                <div><strong>Employee Count:</strong> {formData.employeeCount || 'N/A'}</div>
                <div><strong>Payment Terms:</strong> {formData.paymentTerms || 'N/A'}</div>
              </div>
            </div>
            
            {formData.certifications.some(cert => cert.trim() !== '') && (
              <div className="preview-section">
                <h4>Certifications</h4>
                <ul>
                  {formData.certifications.filter(cert => cert.trim() !== '').map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
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

export default SupplierForm;