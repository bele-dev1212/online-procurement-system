// pages/SuperAdmin/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Toast from '../../../components/common/Toast';
import './Dashboard.css';

const SuperAdminDashboard = () => {
  const { 
    platformStats, 
    analytics, 
    loading, 
    error,
    fetchPlatformStats, 
    fetchUserGrowth,
    fetchRecentActivity,
    clearError
  } = useSuperAdmin();

  const [timeRange, setTimeRange] = useState('30d');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      clearError();
      await Promise.all([
        fetchPlatformStats(),
        fetchUserGrowth(timeRange),
        fetchRecentActivity()
      ]);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Use actual data from context
  const stats = platformStats || {};
  const recentActivity = analytics?.recentActivity || [];

  if (loading && !platformStats?.totalUsers && !error) {
    return <LoadingSpinner />;
  }

  return (
    <div className="super-admin-dashboard">
      {/* Toast Notifications */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        show={toast.show}
        onClose={() => setToast({ show: false, message: '', type: '' })}
      />

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button 
              onClick={clearError}
              className="error-dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-content">
          <h1>Platform Overview</h1>
          <p>Real-time insights and management tools</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
            aria-label="Select time range"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button 
            onClick={loadDashboardData}
            className="btn btn-refresh"
            aria-label="Refresh dashboard data"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-header">
            <div className="metric-icon">👥</div>
            <div className="metric-trend positive">
              +{calculateGrowth(stats.totalUsers, stats.previousUsers)}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <div className="metric-value">{formatNumber(stats.totalUsers)}</div>
            <div className="metric-description">
              {stats.buyerCount || 0} buyers • {stats.supplierCount || 0} suppliers
            </div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-header">
            <div className="metric-icon">🏢</div>
            <div className="metric-trend positive">
              +{calculateGrowth(stats.totalOrganizations, stats.previousOrganizations)}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Organizations</h3>
            <div className="metric-value">{formatNumber(stats.totalOrganizations)}</div>
            <div className="metric-description">
              {stats.activeOrganizations || 0} active
            </div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-header">
            <div className="metric-icon">💰</div>
            <div className="metric-trend positive">
              +{calculateGrowth(stats.monthlyRevenue, stats.previousRevenue)}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Monthly Revenue</h3>
            <div className="metric-value">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="metric-description">
              MRR • All plans
            </div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-header">
            <div className="metric-icon">📊</div>
            <div className="metric-trend positive">
              +{calculateGrowth(stats.activeRFQs, stats.previousRFQs)}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Active RFQs</h3>
            <div className="metric-value">{formatNumber(stats.activeRFQs)}</div>
            <div className="metric-description">
              Live requests for quotation
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="content-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Frequently used management tools</p>
          </div>
          <div className="action-grid">
            <Link to="/super-admin/organizations" className="action-card" aria-label="Manage organizations">
              <div className="action-icon">🏢</div>
              <div className="action-content">
                <h3>Organizations</h3>
                <p>Manage all buyer and supplier accounts</p>
                <span className="action-badge">{stats.totalOrganizations || 0} total</span>
              </div>
              <div className="action-arrow">→</div>
            </Link>

            <Link to="/super-admin/analytics" className="action-card" aria-label="View analytics">
              <div className="action-icon">📈</div>
              <div className="action-content">
                <h3>Platform Analytics</h3>
                <p>Detailed metrics and growth reports</p>
                <span className="action-badge">Advanced insights</span>
              </div>
              <div className="action-arrow">→</div>
            </Link>

            <Link to="/super-admin/billing" className="action-card" aria-label="Manage billing">
              <div className="action-icon">💳</div>
              <div className="action-content">
                <h3>Billing & Revenue</h3>
                <p>Subscription management and revenue tracking</p>
                <span className="action-badge">{formatCurrency(stats.monthlyRevenue)} MRR</span>
              </div>
              <div className="action-arrow">→</div>
            </Link>

            <Link to="/super-admin/settings" className="action-card" aria-label="System settings">
              <div className="action-icon">⚙️</div>
              <div className="action-content">
                <h3>System Configuration</h3>
                <p>Platform settings and preferences</p>
                <span className="action-badge">Configuration</span>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-section">
          {/* Recent Activity */}
          <div className="activity-card">
            <div className="section-header">
              <h3>Recent Activity</h3>
              <Link to="/super-admin/audit-logs" className="view-all-link">
                View All
              </Link>
            </div>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 6).map((activity, index) => (
                  <div key={activity.id || index} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.description}</p>
                      <span className="activity-time">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-activity">
                  <div className="empty-icon">📊</div>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="status-card">
            <div className="section-header">
              <h3>System Status</h3>
              <div className={`status-indicator ${stats.systemStatus || 'healthy'}`}>
                {stats.systemStatus === 'healthy' ? '✓' : '⚠'}
              </div>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span className="status-label">API Response</span>
                <span className="status-value healthy">Normal</span>
              </div>
              <div className="status-item">
                <span className="status-label">Database</span>
                <span className="status-value healthy">Connected</span>
              </div>
              <div className="status-item">
                <span className="status-label">Email Service</span>
                <span className="status-value healthy">Operational</span>
              </div>
              <div className="status-item">
                <span className="status-label">Uptime</span>
                <span className="status-value">{stats.uptime || '99.9%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="content-section full-width">
          <div className="section-header">
            <h2>Platform Growth</h2>
            <p>User and organization growth trends</p>
          </div>
          <div className="charts-grid">
            <div className="chart-card">
              <h4>User Growth</h4>
              <div className="chart-container">
                <div className="chart-placeholder">
                  <div className="placeholder-icon">📈</div>
                  <p>User growth chart</p>
                  <small>Data visualization would appear here</small>
                </div>
              </div>
            </div>
            <div className="chart-card">
              <h4>Revenue Trends</h4>
              <div className="chart-container">
                <div className="chart-placeholder">
                  <div className="placeholder-icon">💰</div>
                  <p>Revenue trends chart</p>
                  <small>Integration with chart library needed</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getActivityIcon = (action) => {
  const icons = {
    'user_registered': '👤',
    'organization_created': '🏢',
    'subscription_updated': '🔄',
    'payment_received': '💰',
    'rfq_created': '📋',
    'bid_submitted': '✅'
  };
  return icons[action] || '📝';
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now - time) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default SuperAdminDashboard;
