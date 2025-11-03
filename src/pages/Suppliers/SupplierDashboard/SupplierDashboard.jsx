// src/pages/Suppliers/SupplierDashboard/SupplierDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supplierAPI } from '../../../services/api/suppliersAPI';
import { dashboardAPI } from '../../../services/api/dashboardAPI';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Notification from '../../../components/common/Notification/Notification';
import Modal from '../../../components/common/Modal/Modal';
import './SupplierDashboard.css';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await dashboardAPI.getSupplierDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
        
        if (isRefresh) {
          setSuccessMessage('Dashboard updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } else {
        throw new Error(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      
      // Fallback mock data for development
      if (process.env.NODE_ENV === 'development') {
        setDashboardData(getMockDashboardData());
        setError(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Handle quick actions
  const handleQuickAction = async (action, data = {}) => {
    try {
      setError(null);
      
      switch (action) {
        case 'update-profile':
          setShowProfileModal(true);
          break;
          
        case 'view-rfq-opportunities':
          navigate('/supplier/rfq-opportunities');
          break;
          
        case 'view-orders':
          navigate('/supplier/orders');
          break;
          
        case 'contact-support':
          window.open('mailto:support@procurementpro.com', '_blank');
          break;
          
        default:
          console.warn('Unknown action:', action);
      }
    } catch (err) {
      console.error('Quick action failed:', err);
      setError(`Failed to perform action: ${err.message}`);
    }
  };

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'active': 'status-active',
      'inactive': 'status-inactive',
      'won': 'status-won',
      'lost': 'status-lost',
      'completed': 'status-completed'
    };
    
    return statusMap[status] || 'status-default';
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (!dashboardData) return [];
    
    const { 
      totalOrders = 0, 
      completedOrders = 0,
      pendingOrders = 0,
      totalRevenue = 0,
      activeRFQs = 0,
      bidsSubmitted = 0,
      successfulBids = 0
    } = dashboardData.stats || {};
    
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const successRate = bidsSubmitted > 0 ? (successfulBids / bidsSubmitted) * 100 : 0;
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    
    return [
      {
        label: 'Completion Rate',
        value: `${completionRate.toFixed(1)}%`,
        trend: completionRate > 85 ? '↑ Excellent' : completionRate > 70 ? '↑ Good' : '↓ Needs Improvement',
        description: 'Orders delivered on time'
      },
      {
        label: 'Bid Success Rate',
        value: `${successRate.toFixed(1)}%`,
        trend: successRate > 30 ? '↑ High' : successRate > 15 ? '→ Average' : '↓ Low',
        description: 'RFQs won vs submitted'
      },
      {
        label: 'Avg Order Value',
        value: formatCurrency(avgOrderValue),
        trend: avgOrderValue > 10000 ? '↑ High' : avgOrderValue > 5000 ? '→ Good' : '↓ Low',
        description: 'Average revenue per order'
      },
      {
        label: 'Response Time',
        value: '2.4h',
        trend: '↑ Fast',
        description: 'Average bid response time'
      }
    ];
  };

  // Mock data for development
  const getMockDashboardData = () => {
    return {
      supplier: {
        name: user?.companyName || 'Tech Supplies Inc.',
        tier: 'Gold',
        memberSince: '2023-01-15',
        rating: 4.8,
        completedProjects: 47
      },
      stats: {
        totalOrders: 24,
        completedOrders: 18,
        pendingOrders: 6,
        totalRevenue: 452800,
        activeRFQs: 12,
        bidsSubmitted: 8,
        successfulBids: 3,
        urgentAlerts: 2
      },
      recentRFQs: [
        {
          id: '1',
          title: 'Industrial Sensors Procurement',
          organization: 'Tech Manufacturing Inc.',
          value: 125000,
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          hasBid: true
        },
        {
          id: '2',
          title: 'Office Furniture Supply',
          organization: 'Global Innovations LLC',
          value: 75000,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          hasBid: false
        },
        {
          id: '3',
          title: 'Construction Materials',
          organization: 'BuildRight Constructions',
          value: 234000,
          deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'expired',
          hasBid: true
        }
      ],
      recentOrders: [
        {
          id: '1',
          orderNumber: 'PO-2024-001',
          organization: 'Tech Manufacturing Inc.',
          products: ['Industrial Sensors', 'Monitoring Equipment'],
          amount: 125000,
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_production',
          deliveryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          orderNumber: 'PO-2024-002',
          organization: 'Global Innovations LLC',
          products: ['Office Chairs', 'Standing Desks'],
          amount: 45000,
          orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ready_to_ship',
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          orderNumber: 'PO-2024-003',
          organization: 'BuildRight Constructions',
          products: ['Steel Beams', 'Concrete Mix'],
          amount: 187000,
          orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          deliveryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      alerts: [
        {
          id: '1',
          type: 'urgent',
          title: 'Order Delivery Deadline Approaching',
          message: 'Order PO-2024-002 needs to be shipped within 2 days',
          timestamp: new Date().toISOString(),
          action: {
            type: 'view_order',
            label: 'View Order',
            url: '/supplier/orders/2'
          }
        },
        {
          id: '2',
          type: 'warning',
          title: 'RFQ Submission Deadline',
          message: 'Bid for Industrial Sensors RFQ due in 6 hours',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action: {
            type: 'submit_bid',
            label: 'Submit Bid',
            url: '/supplier/rfq-opportunities/1/bid'
          }
        }
      ]
    };
  };

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="supplier-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>Supplier Dashboard</h1>
              <p>Loading your dashboard...</p>
            </div>
          </div>
        </div>
        <LoadingSpinner message="Loading your supplier dashboard..." />
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="supplier-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>Supplier Dashboard</h1>
              <p>Welcome back, {user?.name || 'Supplier'}!</p>
            </div>
          </div>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Dashboard</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => loadDashboardData()}>
              Try Again
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/supplier/profile')}>
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { supplier, stats, recentRFQs = [], recentOrders = [], alerts = [] } = dashboardData || {};
  const performanceMetrics = calculatePerformanceMetrics();

  return (
    <div className="supplier-dashboard">
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
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>
              Welcome back, {user?.name || 'Supplier'}!
              {refreshing && <span className="refreshing-indicator">🔄</span>}
            </h1>
            <p>Here's what's happening with your business today</p>
            <div className="supplier-info">
              <span className="supplier-badge">{supplier?.tier || 'Standard'} Supplier</span>
              <span className="member-since">
                Member since {supplier?.memberSince ? formatDate(supplier.memberSince) : '2023'}
              </span>
              {supplier?.rating && (
                <span className="supplier-badge">
                  ⭐ {supplier.rating} Rating
                </span>
              )}
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => handleQuickAction('update-profile')}
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="performance-grid">
          <div className="performance-metric">
            <div className="metric-value">{stats?.totalOrders || 0}</div>
            <div className="metric-label">Total Orders</div>
            <div className="metric-trend">
              {stats?.totalOrders > 20 ? '↑ High' : stats?.totalOrders > 10 ? '→ Steady' : '↓ Low'}
            </div>
          </div>
          
          <div className="performance-metric">
            <div className="metric-value">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <div className="metric-label">Total Revenue</div>
            <div className="metric-trend">
              {stats?.totalRevenue > 500000 ? '↑ Excellent' : stats?.totalRevenue > 200000 ? '→ Good' : '↓ Growing'}
            </div>
          </div>
          
          <div className="performance-metric">
            <div className="metric-value">{stats?.activeRFQs || 0}</div>
            <div className="metric-label">Active RFQs</div>
            <div className="metric-trend">
              {stats?.activeRFQs > 15 ? '↑ Many' : stats?.activeRFQs > 5 ? '→ Good' : '↓ Few'}
            </div>
          </div>
          
          <div className="performance-metric">
            <div className="metric-value">{stats?.successfulBids || 0}</div>
            <div className="metric-label">Won Bids</div>
            <div className="metric-trend">
              {stats?.successfulBids > 5 ? '↑ High' : stats?.successfulBids > 2 ? '→ Average' : '↓ Low'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Manage your supplier activities efficiently</p>
        </div>
        
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => handleQuickAction('view-rfq-opportunities')}
          >
            <div className="action-icon">🎯</div>
            <div className="action-content">
              <h3>Browse RFQs</h3>
              <p>Find new business opportunities</p>
              <span className="action-badge">{stats?.activeRFQs || 0} available</span>
            </div>
          </button>
          
          <button 
            className="action-card"
            onClick={() => handleQuickAction('view-orders')}
          >
            <div className="action-icon">📦</div>
            <div className="action-content">
              <h3>Manage Orders</h3>
              <p>Track and fulfill purchase orders</p>
              <span className="action-badge">{stats?.pendingOrders || 0} pending</span>
            </div>
          </button>
          
          <Link 
            to="/supplier/performance"
            className="action-card"
          >
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>View Analytics</h3>
              <p>Track your performance metrics</p>
              <span className="action-badge">Detailed reports</span>
            </div>
          </Link>
          
          <button 
            className="action-card"
            onClick={() => handleQuickAction('contact-support')}
          >
            <div className="action-icon">💬</div>
            <div className="action-content">
              <h3>Get Support</h3>
              <p>Contact our support team</p>
              <span className="action-badge">24/7 available</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="content-grid">
          {/* Recent RFQs Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent RFQ Opportunities</h3>
              <Link to="/supplier/rfq-opportunities" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="card-content">
              {recentRFQs.length > 0 ? (
                <div className="rfq-list">
                  {recentRFQs.map(rfq => (
                    <div key={rfq.id} className="rfq-item">
                      <div className="rfq-info">
                        <h4 className="rfq-title">{rfq.title}</h4>
                        <div className="rfq-meta">
                          <span className="rfq-org">{rfq.organization}</span>
                          <span className="rfq-value">{formatCurrency(rfq.value)}</span>
                        </div>
                        <div className="rfq-details">
                          <span className="rfq-deadline">
                            Due: {formatRelativeTime(rfq.deadline)}
                          </span>
                          <span className={`rfq-status ${getStatusBadgeClass(rfq.status)}`}>
                            {rfq.status}
                          </span>
                        </div>
                      </div>
                      <div className="rfq-actions">
                        {rfq.status === 'active' && !rfq.hasBid && (
                          <Link 
                            to={`/supplier/rfq-opportunities/${rfq.id}/bid`}
                            className="btn btn-primary btn-sm"
                          >
                            Bid Now
                          </Link>
                        )}
                        {rfq.hasBid && (
                          <span className="bid-submitted">✅ Bid Submitted</span>
                        )}
                        <Link 
                          to={`/supplier/rfq-opportunities/${rfq.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <p>No recent RFQ opportunities</p>
                  <Link to="/supplier/rfq-opportunities" className="btn btn-outline btn-sm">
                    Browse RFQs
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <Link to="/supplier/orders" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="card-content">
              {recentOrders.length > 0 ? (
                <div className="orders-table">
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(order => (
                          <tr key={order.id}>
                            <td className="order-id">{order.orderNumber}</td>
                            <td className="order-org">{order.organization}</td>
                            <td className="order-amount">{formatCurrency(order.amount)}</td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="order-actions">
                              <Link 
                                to={`/supplier/orders/${order.id}`}
                                className="btn btn-outline btn-sm"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>No recent orders</p>
                  <Link to="/supplier/rfq-opportunities" className="btn btn-outline btn-sm">
                    Find Opportunities
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Performance Metrics</h3>
              <Link to="/supplier/analytics" className="view-all-link">
                Detailed Report →
              </Link>
            </div>
            <div className="card-content">
              <div className="performance-metrics">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="performance-metric-card">
                    <div className="metric-main">
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-label">{metric.label}</div>
                    </div>
                    <div className="metric-secondary">
                      <div className="metric-trend">{metric.trend}</div>
                      <div className="metric-description">{metric.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Alerts & Notifications</h3>
              <span className="alert-count">{alerts.length} alerts</span>
            </div>
            <div className="card-content">
              {alerts.length > 0 ? (
                <div className="alerts-list">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`alert-item ${alert.type}`}>
                      <div className="alert-icon">
                        {alert.type === 'urgent' ? '🚨' : '⚠️'}
                      </div>
                      <div className="alert-content">
                        <h4 className="alert-title">{alert.title}</h4>
                        <p className="alert-message">{alert.message}</p>
                        <div className="alert-meta">
                          <span className="alert-time">
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                          {alert.action && (
                            <Link to={alert.action.url} className="alert-action">
                              {alert.action.label} →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔔</div>
                  <p>No new alerts</p>
                  <p className="empty-subtext">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Update Supplier Profile"
        size="medium"
      >
        <div className="profile-update-modal">
          <p>This would open a form to update your supplier profile information, capabilities, and preferences.</p>
          <div className="modal-actions">
            <button 
              className="btn btn-outline"
              onClick={() => setShowProfileModal(false)}
            >
              Cancel
            </button>
            <Link 
              to="/supplier/profile" 
              className="btn btn-primary"
              onClick={() => setShowProfileModal(false)}
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierDashboard;