// src/pages/Suppliers/components/StatusUpdateModal/StatusUpdateModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import LoadingSpinner from '../../../../components/common/LoadingSpinner/LoadingSpinner';
import Notification from '../../../../components/common/Notification/Notification';
import './StatusUpdateModal.css';

const StatusUpdateModal = ({ 
  order, 
  currentStatus, 
  nextStatusOptions, 
  onUpdate, 
  onClose, 
  loading = false 
}) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Status information mapping
  const statusInfo = {
    'pending': { 
      label: 'Pending', 
      icon: '⏳', 
      color: '#F59E0B',
      description: 'Order received and awaiting confirmation'
    },
    'confirmed': { 
      label: 'Confirmed', 
      icon: '✅', 
      color: '#10B981',
      description: 'Order confirmed and ready for processing'
    },
    'in_production': { 
      label: 'In Production', 
      icon: '🏭', 
      color: '#3B82F6',
      description: 'Items are being manufactured/produced'
    },
    'quality_check': { 
      label: 'Quality Check', 
      icon: '🔍', 
      color: '#8B5CF6',
      description: 'Undergoing quality assurance checks'
    },
    'ready_to_ship': { 
      label: 'Ready to Ship', 
      icon: '📦', 
      color: '#EC4899',
      description: 'Order packaged and ready for shipment'
    },
    'shipped': { 
      label: 'Shipped', 
      icon: '🚚', 
      color: '#6366F1',
      description: 'Order has been shipped to customer'
    },
    'out_for_delivery': { 
      label: 'Out for Delivery', 
      icon: '📮', 
      color: '#F97316',
      description: 'Order is out for final delivery'
    },
    'delivered': { 
      label: 'Delivered', 
      icon: '🎉', 
      color: '#059669',
      description: 'Order successfully delivered to customer'
    },
    'cancelled': { 
      label: 'Cancelled', 
      icon: '❌', 
      color: '#DC2626',
      description: 'Order has been cancelled'
    },
    'on_hold': { 
      label: 'On Hold', 
      icon: '⏸️', 
      color: '#6B7280',
      description: 'Order temporarily paused'
    },
    'partially_shipped': { 
      label: 'Partially Shipped', 
      icon: '📤', 
      color: '#8B5CF6',
      description: 'Some items have been shipped'
    }
  };

  // Required fields for specific statuses
  const requiredFields = {
    'shipped': ['trackingNumber', 'carrier'],
    'out_for_delivery': ['estimatedDelivery'],
    'delivered': ['deliveryConfirmation'],
    'cancelled': ['cancellationReason']
  };

  // Additional fields based on status
  const [additionalFields, setAdditionalFields] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    deliveryConfirmation: '',
    cancellationReason: '',
    productionProgress: '',
    qualityScore: '',
    holdReason: ''
  });

  // Initialize selected status
  useEffect(() => {
    if (nextStatusOptions.length > 0 && !selectedStatus) {
      setSelectedStatus(nextStatusOptions[0]);
    }
  }, [nextStatusOptions, selectedStatus]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      // Simulate file upload - in production, this would upload to your server
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          // Validate file type and size
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error(`File ${file.name} exceeds 10MB limit`);
          }

          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`File type ${file.type} not supported`);
          }

          return {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file), // In production, this would be the server URL
            uploadedAt: new Date().toISOString()
          };
        })
      );

      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  // Handle additional field changes
  const handleAdditionalFieldChange = (field, value) => {
    setAdditionalFields(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!selectedStatus) {
      errors.status = 'Please select a status';
    }
    
    // Check required fields for selected status
    const required = requiredFields[selectedStatus] || [];
    required.forEach(field => {
      if (!additionalFields[field]?.trim()) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });
    
    // Validate specific fields
    if (selectedStatus === 'shipped') {
      if (additionalFields.trackingNumber && !/^[A-Z0-9]{8,20}$/.test(additionalFields.trackingNumber)) {
        errors.trackingNumber = 'Please enter a valid tracking number';
      }
    }
    
    if (selectedStatus === 'quality_check' && additionalFields.qualityScore) {
      const score = parseInt(additionalFields.qualityScore);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.qualityScore = 'Quality score must be between 0 and 100';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const updateData = {
        status: selectedStatus,
        notes: notes.trim(),
        updatedBy: user?.id,
        timestamp: new Date().toISOString(),
        attachments: attachments.map(file => ({
          name: file.name,
          url: file.url,
          type: file.type
        })),
        ...additionalFields
      };
      
      // Clean up empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] == null) {
          delete updateData[key];
        }
      });
      
      await onUpdate(selectedStatus, notes.trim(), updateData);
      
      // Reset form on successful submission
      setSelectedStatus('');
      setNotes('');
      setAttachments([]);
      setAdditionalFields({
        trackingNumber: '',
        carrier: '',
        estimatedDelivery: '',
        deliveryConfirmation: '',
        cancellationReason: '',
        productionProgress: '',
        qualityScore: '',
        holdReason: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to update status. Please try again.');
    }
  };

  // Get status transition message
  const getStatusTransitionMessage = () => {
    if (!selectedStatus) return '';
    
    const current = statusInfo[currentStatus];
    const next = statusInfo[selectedStatus];
    
    if (!current || !next) return '';
    
    return `Changing order status from ${current.label} to ${next.label}`;
  };

  // Get required fields for current selection
  const getCurrentRequiredFields = () => {
    return requiredFields[selectedStatus] || [];
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  };

  const currentStatusInfo = statusInfo[currentStatus];
  const selectedStatusInfo = statusInfo[selectedStatus];

  return (
    <div className="status-update-modal">
      {/* Notifications */}
      {error && (
        <Notification 
          type="error" 
          message={error}
          onClose={() => setError(null)}
          autoClose={5000}
        />
      )}

      {/* Header */}
      <div className="modal-header">
        <h2>Update Order Status</h2>
        <p>Update the status for order <strong>{order?.orderNumber}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="status-form">
        {/* Current Status Display */}
        <div className="current-status-section">
          <h3>Current Status</h3>
          <div className={`current-status-badge status-${currentStatus}`}>
            <span className="status-icon">{currentStatusInfo?.icon}</span>
            <span className="status-label">{currentStatusInfo?.label}</span>
          </div>
          {currentStatusInfo?.description && (
            <p className="status-description">{currentStatusInfo.description}</p>
          )}
        </div>

        {/* Status Selection */}
        <div className="form-section">
          <label htmlFor="status-select" className="form-label required">
            New Status
          </label>
          <select
            id="status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`form-select ${formErrors.status ? 'error' : ''}`}
            disabled={loading}
          >
            <option value="">Select new status</option>
            {nextStatusOptions.map(status => {
              const info = statusInfo[status];
              return (
                <option key={status} value={status}>
                  {info?.icon} {info?.label}
                </option>
              );
            })}
          </select>
          {formErrors.status && (
            <div className="error-message">{formErrors.status}</div>
          )}
        </div>

        {/* Status Transition Info */}
        {selectedStatus && (
          <div className="transition-info">
            <div className="transition-arrow">→</div>
            <div className="new-status-info">
              <div className={`new-status-badge status-${selectedStatus}`}>
                <span className="status-icon">{selectedStatusInfo?.icon}</span>
                <span className="status-label">{selectedStatusInfo?.label}</span>
              </div>
              {selectedStatusInfo?.description && (
                <p className="status-description">{selectedStatusInfo.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Additional Fields Based on Status */}
        {selectedStatus && (
          <div className="additional-fields">
            {/* Tracking Information */}
            {(selectedStatus === 'shipped' || selectedStatus === 'out_for_delivery') && (
              <div className="field-group">
                <h4>Shipping Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tracking-number" className="form-label required">
                      Tracking Number
                    </label>
                    <input
                      id="tracking-number"
                      type="text"
                      value={additionalFields.trackingNumber}
                      onChange={(e) => handleAdditionalFieldChange('trackingNumber', e.target.value)}
                      className={`form-input ${formErrors.trackingNumber ? 'error' : ''}`}
                      placeholder="Enter tracking number"
                      disabled={loading}
                    />
                    {formErrors.trackingNumber && (
                      <div className="error-message">{formErrors.trackingNumber}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="carrier" className="form-label required">
                      Carrier
                    </label>
                    <select
                      id="carrier"
                      value={additionalFields.carrier}
                      onChange={(e) => handleAdditionalFieldChange('carrier', e.target.value)}
                      className={`form-select ${formErrors.carrier ? 'error' : ''}`}
                      disabled={loading}
                    >
                      <option value="">Select carrier</option>
                      <option value="ups">UPS</option>
                      <option value="fedex">FedEx</option>
                      <option value="dhl">DHL</option>
                      <option value="usps">USPS</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.carrier && (
                      <div className="error-message">{formErrors.carrier}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Information */}
            {selectedStatus === 'out_for_delivery' && (
              <div className="form-group">
                <label htmlFor="estimated-delivery" className="form-label required">
                  Estimated Delivery
                </label>
                <input
                  id="estimated-delivery"
                  type="datetime-local"
                  value={additionalFields.estimatedDelivery}
                  onChange={(e) => handleAdditionalFieldChange('estimatedDelivery', e.target.value)}
                  className={`form-input ${formErrors.estimatedDelivery ? 'error' : ''}`}
                  disabled={loading}
                />
                {formErrors.estimatedDelivery && (
                  <div className="error-message">{formErrors.estimatedDelivery}</div>
                )}
              </div>
            )}

            {/* Delivery Confirmation */}
            {selectedStatus === 'delivered' && (
              <div className="form-group">
                <label htmlFor="delivery-confirmation" className="form-label required">
                  Delivery Confirmation
                </label>
                <select
                  id="delivery-confirmation"
                  value={additionalFields.deliveryConfirmation}
                  onChange={(e) => handleAdditionalFieldChange('deliveryConfirmation', e.target.value)}
                  className={`form-select ${formErrors.deliveryConfirmation ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Select confirmation type</option>
                  <option value="signature">Customer Signature</option>
                  <option value="photo">Delivery Photo</option>
                  <option value="verbal">Verbal Confirmation</option>
                  <option value="left_at_door">Left at Door</option>
                </select>
                {formErrors.deliveryConfirmation && (
                  <div className="error-message">{formErrors.deliveryConfirmation}</div>
                )}
              </div>
            )}

            {/* Cancellation Reason */}
            {selectedStatus === 'cancelled' && (
              <div className="form-group">
                <label htmlFor="cancellation-reason" className="form-label required">
                  Cancellation Reason
                </label>
                <select
                  id="cancellation-reason"
                  value={additionalFields.cancellationReason}
                  onChange={(e) => handleAdditionalFieldChange('cancellationReason', e.target.value)}
                  className={`form-select ${formErrors.cancellationReason ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Select reason</option>
                  <option value="customer_request">Customer Request</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="production_issue">Production Issue</option>
                  <option value="quality_concerns">Quality Concerns</option>
                  <option value="shipping_issue">Shipping Issue</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.cancellationReason && (
                  <div className="error-message">{formErrors.cancellationReason}</div>
                )}
              </div>
            )}

            {/* Production Progress */}
            {selectedStatus === 'in_production' && (
              <div className="form-group">
                <label htmlFor="production-progress" className="form-label">
                  Production Progress (%)
                </label>
                <input
                  id="production-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={additionalFields.productionProgress}
                  onChange={(e) => handleAdditionalFieldChange('productionProgress', e.target.value)}
                  className="form-input"
                  placeholder="0-100"
                  disabled={loading}
                />
              </div>
            )}

            {/* Quality Check */}
            {selectedStatus === 'quality_check' && (
              <div className="form-group">
                <label htmlFor="quality-score" className="form-label">
                  Quality Score
                </label>
                <input
                  id="quality-score"
                  type="number"
                  min="0"
                  max="100"
                  value={additionalFields.qualityScore}
                  onChange={(e) => handleAdditionalFieldChange('qualityScore', e.target.value)}
                  className={`form-input ${formErrors.qualityScore ? 'error' : ''}`}
                  placeholder="0-100"
                  disabled={loading}
                />
                {formErrors.qualityScore && (
                  <div className="error-message">{formErrors.qualityScore}</div>
                )}
              </div>
            )}

            {/* Hold Reason */}
            {selectedStatus === 'on_hold' && (
              <div className="form-group">
                <label htmlFor="hold-reason" className="form-label">
                  Reason for Hold
                </label>
                <select
                  id="hold-reason"
                  value={additionalFields.holdReason}
                  onChange={(e) => handleAdditionalFieldChange('holdReason', e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="">Select reason</option>
                  <option value="awaiting_materials">Awaiting Materials</option>
                  <option value="quality_concern">Quality Concern</option>
                  <option value="customer_request">Customer Request</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        <div className="form-section">
          <label htmlFor="status-notes" className="form-label">
            Additional Notes
          </label>
          <textarea
            id="status-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-textarea"
            placeholder="Add any additional notes about this status update..."
            rows="4"
            disabled={loading}
          />
          <div className="help-text">
            These notes will be visible to the customer and your team.
          </div>
        </div>

        {/* File Attachments */}
        <div className="form-section">
          <label className="form-label">
            Attachments
          </label>
          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              className="file-input"
              disabled={loading || uploading}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              <span className="upload-icon">📎</span>
              <span className="upload-text">
                {uploading ? 'Uploading...' : 'Choose files or drag and drop'}
              </span>
              <span className="upload-subtext">Max 10MB per file • JPG, PNG, GIF, PDF, DOC</span>
            </label>
          </div>

          {/* Uploaded Files List */}
          {attachments.length > 0 && (
            <div className="attachments-list">
              <h4>Attached Files ({attachments.length})</h4>
              {attachments.map(file => (
                <div key={file.id} className="attachment-item">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(file.type)}</span>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedStatus}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                Updating Status...
              </>
            ) : (
              `Update to ${selectedStatusInfo?.label || 'New Status'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdateModal;