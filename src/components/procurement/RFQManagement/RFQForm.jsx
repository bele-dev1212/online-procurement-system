import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRFQ } from '../../../hooks/useRFQ';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './RFQForm.css';

const RFQForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { 
    createRFQ, 
    updateRFQ, 
    getRFQ, 
    loading  } = useRFQ();
  
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rfqNumber: '',
    supplierId: '',
    deadline: '',
    items: [{ productName: '', description: '', quantity: 1, unit: '' }],
    terms: '',
    notes: ''
  });

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadRFQ();
    } else {
      // Generate RFQ number for new RFQ
      generateRFQNumber();
    }
  }, [id]);

  useEffect(() => {
    if (formData.supplierId) {
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      setSelectedSupplier(supplier);
    }
  }, [formData.supplierId, suppliers]);

  const loadRFQ = async () => {
    try {
      const rfq = await getRFQ(id);
      setFormData({
        title: rfq.title,
        description: rfq.description,
        rfqNumber: rfq.rfqNumber,
        supplierId: rfq.supplier?.id || '',
        deadline: rfq.deadline.split('T')[0],
        items: rfq.items,
        terms: rfq.terms,
        notes: rfq.notes
      });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load RFQ', 'error');
      navigate('/procurement/rfq');
    }
  };

  const generateRFQNumber = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const rfqNumber = `RFQ-${timestamp}-${random}`;
    setFormData(prev => ({ ...prev, rfqNumber }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', description: '', quantity: 1, unit: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEdit) {
        await updateRFQ(id, formData);
        addNotification('RFQ updated successfully', 'success');
      } else {
        await createRFQ(formData);
        addNotification('RFQ created successfully', 'success');
      }
      navigate('/procurement/rfq');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification(`Failed to ${isEdit ? 'update' : 'create'} RFQ`, 'error');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await createRFQ({ ...formData, status: 'draft' });
      addNotification('RFQ saved as draft', 'success');
      navigate('/procurement/rfq');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to save draft', 'error');
    }
  };

  const calculateTotalItems = () => {
    return formData.items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  if (loading || suppliersLoading) return <LoadingSpinner />;

  return (
    <div className="rfq-form">
      <div className="form-header">
        <h1>{isEdit ? 'Edit RFQ' : 'Create New RFQ'}</h1>
        <p>{isEdit ? 'Update your request for quotation' : 'Create a new request for quotation'}</p>
      </div>

      <form onSubmit={handleSubmit} className="rfq-form-content">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rfqNumber">RFQ Number *</label>
              <input
                type="text"
                id="rfqNumber"
                name="rfqNumber"
                value={formData.rfqNumber}
                onChange={handleInputChange}
                required
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="title">RFQ Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter RFQ title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Submission Deadline *</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you're looking for..."
              rows="4"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Supplier Information</h3>
          <div className="supplier-selection">
            <div className="form-group">
              <label htmlFor="supplierId">Select Supplier *</label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose a supplier...</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} - {supplier.category}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setIsSupplierModalOpen(true)}
            >
              View Supplier Details
            </button>
          </div>

          {selectedSupplier && (
            <div className="supplier-info-card">
              <h4>Supplier Details</h4>
              <div className="supplier-details">
                <div><strong>Contact:</strong> {selectedSupplier.contactPerson}</div>
                <div><strong>Email:</strong> {selectedSupplier.email}</div>
                <div><strong>Phone:</strong> {selectedSupplier.phone}</div>
                <div><strong>Rating:</strong> {selectedSupplier.rating}/5</div>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Items Required</h3>
            <span className="items-count">{calculateTotalItems()} total items</span>
          </div>
          
          <div className="items-list">
            {formData.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="item-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Product description"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    >
                      <option value="">Select unit</option>
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="liters">Liters</option>
                      <option value="meters">Meters</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--danger btn--sm remove-item"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            className="btn btn--outline"
            onClick={addItem}
          >
            + Add Another Item
          </button>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label htmlFor="terms">Terms & Conditions</label>
            <textarea
              id="terms"
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              placeholder="Specify payment terms, delivery requirements, etc."
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes or special requirements..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate('/procurement/rfq')}
          >
            Cancel
          </button>
          {!isEdit && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </button>
          )}
          <button
            type="submit"
            className="btn btn--primary"
          >
            {isEdit ? 'Update RFQ' : 'Publish RFQ'}
          </button>
        </div>
      </form>

      {/* Supplier Details Modal */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title="Supplier Details"
      >
        {selectedSupplier ? (
          <div className="supplier-modal-content">
            <div className="supplier-header">
              <h4>{selectedSupplier.name}</h4>
              <span className={`status-badge status-badge--${selectedSupplier.status}`}>
                {selectedSupplier.status}
              </span>
            </div>
            <div className="supplier-details-grid">
              <div><strong>Category:</strong> {selectedSupplier.category}</div>
              <div><strong>Contact:</strong> {selectedSupplier.contactPerson}</div>
              <div><strong>Email:</strong> {selectedSupplier.email}</div>
              <div><strong>Phone:</strong> {selectedSupplier.phone}</div>
              <div><strong>Address:</strong> {selectedSupplier.address}</div>
              <div><strong>Rating:</strong> {selectedSupplier.rating}/5</div>
              <div><strong>Delivery Time:</strong> {selectedSupplier.deliveryTime} days</div>
            </div>
          </div>
        ) : (
          <p>Please select a supplier first.</p>
        )}
      </Modal>
    </div>
  );
};

export default RFQForm;