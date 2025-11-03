// src/pages/Suppliers/components/BidDetails/BidDetails.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Correct import path from BidDetails.jsx
import Modal from '../../../../components/common/Modal/Modal';

import './BidDetails.css';

const BidDetails = ({ bid, onClose, onWithdraw, onDuplicate }) => {
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      'draft': { class: 'status-draft', text: 'Draft', icon: '📝', color: '#6B7280' },
      'submitted': { class: 'status-submitted', text: 'Submitted', icon: '📤', color: '#3B82F6' },
      'under_review': { class: 'status-review', text: 'Under Review', icon: '👀', color: '#8B5CF6' },
      'shortlisted': { class: 'status-shortlisted', text: 'Shortlisted', icon: '⭐', color: '#EC4899' },
      'approved': { class: 'status-approved', text: 'Approved', icon: '✅', color: '#10B981' },
      'rejected': { class: 'status-rejected', text: 'Rejected', icon: '❌', color: '#DC2626' },
      'won': { class: 'status-won', text: 'Won', icon: '🏆', color: '#059669' },
      'lost': { class: 'status-lost', text: 'Lost', icon: '💔', color: '#7C3AED' },
      'withdrawn': { class: 'status-withdrawn', text: 'Withdrawn', icon: '↩️', color: '#6B7280' },
      'expired': { class: 'status-expired', text: 'Expired', icon: '⏰', color: '#F59E0B' }
    };
    
    return statusMap[status] || { class: 'status-default', text: status, icon: '❓', color: '#6B7280' };
  };

  // Get category info
  const getCategoryInfo = (category) => {
    const categoryMap = {
      'raw-materials': { class: 'category-raw', text: 'Raw Materials', icon: '🏭' },
      'equipment': { class: 'category-equipment', text: 'Equipment', icon: '⚙️' },
      'services': { class: 'category-services', text: 'Services', icon: '🔧' },
      'supplies': { class: 'category-supplies', text: 'Supplies', icon: '📦' },
      'electronics': { class: 'category-electronics', text: 'Electronics', icon: '💻' },
      'construction': { class: 'category-construction', text: 'Construction', icon: '🏗️' }
    };
    
    return categoryMap[category] || { class: 'category-default', text: category, icon: '📋' };
  };

  // Handle withdraw confirmation
  const handleWithdrawConfirm = () => {
    setShowWithdrawConfirm(false);
    onWithdraw();
  };

  // Handle duplicate confirmation
  const handleDuplicateConfirm = () => {
    setShowDuplicateConfirm(false);
    onDuplicate();
  };

  // Handle download attachments
  const handleDownloadAttachment = async (attachment) => {
    try {
      setDownloading(true);
      setError(null);
      
      // Simulate download - in real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = `#${attachment}`; // This would be the actual file URL
      link.download = attachment;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage(`Downloaded ${attachment} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download attachment. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Calculate total items
  const calculateTotalItems = () => {
    return bid.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!bid.rfqDeadline) return null;
    const now = new Date();
    const deadline = new Date(bid.rfqDeadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if bid can be withdrawn
  const canWithdraw = () => {
    return ['draft', 'submitted'].includes(bid.status) && 
           new Date(bid.rfqDeadline) > new Date();
  };

  // Check if bid can be duplicated
  const canDuplicate = () => {
    return ['won', 'lost', 'rejected', 'withdrawn'].includes(bid.status);
  };

  // Check if bid is active
  const isActive = () => {
    return bid.status === 'submitted' && new Date(bid.rfqDeadline) > new Date();
  };

  const statusInfo = getStatusInfo(bid.status);
  const categoryInfo = getCategoryInfo(bid.category);
  const daysRemaining = getDaysRemaining();
  const totalItems = calculateTotalItems();

  if (!bid) {
    return (
      <div className="bid-details">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Bid Not Found</h3>
          <p>The requested bid could not be loaded.</p>
          <button className="btn btn-primary" onClick={onClose}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-details">
      {/* Notifications */}
      {error && (
        <Notification 
          type="error" 
          message={error}
          onClose={() => setError(null)}
          autoClose={5000}
        />
      )}
      
      {successMessage && (
        <Notification 
          type="success" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
          autoClose={3000}
        />
      )}

      {/* Header Section */}
      <div className="bid-header">
        <div className="header-main">
          <h1>Bid Details</h1>
          <div className="bid-meta">
            <span className="bid-number">{bid.bidNumber}</span>
            <span className={`status-badge ${statusInfo.class}`}>
              <span className="status-icon">{statusInfo.icon}</span>
              {statusInfo.text}
            </span>
          </div>
        </div>
        <button className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="bid-content">
        <div className="content-grid">
          {/* Left Column - Basic Information */}
          <div className="info-section">
            <div className="section-card">
              <h2>Basic Information</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>RFQ Title:</label>
                  <span className="info-value">{bid.rfqTitle}</span>
                </div>
                
                <div className="info-item">
                  <label>RFQ Number:</label>
                  <span className="info-value">{bid.rfqNumber}</span>
                </div>
                
                <div className="info-item">
                  <label>Organization:</label>
                  <span className="info-value">{bid.procurementOrganization}</span>
                </div>
                
                <div className="info-item">
                  <label>Category:</label>
                  <span className={`category-tag ${categoryInfo.class}`}>
                    {categoryInfo.icon} {categoryInfo.text}
                  </span>
                </div>
                
                <div className="info-item">
                  <label>Bid Amount:</label>
                  <span className="info-value highlight">{formatCurrency(bid.amount)}</span>
                </div>
                
                <div className="info-item">
                  <label>Validity Period:</label>
                  <span className="info-value">{bid.validityPeriod || 30} days</span>
                </div>
                
                <div className="info-item">
                  <label>Delivery Time:</label>
                  <span className="info-value">{bid.deliveryTime || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="section-card">
              <h2>Timeline</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Submitted Date:</label>
                  <span className="info-value">{formatDateTime(bid.submittedAt)}</span>
                </div>
                
                <div className="info-item">
                  <label>RFQ Deadline:</label>
                  <span className="info-value">
                    {formatDateTime(bid.rfqDeadline)}
                    {daysRemaining !== null && (
                      <span className={`deadline-indicator ${daysRemaining <= 0 ? 'expired' : daysRemaining <= 3 ? 'urgent' : 'normal'}`}>
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span className="info-value">{formatDateTime(bid.lastUpdated)}</span>
                </div>
                
                {bid.evaluationDate && (
                  <div className="info-item">
                    <label>Evaluation Date:</label>
                    <span className="info-value">{formatDateTime(bid.evaluationDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Evaluation Information */}
            {(bid.evaluationScore || bid.competitorCount) && (
              <div className="section-card">
                <h2>Evaluation</h2>
                
                <div className="info-grid">
                  {bid.evaluationScore && (
                    <div className="info-item">
                      <label>Evaluation Score:</label>
                      <div className="score-display">
                        <span className="score-value">{bid.evaluationScore}/100</span>
                        <div className="score-bar">
                          <div 
                            className="score-progress" 
                            style={{ width: `${bid.evaluationScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {bid.competitorCount && (
                    <div className="info-item">
                      <label>Competitors:</label>
                      <span className="info-value">{bid.competitorCount} suppliers</span>
                    </div>
                  )}
                  
                  {bid.ranking && (
                    <div className="info-item">
                      <label>Ranking:</label>
                      <span className="info-value highlight">#{bid.ranking}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Items and Details */}
          <div className="details-section">
            {/* Bid Items */}
            <div className="section-card">
              <h2>Bid Items ({totalItems} items)</h2>
              
              {bid.items && bid.items.length > 0 ? (
                <div className="items-table">
                  <div className="table-header">
                    <span>Item Name</span>
                    <span>Quantity</span>
                    <span>Unit Price</span>
                    <span>Total</span>
                  </div>
                  
                  <div className="table-body">
                    {bid.items.map((item, index) => (
                      <div key={index} className="table-row">
                        <div className="item-name">
                          <span>{item.name}</span>
                          {item.specifications && (
                            <div className="item-specs">{item.specifications}</div>
                          )}
                        </div>
                        <div className="item-quantity">{item.quantity}</div>
                        <div className="item-price">{formatCurrency(item.unitPrice)}</div>
                        <div className="item-total">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="table-footer">
                    <div className="total-row">
                      <span>Grand Total:</span>
                      <span className="total-amount">{formatCurrency(bid.amount)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No items specified in this bid.</p>
                </div>
              )}
            </div>

            {/* Terms and Notes */}
            <div className="section-card">
              <h2>Terms & Notes</h2>
              
              <div className="terms-content">
                {bid.terms && (
                  <div className="terms-section">
                    <h4>Terms & Conditions</h4>
                    <p>{bid.terms}</p>
                  </div>
                )}
                
                {bid.notes && (
                  <div className="notes-section">
                    <h4>Additional Notes</h4>
                    <p>{bid.notes}</p>
                  </div>
                )}
                
                {bid.specialConditions && (
                  <div className="conditions-section">
                    <h4>Special Conditions</h4>
                    <p>{bid.specialConditions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {bid.attachments && bid.attachments.length > 0 && (
              <div className="section-card">
                <h2>Attachments ({bid.attachments.length})</h2>
                
                <div className="attachments-list">
                  {bid.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <div className="attachment-icon">📎</div>
                      <div className="attachment-info">
                        <span className="attachment-name">{attachment}</span>
                        <span className="attachment-size">~2.4 MB</span>
                      </div>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                        disabled={downloading}
                      >
                        {downloading ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bid-actions">
          <div className="actions-left">
            {isActive() && (
              <Link 
                to={`/supplier/rfq-opportunities/${bid.rfqId}`}
                className="btn btn-outline"
              >
                View RFQ Details
              </Link>
            )}
            
            {bid.status === 'won' && (
              <Link 
                to={`/supplier/orders/create?bid=${bid.id}`}
                className="btn btn-primary"
              >
                Create Purchase Order
              </Link>
            )}
          </div>
          
          <div className="actions-right">
            {canDuplicate() && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDuplicateConfirm(true)}
              >
                Duplicate Bid
              </button>
            )}
            
            {canWithdraw() && (
              <button 
                className="btn btn-danger"
                onClick={() => setShowWithdrawConfirm(true)}
              >
                Withdraw Bid
              </button>
            )}
            
            <button 
              className="btn btn-outline"
              onClick={() => window.print()}
            >
              Print Bid
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
        onConfirm={handleWithdrawConfirm}
        title="Withdraw Bid"
        message={`Are you sure you want to withdraw your bid for "${bid.rfqTitle}"? This action cannot be undone and may affect your supplier rating.`}
        confirmText="Withdraw Bid"
        cancelText="Cancel"
        type="danger"
      />

      {/* Duplicate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDuplicateConfirm}
        onClose={() => setShowDuplicateConfirm(false)}
        onConfirm={handleDuplicateConfirm}
        title="Duplicate Bid"
        message={`Create a copy of this bid for use in similar RFQ opportunities?`}
        confirmText="Duplicate Bid"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default BidDetails;