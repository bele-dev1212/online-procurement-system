import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Toast from '../../../components/common/Toast';
import SimpleBarChart from '../../../components/charts/SimpleBarChart';
import './PlatformAnalytics.css';

const PlatformAnalytics = () => {
  const { 
    platformStats, 
    analytics, 
    loading, 
    fetchPlatformStats, 
    fetchUserGrowth,
    fetchRevenueMetrics,
    fetchPlatformActivity,
    fetchSubscriptionAnalytics
  } = useSuperAdmin();
  
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, activeTab]);

  const loadAnalyticsData = async () => {
    try {
      setRefreshing(true);
      
      await Promise.all([
        fetchPlatformStats(),
        fetchUserGrowth(timeRange),
        fetchRevenueMetrics(timeRange),
        fetchPlatformActivity(timeRange),
        fetchSubscriptionAnalytics()
      ]);
      
    } catch (error) {
      showToast('Failed to load analytics data', 'error');
    } finally {
      setRefreshing(false);
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

  const getGrowthData = () => {
    if (!platformStats) return { users: 0, organizations: 0, revenue: 0, rfqs: 0 };
    
    return {
      users: calculateGrowth(platformStats.totalUsers, platformStats.previousPeriodUsers),
      organizations: calculateGrowth(platformStats.totalOrganizations, platformStats.previousPeriodOrganizations),
      revenue: calculateGrowth(platformStats.monthlyRevenue, platformStats.previousPeriodRevenue),
      rfqs: calculateGrowth(platformStats.activeRFQs, platformStats.previousPeriodRFQs)
    };
  };

  const growthData = getGrowthData();

  if (loading && !platformStats?.totalUsers) return <LoadingSpinner />;

  return (
    <div className="platform-analytics">
      {/* Toast Notifications */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      <div className="analytics-header">
        <div className="header-content">
          <h1>Platform Analytics</h1>
          <p>Comprehensive insights and performance metrics</p>
        </div>
        <div className="header-controls">
          <div className="time-range-selector">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              aria-label="Select time range for analytics"
              disabled={refreshing}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <button 
            onClick={loadAnalyticsData}
            className="btn btn-refresh"
            disabled={refreshing}
            aria-label="Refresh analytics data"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button 
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Platform Activity
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-header">
            <div className="metric-icon">👥</div>
            <div className={`metric-trend ${growthData.users >= 0 ? 'positive' : 'negative'}`}>
              {growthData.users >= 0 ? '+' : ''}{growthData.users}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <div className="metric-value">{formatNumber(platformStats?.totalUsers || 0)}</div>
            <div className="metric-description">
              <span className="user-type buyers">{platformStats?.buyerCount || 0} buyers</span>
              <span className="user-type suppliers">{platformStats?.supplierCount || 0} suppliers</span>
            </div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-header">
            <div className="metric-icon">🏢</div>
            <div className={`metric-trend ${growthData.organizations >= 0 ? 'positive' : 'negative'}`}>
              {growthData.organizations >= 0 ? '+' : ''}{growthData.organizations}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Organizations</h3>
            <div className="metric-value">{formatNumber(platformStats?.totalOrganizations || 0)}</div>
            <div className="metric-description">
              {platformStats?.activeOrganizations || 0} active • {platformStats?.newOrganizations || 0} new
            </div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-header">
            <div className="metric-icon">💰</div>
            <div className={`metric-trend ${growthData.revenue >= 0 ? 'positive' : 'negative'}`}>
              {growthData.revenue >= 0 ? '+' : ''}{growthData.revenue}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Monthly Revenue</h3>
            <div className="metric-value">{formatCurrency(platformStats?.monthlyRevenue || 0)}</div>
            <div className="metric-description">
              MRR • {platformStats?.recurringCustomers || 0} paying customers
            </div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-header">
            <div className="metric-icon">📊</div>
            <div className={`metric-trend ${growthData.rfqs >= 0 ? 'positive' : 'negative'}`}>
              {growthData.rfqs >= 0 ? '+' : ''}{growthData.rfqs}%
            </div>
          </div>
          <div className="metric-content">
            <h3>Active RFQs</h3>
            <div className="metric-value">{formatNumber(platformStats?.activeRFQs || 0)}</div>
            <div className="metric-description">
              {platformStats?.completedRFQs || 0} completed • {platformStats?.averageResponseTime || 'N/A'} avg response
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Growth Trend</h3>
              <span className="chart-subtitle">New users over time</span>
            </div>
            <div className="chart-container">
              <SimpleBarChart 
                data={analytics?.userGrowth || []} 
                timeRange={timeRange}
                title="User Growth"
              />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Trends</h3>
              <span className="chart-subtitle">Monthly recurring revenue</span>
            </div>
            <div className="chart-container">
              <SimpleBarChart 
                data={analytics?.revenueTrends || []} 
                timeRange={timeRange}
                title="Revenue"
                type="revenue"
              />
            </div>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>Platform Activity</h3>
              <span className="chart-subtitle">RFQs, bids, and user actions</span>
            </div>
            <div className="chart-container">
              <SimpleBarChart 
                data={analytics?.platformActivity || []} 
                timeRange={timeRange}
                title="Platform Activity"
                type="activity"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Sections */}
      <div className="detailed-analytics">
        <div className="analytics-column">
          <div className="analytics-card">
            <div className="card-header">
              <h3>User Distribution</h3>
              <span className="card-subtitle">Breakdown by user type</span>
            </div>
            <div className="distribution-content">
              <div className="distribution-item">
                <div className="distribution-info">
                  <span className="distribution-label">Buyer Users</span>
                  <span className="distribution-value">{platformStats?.buyerCount || 0}</span>
                </div>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill buyers"
                    style={{ 
                      width: `${((platformStats?.buyerCount || 0) / (platformStats?.totalUsers || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="distribution-percentage">
                  {((platformStats?.buyerCount || 0) / (platformStats?.totalUsers || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="distribution-item">
                <div className="distribution-info">
                  <span className="distribution-label">Supplier Users</span>
                  <span className="distribution-value">{platformStats?.supplierCount || 0}</span>
                </div>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill suppliers"
                    style={{ 
                      width: `${((platformStats?.supplierCount || 0) / (platformStats?.totalUsers || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="distribution-percentage">
                  {((platformStats?.supplierCount || 0) / (platformStats?.totalUsers || 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3>Subscription Distribution</h3>
              <span className="card-subtitle">Organization plan breakdown</span>
            </div>
            <div className="subscription-content">
              {analytics?.subscriptionDistribution?.map((plan, index) => (
                <div key={plan.name || index} className="subscription-item">
                  <div className="subscription-info">
                    <span className="subscription-name">{plan.name}</span>
                    <span className="subscription-count">{plan.count} organizations</span>
                  </div>
                  <div className="subscription-bar">
                    <div 
                      className={`subscription-fill ${plan.name?.toLowerCase()}`}
                      style={{ width: `${plan.percentage}%` }}
                    ></div>
                  </div>
                  <span className="subscription-percentage">{plan.percentage}%</span>
                </div>
              )) || (
                <div className="no-data">
                  <p>No subscription data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="analytics-column">
          <div className="analytics-card">
            <div className="card-header">
              <h3>Platform Performance</h3>
              <span className="card-subtitle">Key performance indicators</span>
            </div>
            <div className="performance-content">
              <div className="performance-item">
                <span className="performance-label">User Activation Rate</span>
                <span className="performance-value">
                  {platformStats?.activationRate || '0'}%
                </span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{ width: `${platformStats?.activationRate || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="performance-item">
                <span className="performance-label">Average Session Duration</span>
                <span className="performance-value">
                  {platformStats?.avgSessionDuration || '0'} min
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">RFQ Completion Rate</span>
                <span className="performance-value">
                  {platformStats?.rfqCompletionRate || '0'}%
                </span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{ width: `${platformStats?.rfqCompletionRate || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="performance-item">
                <span className="performance-label">Customer Satisfaction</span>
                <span className="performance-value">
                  {platformStats?.customerSatisfaction || '0'}/10
                </span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3>Geographic Distribution</h3>
              <span className="card-subtitle">Users by region</span>
            </div>
            <div className="geographic-content">
              {analytics?.geographicDistribution?.map((region, index) => (
                <div key={region.name || index} className="region-item">
                  <span className="region-name">{region.name}</span>
                  <span className="region-count">{region.count} users</span>
                  <div className="region-bar">
                    <div 
                      className="region-fill"
                      style={{ width: `${region.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )) || (
                <div className="no-data">
                  <p>No geographic data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="quick-stats-footer">
        <div className="stat-item">
          <span className="stat-label">Total RFQs This Month</span>
          <span className="stat-value">{formatNumber(platformStats?.monthlyRFQs || 0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Bids Submitted</span>
          <span className="stat-value">{formatNumber(platformStats?.totalBids || 0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Successful Transactions</span>
          <span className="stat-value">{formatNumber(platformStats?.successfulTransactions || 0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Platform Uptime</span>
          <span className="stat-value">{platformStats?.uptime || '99.9%'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
