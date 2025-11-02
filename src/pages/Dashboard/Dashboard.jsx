import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api/dashboardAPI';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    recentActivities: [],
    quickStats: {},
    procurementMetrics: {},
    supplierPerformance: [],
    stockAlerts: [],
    pendingApprovals: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await dashboardAPI.getDashboardData(timeRange, userRole);
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
        // Set empty data structure if API fails
        setDashboardData({
          overview: {},
          recentActivities: [],
          quickStats: {},
          procurementMetrics: {},
          supplierPerformance: [],
          stockAlerts: [],
          pendingApprovals: []
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      setDashboardData({
        overview: {},
        recentActivities: [],
        quickStats: {},
        procurementMetrics: {},
        supplierPerformance: [],
        stockAlerts: [],
        pendingApprovals: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  const getTrendClass = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: '✅',
      warning: '⚠️',
      info: 'ℹ️',
      pending: '⏳',
      critical: '🔴',
      low: '🟡',
      out_of_stock: '🚫'
    };
    return icons[status] || '⚪';
  };

  const getStatusClass = (status) => {
    const classes = {
      completed: 'status-completed',
      warning: 'status-warning',
      info: 'status-info',
      pending: 'status-pending',
      critical: 'status-critical',
      low: 'status-low',
      out_of_stock: 'status-out-of-stock'
    };
    return classes[status] || 'status-default';
  };

  const getActivityIcon = (type) => {
    const icons = {
      purchase_order: '📋',
      stock_alert: '⚠️',
      supplier: '🏢',
      bidding: '💰',
      approval: '✅',
      requisition: '📝',
      contract: '📄'
    };
    return icons[type] || '📢';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    // Navigate to respective page or open modal
    switch (action) {
      case 'create_po':
        // navigate('/procurement/create-purchase-order');
        break;
      case 'create_requisition':
        // navigate('/procurement/requisitions/create');
        break;
      case 'view_reports':
        // navigate('/reports');
        break;
      case 'manage_suppliers':
        // navigate('/suppliers');
        break;
      default:
        console.log('Action:', action);
    }
  };

  const handleViewAll = (section) => {
    console.log('View all:', section);
    // Navigate to respective page
    // navigate(`/${section}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Procurement Dashboard</h1>
          <p>Welcome back! Here's what's happening with your procurement activities.</p>
        </div>
        <div className="header-actions">
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button className="btn-refresh" onClick={loadDashboardData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="overview-metrics">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Spend</h3>
              <div className="metric-value">{formatCurrency(dashboardData.overview?.totalSpend || 0)}</div>
              {dashboardData.overview?.spendChange !== undefined && (
                <div className={`metric-trend ${getTrendClass(dashboardData.overview.spendChange)}`}>
                  <span className="trend-icon">{getTrendIcon(dashboardData.overview.spendChange)}</span>
                  <span className="trend-value">{Math.abs(dashboardData.overview.spendChange)}%</span>
                </div>
              )}
              <span className="trend-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Total Orders</h3>
              <div className="metric-value">{formatNumber(dashboardData.overview?.totalOrders || 0)}</div>
              {dashboardData.overview?.ordersChange !== undefined && (
                <div className={`metric-trend ${getTrendClass(dashboardData.overview.ordersChange)}`}>
                  <span className="trend-icon">{getTrendIcon(dashboardData.overview.ordersChange)}</span>
                  <span className="trend-value">{Math.abs(dashboardData.overview.ordersChange)}%</span>
                </div>
              )}
              <span className="trend-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">💸</div>
          <div className="metric-content">
            <h3>Cost Savings</h3>
              <div className="metric-value">{formatCurrency(dashboardData.overview?.costSavings || 0)}</div>
              {dashboardData.overview?.savingsChange !== undefined && (
                <div className={`metric-trend ${getTrendClass(dashboardData.overview.savingsChange)}`}>
                  <span className="trend-icon">{getTrendIcon(dashboardData.overview.savingsChange)}</span>
                  <span className="trend-value">{Math.abs(dashboardData.overview.savingsChange)}%</span>
                </div>
              )}
              <span className="trend-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">🏢</div>
          <div className="metric-content">
            <h3>Active Suppliers</h3>
            <div className="metric-value">{formatNumber(dashboardData.overview?.activeSuppliers || 0)}</div>
            <div className="metric-subtitle">Managing relationships</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Compliance Rate</h3>
            <div className="metric-value">{dashboardData.overview?.complianceRate || 0}%</div>
            <div className="metric-subtitle">Policy adherence</div>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>Pending Approvals</h3>
            <div className="metric-value">{dashboardData.overview?.pendingApprovals || 0}</div>
            <div className="metric-subtitle">Require attention</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="content-left">
          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Quick Actions</h2>
              <span className="card-subtitle">Frequently used actions</span>
            </div>
            <div className="card-content">
              <div className="quick-actions-grid">
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('create_po')}
                >
                  <span className="action-icon">📋</span>
                  <span className="action-label">Create PO</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('create_requisition')}
                >
                  <span className="action-icon">📝</span>
                  <span className="action-label">New Requisition</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('manage_suppliers')}
                >
                  <span className="action-icon">🏢</span>
                  <span className="action-label">Manage Suppliers</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('view_reports')}
                >
                  <span className="action-icon">📊</span>
                  <span className="action-label">View Reports</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('track_orders')}
                >
                  <span className="action-icon">🚚</span>
                  <span className="action-label">Track Orders</span>
                </button>
                <button 
                  className="quick-action"
                  onClick={() => handleQuickAction('analyze_spend')}
                >
                  <span className="action-icon">💰</span>
                  <span className="action-label">Analyze Spend</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Activities</h2>
              <button 
                className="btn-view-all"
                onClick={() => handleViewAll('activities')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              <div className="activities-list">
                {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <div className="activity-meta">
                        <span className="user">{activity.user}</span>
                        <span className="time">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={`activity-status ${getStatusClass(activity.status)}`}>
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                ))
                ) : (
                  <div className="empty-state">
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Stock Alerts</h2>
              <span className="card-badge danger">{dashboardData.stockAlerts?.length || 0}</span>
            </div>
            <div className="card-content">
              <div className="alerts-list">
                {dashboardData.stockAlerts && dashboardData.stockAlerts.length > 0 ? (
                  dashboardData.stockAlerts.map(alert => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-icon">
                      {getStatusIcon(alert.status)}
                    </div>
                    <div className="alert-content">
                      <h4>{alert.product}</h4>
                      <p>SKU: {alert.sku}</p>
                      <div className="alert-meta">
                        <span>Current: {alert.currentStock}</span>
                        <span>Min: {alert.minStock}</span>
                      </div>
                    </div>
                    <div className="alert-actions">
                      <button className="btn-action small">
                        Create PO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-right">
          {/* Pending Approvals */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Pending Approvals</h2>
              <span className="card-badge warning">{dashboardData.pendingApprovals?.length || 0}</span>
            </div>
            <div className="card-content">
              <div className="approvals-list">
                {dashboardData.pendingApprovals && dashboardData.pendingApprovals.length > 0 ? (
                  dashboardData.pendingApprovals.map(approval => (
                  <div key={approval.id} className="approval-item">
                    <div className="approval-type">
                      {getActivityIcon(approval.type)}
                    </div>
                    <div className="approval-content">
                      <h4>{approval.reference}</h4>
                      <p>{formatCurrency(approval.amount)} • {approval.department}</p>
                      <div className="approval-meta">
                        <span>By: {approval.requester}</span>
                        <span>{approval.daysPending} day(s) pending</span>
                      </div>
                    </div>
                    <div className="approval-actions">
                      <button className="btn-action small primary">
                        Review
                      </button>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No pending approvals</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Performance */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Top Suppliers</h2>
              <button 
                className="btn-view-all"
                onClick={() => handleViewAll('suppliers')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              <div className="suppliers-list">
                {dashboardData.supplierPerformance && dashboardData.supplierPerformance.length > 0 ? (
                  dashboardData.supplierPerformance.map(supplier => (
                  <div key={supplier.id} className="supplier-item">
                    <div className="supplier-avatar">
                      {supplier.name.charAt(0)}
                    </div>
                    <div className="supplier-content">
                      <h4>{supplier.name}</h4>
                      <div className="supplier-rating">
                        <span className="stars">
                          {'★'.repeat(Math.floor(supplier.rating))}
                          {'☆'.repeat(5 - Math.floor(supplier.rating))}
                        </span>
                        <span className="rating-value">{supplier.rating}</span>
                      </div>
                      <div className="supplier-metrics">
                        <span>Delivery: {supplier.delivery}%</span>
                        <span>Quality: {supplier.quality}%</span>
                      </div>
                    </div>
                    <div className="supplier-spend">
                      <div className="spend-amount">
                        {formatCurrency(supplier.spend)}
                      </div>
                      <div className={`trend ${supplier.trend}`}>
                        {supplier.trend === 'up' ? '↗️' : supplier.trend === 'down' ? '↘️' : '→'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Procurement Metrics */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Procurement Metrics</h2>
              <span className="card-subtitle">Key performance indicators</span>
            </div>
            <div className="card-content">
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">Avg Processing Time</div>
                  <div className="metric-value">{dashboardData.procurementMetrics?.avgProcessingTime || 0} days</div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Approval Rate</div>
                  <div className="metric-value">{dashboardData.procurementMetrics?.approvalRate || 0}%</div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${dashboardData.procurementMetrics?.approvalRate || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Compliance Rate</div>
                  <div className="metric-value">{dashboardData.procurementMetrics?.complianceRate || 0}%</div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${dashboardData.procurementMetrics?.complianceRate || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Supplier Diversity</div>
                  <div className="metric-value">{dashboardData.procurementMetrics?.supplierDiversity || 0}%</div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${dashboardData.procurementMetrics?.supplierDiversity || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Cost Avoidance</div>
                  <div className="metric-value">{formatCurrency(dashboardData.procurementMetrics?.costAvoidance || 0)}</div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Cycle Time</div>
                  <div className="metric-value">{dashboardData.procurementMetrics?.cycleTime || 0} days</div>
                  <div className="metric-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Quick Stats</h2>
              <span className="card-subtitle">At a glance</span>
            </div>
            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">📝</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashboardData.quickStats?.pendingRequisitions || 0}</div>
                    <div className="stat-label">Pending Requisitions</div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashboardData.quickStats?.openRFQs || 0}</div>
                    <div className="stat-label">Open RFQs</div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">⚖️</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashboardData.quickStats?.activeBids || 0}</div>
                    <div className="stat-label">Active Bids</div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">🚨</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashboardData.quickStats?.overdueDeliveries || 0}</div>
                    <div className="stat-label">Overdue Deliveries</div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashboardData.quickStats?.supplierEvaluations || 0}</div>
                    <div className="stat-label">Supplier Evaluations</div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">📄</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashboardData.quickStats?.contractRenewals || 0}</div>
                    <div className="stat-label">Contract Renewals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;