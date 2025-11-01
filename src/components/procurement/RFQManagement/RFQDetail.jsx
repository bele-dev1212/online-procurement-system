import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRFQ } from '../../../hooks/useRFQ';
import { useBidding } from '../../../hooks/useBidding';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './RFQDetail.css';

const RFQDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRFQ, updateRFQStatus, loading, error } = useRFQ();
  const { getBidsByRFQ, createBid } = useBidding();
  const { addNotification } = useNotifications();

  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [bidData, setBidData] = useState({
    amount: '',
    validity: '',
    deliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadRFQ();
    loadBids();
  }, [id]);

  const loadRFQ = async () => {
    try {
      const data = await getRFQ(id);
      setRfq(data);
      setSelectedStatus(data.status);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load RFQ', 'error');
    }
  };

  const loadBids = async () => {
    try {
      const data = await getBidsByRFQ(id);
      setBids(data);
    } catch (err) {
      console.error('Failed to load bids:', err);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateRFQStatus(id, selectedStatus);
      await loadRFQ();
      setIsStatusModalOpen(false);
      addNotification('RFQ status updated successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to update status', 'error');
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    try {
      await createBid({
        rfqId: id,
        ...bidData,
        amount: parseFloat(bidData.amount)
      });
      await loadBids();
      setIsBidModalOpen(false);
      setBidData({ amount: '', validity: '', deliveryDate: '', notes: '' });
      addNotification('Bid submitted successfully', 'success');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to submit bid', 'error');
    }
  };

  const handleAwardBid = async () => {
    try {
      // This would typically update the bid status and RFQ status
      addNotification('Bid awarded successfully', 'success');
      await loadRFQ();
      await loadBids();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to award bid', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      draft: 'status-badge--draft',
      published: 'status-badge--published',
      'bidding-open': 'status-badge--bidding-open',
      'bidding-closed': 'status-badge--bidding-closed',
      awarded: 'status-badge--awarded',
      cancelled: 'status-badge--cancelled'
    };
    return `status-badge ${statusClasses[status] || 'status-badge--draft'}`;
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getLowestBid = () => {
    if (bids.length === 0) return null;
    return bids.reduce((lowest, bid) => 
      bid.amount < lowest.amount ? bid : lowest
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!rfq) return <div className="not-found">RFQ not found</div>;

  const lowestBid = getLowestBid();
  const daysRemaining = getDaysRemaining(rfq.deadline);

  return (
    <div className="rfq-detail">
      {/* Header Section */}
      <div className="detail-header">
        <div className="header-left">
          <button 
            className="btn btn--secondary"
            onClick={() => navigate('/procurement/rfq')}
          >
            ← Back to List
          </button>
          <div className="header-title">
            <h1>{rfq.title}</h1>
            <div className="header-meta">
              <span className="rfq-number">{rfq.rfqNumber}</span>
              <span className={getStatusBadgeClass(rfq.status)}>
                {rfq.status.replace('-', ' ')}
              </span>
              {rfq.status === 'bidding-open' && (
                <span className={`days-remaining ${daysRemaining <= 3 ? 'urgent' : ''}`}>
                  {daysRemaining} days remaining
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          {rfq.status === 'bidding-open' && (
            <button 
              className="btn btn--primary"
              onClick={() => setIsBidModalOpen(true)}
            >
              Submit Bid
            </button>
          )}
          <button 
            className="btn btn--outline"
            onClick={() => window.print()}
          >
            Print
          </button>
          <button 
            className="btn btn--secondary"
            onClick={() => setIsStatusModalOpen(true)}
          >
            Update Status
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Basic Information */}
        <div className="info-card">
          <h3>RFQ Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>RFQ Number</label>
              <span>{rfq.rfqNumber}</span>
            </div>
            <div className="info-item">
              <label>Created Date</label>
              <span>{new Date(rfq.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Submission Deadline</label>
              <span>{new Date(rfq.deadline).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Total Items</label>
              <span>{calculateTotalItems(rfq.items)}</span>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="info-card">
          <h3>Supplier Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Supplier Name</label>
              <span>{rfq.supplier?.name || 'Multiple Suppliers'}</span>
            </div>
            <div className="info-item">
              <label>Contact Person</label>
              <span>{rfq.supplier?.contactPerson}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{rfq.supplier?.email}</span>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span>{rfq.supplier?.phone}</span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="info-card">
          <h3>Items Required</h3>
          <div className="table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {rfq.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bids Section */}
        <div className="info-card">
          <div className="section-header">
            <h3>Received Bids ({bids.length})</h3>
            {lowestBid && (
              <div className="lowest-bid">
                Lowest Bid: <strong>${lowestBid.amount.toFixed(2)}</strong>
              </div>
            )}
          </div>
          
          {bids.length === 0 ? (
            <div className="no-bids">
              <p>No bids received yet.</p>
            </div>
          ) : (
            <div className="bids-list">
              {bids.map(bid => (
                <div key={bid.id} className="bid-card">
                  <div className="bid-header">
                    <div className="bid-amount">${bid.amount.toFixed(2)}</div>
                    <div className="bid-meta">
                      <span className={`bid-status ${bid.status}`}>
                        {bid.status}
                      </span>
                      {bid.status === 'submitted' && rfq.status === 'bidding-closed' && (
                        <button
                          className="btn btn--sm btn--primary"
                          onClick={() => handleAwardBid(bid.id)}
                        >
                          Award
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bid-details">
                    <div><strong>Validity:</strong> {bid.validity} days</div>
                    <div><strong>Delivery Date:</strong> {new Date(bid.deliveryDate).toLocaleDateString()}</div>
                    {bid.notes && (
                      <div><strong>Notes:</strong> {bid.notes}</div>
                    )}
                    <div><strong>Submitted:</strong> {new Date(bid.submittedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="info-card">
          <h3>Additional Information</h3>
          <div className="info-grid">
            <div className="info-item full-width">
              <label>Description</label>
              <p>{rfq.description}</p>
            </div>
            <div className="info-item full-width">
              <label>Terms & Conditions</label>
              <p>{rfq.terms || 'Standard terms and conditions apply'}</p>
            </div>
            <div className="info-item full-width">
              <label>Notes</label>
              <p>{rfq.notes || 'No additional notes'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update RFQ Status"
      >
        <div className="status-modal">
          <div className="form-group">
            <label>New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="bidding-open">Bidding Open</option>
              <option value="bidding-closed">Bidding Closed</option>
              <option value="awarded">Awarded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="modal-actions">
            <button 
              className="btn btn--secondary"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn--primary"
              onClick={handleStatusUpdate}
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Submit Bid Modal */}
      <Modal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        title="Submit Bid"
      >
        <form onSubmit={handleSubmitBid} className="bid-form">
          <div className="form-group">
            <label>Bid Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              value={bidData.amount}
              onChange={(e) => setBidData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Bid Validity (days) *</label>
            <input
              type="number"
              value={bidData.validity}
              onChange={(e) => setBidData(prev => ({ ...prev, validity: e.target.value }))}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Proposed Delivery Date *</label>
            <input
              type="date"
              value={bidData.deliveryDate}
              onChange={(e) => setBidData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={bidData.notes}
              onChange={(e) => setBidData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional comments or conditions..."
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button 
              type="button"
              className="btn btn--secondary"
              onClick={() => setIsBidModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn--primary"
            >
              Submit Bid
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RFQDetail;