import React, { useState, useEffect } from 'react';
import './StockAlert.css';

const StockAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'out', 'expiring'

  // Mock data - replace with actual API call
  const mockAlerts = [
    {
      id: 1,
      productName: 'Laptop Dell XPS 13',
      sku: 'DLXPS13-001',
      currentStock: 2,
      minStock: 5,
      alertType: 'low',
      severity: 'high',
      lastUpdated: '2024-01-15T10:30:00Z',
      category: 'Electronics'
    },
    {
      id: 2,
      productName: 'Office Chair Ergonomic',
      sku: 'OFCHR-ERG-002',
      currentStock: 0,
      minStock: 3,
      alertType: 'out',
      severity: 'critical',
      lastUpdated: '2024-01-15T09:15:00Z',
      category: 'Furniture'
    },
    {
      id: 3,
      productName: 'Wireless Mouse',
      sku: 'WLMS-003',
      currentStock: 8,
      minStock: 10,
      alertType: 'low',
      severity: 'medium',
      lastUpdated: '2024-01-14T16:45:00Z',
      category: 'Electronics'
    },
    {
      id: 4,
      productName: 'A4 Printer Paper',
      sku: 'PAP-A4-500',
      currentStock: 15,
      minStock: 20,
      alertType: 'low',
      severity: 'low',
      lastUpdated: '2024-01-14T14:20:00Z',
      category: 'Office Supplies'
    },
    {
      id: 5,
      productName: 'Desk Lamp LED',
      sku: 'LMP-LED-005',
      currentStock: 25,
      minStock: 8,
      alertType: 'adequate',
      severity: 'none',
      lastUpdated: '2024-01-13T11:10:00Z',
      category: 'Furniture'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // In real implementation, this would be:
        // const response = await inventoryAPI.getStockAlerts();
        // setAlerts(response.data);
        
        // Using mock data for now
        setTimeout(() => {
          setAlerts(mockAlerts);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching stock alerts:', error);
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '🟢';
    }
  };

  const getAlertTypeText = (alertType) => {
    switch (alertType) {
      case 'low':
        return 'Low Stock';
      case 'out':
        return 'Out of Stock';
      case 'expiring':
        return 'Expiring Soon';
      case 'adequate':
        return 'Adequate Stock';
      default:
        return 'Unknown';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-none';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.alertType === filter;
  });

  const handleDismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    // In real implementation, you would call an API to mark alert as dismissed
  };

  const handleCreatePurchaseOrder = (product) => {
    // This would navigate to purchase order creation with pre-filled product data
    console.log('Create PO for:', product);
    // navigate('/procurement/create-purchase-order', { state: { product } });
  };

  const getStockPercentage = (current, min) => {
    if (min === 0) return 100;
    return Math.min(100, (current / min) * 100);
  };

  if (loading) {
    return (
      <div className="stock-alert-loading">
        <div className="loading-spinner"></div>
        <p>Loading stock alerts...</p>
      </div>
    );
  }

  return (
    <div className="stock-alert">
      <div className="stock-alert-header">
        <h2>Stock Alerts</h2>
        <div className="alert-summary">
          <div className="summary-item critical">
            <span className="count">
              {alerts.filter(a => a.severity === 'critical').length}
            </span>
            <span className="label">Critical</span>
          </div>
          <div className="summary-item high">
            <span className="count">
              {alerts.filter(a => a.severity === 'high').length}
            </span>
            <span className="label">High</span>
          </div>
          <div className="summary-item medium">
            <span className="count">
              {alerts.filter(a => a.severity === 'medium').length}
            </span>
            <span className="label">Medium</span>
          </div>
        </div>
      </div>

      <div className="stock-alert-controls">
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Alerts
          </button>
          <button 
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low Stock
          </button>
          <button 
            className={`filter-btn ${filter === 'out' ? 'active' : ''}`}
            onClick={() => setFilter('out')}
          >
            Out of Stock
          </button>
        </div>
        
        <div className="alert-actions">
          <button className="btn-refresh" onClick={() => window.location.reload()}>
            Refresh
          </button>
          <button className="btn-export">
            Export Report
          </button>
        </div>
      </div>

      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <h3>No Stock Alerts</h3>
            <p>All products have adequate stock levels.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className={`alert-item ${getSeverityClass(alert.severity)}`}>
                <div className="alert-icon">
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="alert-content">
                  <div className="alert-header">
                    <h4 className="product-name">{alert.productName}</h4>
                    <span className="alert-type">{getAlertTypeText(alert.alertType)}</span>
                  </div>
                  
                  <div className="alert-details">
                    <div className="detail-item">
                      <span className="label">SKU:</span>
                      <span className="value">{alert.sku}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Category:</span>
                      <span className="value">{alert.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Current Stock:</span>
                      <span className="value stock-count">{alert.currentStock}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Minimum Required:</span>
                      <span className="value">{alert.minStock}</span>
                    </div>
                  </div>

                  {alert.alertType !== 'adequate' && (
                    <div className="stock-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${getStockPercentage(alert.currentStock, alert.minStock)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {Math.round(getStockPercentage(alert.currentStock, alert.minStock))}% of minimum
                      </span>
                    </div>
                  )}

                  <div className="alert-actions">
                    {alert.alertType !== 'adequate' && (
                      <button 
                        className="btn-create-po"
                        onClick={() => handleCreatePurchaseOrder(alert)}
                      >
                        Create Purchase Order
                      </button>
                    )}
                    <button 
                      className="btn-dismiss"
                      onClick={() => handleDismissAlert(alert.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <div className="alert-meta">
                  <span className="timestamp">
                    {new Date(alert.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stock-alert-footer">
        <p className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default StockAlert;