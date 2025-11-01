import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    recentActivities: [],
    quickStats: {},
    procurementMetrics: {},
    supplierPerformance: [],
    stockAlerts: [],
    pendingApprovals: [],
    teamMembers: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [timeRange, user?.organization]);

  const loadDashboardData = async () => {
    if (!user?.organization) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/${user.organization}?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // CSV Upload Functions
  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('organizationId', user.organization);

      const response = await fetch('/api/users/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setShowCSVUpload(false);
        setCsvFile(null);
        loadDashboardData();
      } else {
        console.error('CSV upload failed');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    }
  };

  const downloadCSVTemplate = () => {
    const orgName = user?.organizationName || 'organization';
    const template = `email,firstName,lastName,role,department
user1@${orgName.toLowerCase().replace(/\s+/g, '')}.com,John,Doe,manager,Procurement
user2@${orgName.toLowerCase().replace(/\s+/g, '')}.com,Jane,Smith,user,Operations
user3@${orgName.toLowerCase().replace(/\s+/g, '')}.com,Mike,Johnson,user,IT`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgName.replace(/\s+/g, '_')}_user_import_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Utility Functions
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    if (!number) return '0';
    return new Intl.NumberFormat('en-US').format(number);
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
      completed: '✅', warning: '⚠️', info: 'ℹ️', pending: '⏳',
      critical: '🔴', low: '🟡', out_of_stock: '🚫', active: '🟢', inactive: '⚫'
    };
    return icons[status] || '⚪';
  };

  const getStatusClass = (status) => {
    const classes = {
      completed: 'status-completed', warning: 'status-warning', info: 'status-info',
      pending: 'status-pending', critical: 'status-critical', low: 'status-low',
      out_of_stock: 'status-out-of-stock', active: 'status-active', inactive: 'status-inactive'
    };
    return classes[status] || 'status-default';
  };

  const getActivityIcon = (type) => {
    const icons = {
      purchase_order: '📋', stock_alert: '⚠️', supplier: '🏢', bidding: '💰',
      approval: '✅', requisition: '📝', contract: '📄', organization: '🏛️',
      user_registration: '👤', team: '👥'
    };
    return icons[type] || '📢';
  };

  // Navigation Handlers
  const handleQuickAction = (action) => {
    const routes = {
      manage_team: '/team-management',
      org_settings: '/organization-settings',
      billing: '/billing',
      analytics: '/analytics',
      reports: '/reports'
    };
    
    if (action === 'invite_users') {
      setShowCSVUpload(true);
    } else if (routes[action]) {
      navigate(routes[action]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewAll = (section) => {
    const routes = {
      team: '/team-management',
      activities: '/activities',
      suppliers: '/suppliers',
      approvals: '/approvals',
      stock: '/inventory'
    };
    navigate(routes[section] || '/');
  };

  // Loading State
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading {user?.organizationName} dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.firstName}!</h1>
          <div className="org-info">
            <span className="org-badge">🏢 {user?.organizationName}</span>
            <span className="role-badge">👑 {user?.role || 'Admin'}</span>
          </div>
          <p>Managing procurement for {user?.organizationName}</p>
        </div>
        <div className="header-actions">
          <div className="user-actions">
            <button className="btn-secondary" onClick={() => setShowCSVUpload(true)}>
              📤 Import Users
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
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

      {/* CSV Upload Modal */}
      {showCSVUpload && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Import Users via CSV</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCSVUpload(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Upload a CSV file to add multiple users to {user?.organizationName}.</p>
              
              <div className="csv-template">
                <button 
                  className="btn-link"
                  onClick={downloadCSVTemplate}
                >
                  📥 Download CSV Template
                </button>
              </div>

              <form onSubmit={handleCSVUpload}>
                <div className="form-group">
                  <label>Select CSV File:</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowCSVUpload(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={!csvFile || uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Import Users'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Overview Metrics Section */}
      <div className="overview-metrics">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Spend</h3>
            <div className="metric-value">{formatCurrency(dashboardData.overview.totalSpend)}</div>
            <div className={`metric-trend ${getTrendClass(dashboardData.overview.spendChange)}`}>
              <span className="trend-icon">{getTrendIcon(dashboardData.overview.spendChange)}</span>
              <span className="trend-value">{Math.abs(dashboardData.overview.spendChange || 0)}%</span>
              <span className="trend-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <div className="metric-value">{formatNumber(dashboardData.overview.totalOrders)}</div>
            <div className={`metric-trend ${getTrendClass(dashboardData.overview.ordersChange)}`}>
              <span className="trend-icon">{getTrendIcon(dashboardData.overview.ordersChange)}</span>
              <span className="trend-value">{Math.abs(dashboardData.overview.ordersChange || 0)}%</span>
              <span className="trend-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">💸</div>
          <div className="metric-content">
            <h3>Cost Savings</h3>
            <div className="metric-value">{formatCurrency(dashboardData.overview.costSavings)}</div>
            <div className={`metric-trend ${getTrendClass(dashboardData.overview.savingsChange)}`}>
              <span className="trend-icon">{getTrendIcon(dashboardData.overview.savingsChange)}</span>
              <span className="trend-value">{Math.abs(dashboardData.overview.savingsChange || 0)}%</span>
              <span className="trend-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">🏢</div>
          <div className="metric-content">
            <h3>Active Suppliers</h3>
            <div className="metric-value">{formatNumber(dashboardData.overview.activeSuppliers)}</div>
            <div className="metric-subtitle">Managing relationships</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Compliance Rate</h3>
            <div className="metric-value">{dashboardData.overview.complianceRate || 0}%</div>
            <div className="metric-subtitle">Policy adherence</div>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>Pending Approvals</h3>
            <div className="metric-value">{dashboardData.overview.pendingApprovals || 0}</div>
            <div className="metric-subtitle">Require attention</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="content-left">
          {/* Organization Admin Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Organization Admin</h2>
              <span className="card-subtitle">Manage your organization</span>
            </div>
            <div className="card-content">
              <div className="quick-actions-grid">
                <button 
                  className="quick-action admin-action"
                  onClick={() => handleQuickAction('manage_team')}
                >
                  <span className="action-icon">👥</span>
                  <span className="action-label">Team Management</span>
                </button>
                <button 
                  className="quick-action admin-action"
                  onClick={() => handleQuickAction('org_settings')}
                >
                  <span className="action-icon">⚙️</span>
                  <span className="action-label">Organization Settings</span>
                </button>
                <button 
                  className="quick-action admin-action"
                  onClick={() => handleQuickAction('invite_users')}
                >
                  <span className="action-icon">📧</span>
                  <span className="action-label">Invite Users</span>
                </button>
                <button 
                  className="quick-action admin-action"
                  onClick={() => handleQuickAction('billing')}
                >
                  <span className="action-icon">💳</span>
                  <span className="action-label">Billing & Subscription</span>
                </button>
                <button 
                  className="quick-action admin-action"
                  onClick={() => handleQuickAction('analytics')}
                >
                  <span className="action-icon">📊</span>
                  <span className="action-label">Advanced Analytics</span>
                </button>
                <button 
                  className="quick-action admin-action"
                  onClick={() => handleQuickAction('reports')}
                >
                  <span className="action-icon">📈</span>
                  <span className="action-label">Custom Reports</span>
                </button>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Team Members</h2>
              <button 
                className="btn-view-all"
                onClick={() => handleViewAll('team')}
              >
                Manage
              </button>
            </div>
            <div className="card-content">
              <div className="team-list">
                {dashboardData.teamMembers?.map(member => (
                  <div key={member.id} className="team-member">
                    <div className="member-avatar">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    <div className="member-info">
                      <h4>{member.name || 'Unknown User'}</h4>
                      <p>{member.email || 'No email'}</p>
                      <div className="member-meta">
                        <span className={`role-badge ${member.role}`}>
                          {member.role || 'user'}
                        </span>
                        <span className={`status ${getStatusClass(member.status)}`}>
                          {getStatusIcon(member.status)} {member.status || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="add-member-card">
                  <button 
                    className="add-member-btn"
                    onClick={() => setShowCSVUpload(true)}
                  >
                    <span className="add-icon">+</span>
                    <span>Add Team Members</span>
                  </button>
                </div>
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
                {dashboardData.recentActivities?.map(activity => (
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-right">
          {/* Analytics Overview */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Analytics Overview</h2>
              <span className="card-subtitle">Key performance indicators</span>
            </div>
            <div className="card-content">
              <div className="analytics-grid">
                <div className="analytics-item">
                  <div className="analytics-label">Procurement Efficiency</div>
                  <div className="analytics-value">{dashboardData.procurementMetrics?.approvalRate || 0}%</div>
                  <div className="analytics-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${dashboardData.procurementMetrics?.approvalRate || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="analytics-item">
                  <div className="analytics-label">Cost Optimization</div>
                  <div className="analytics-value">
                    {(dashboardData.overview.costSavings > 50000) ? 'High' : 
                     (dashboardData.overview.costSavings > 25000) ? 'Medium' : 'Low'}
                  </div>
                  <div className="analytics-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${Math.min(100, (dashboardData.overview.costSavings || 0) / 100000 * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="analytics-item">
                  <div className="analytics-label">Supplier Performance</div>
                  <div className="analytics-value">
                    {dashboardData.supplierPerformance?.length ? 
                      (dashboardData.supplierPerformance.reduce((acc, curr) => acc + curr.rating, 0) / dashboardData.supplierPerformance.length).toFixed(1) : '0.0'}/5
                  </div>
                  <div className="analytics-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${dashboardData.supplierPerformance?.length ? 
                        (dashboardData.supplierPerformance.reduce((acc, curr) => acc + curr.rating, 0) / dashboardData.supplierPerformance.length) * 20 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="analytics-item">
                  <div className="analytics-label">Operational Excellence</div>
                  <div className="analytics-value">{dashboardData.overview.complianceRate || 0}%</div>
                  <div className="analytics-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${dashboardData.overview.complianceRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Operational Metrics</h2>
              <span className="card-subtitle">Real-time overview</span>
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
              </div>
            </div>
          </div>

          {/* Supplier Performance */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Supplier Performance</h2>
              <button 
                className="btn-view-all"
                onClick={() => handleViewAll('suppliers')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              <div className="suppliers-list">
                {dashboardData.supplierPerformance?.map(supplier => (
                  <div key={supplier.id} className="supplier-item">
                    <div className="supplier-avatar">
                      {supplier.name?.charAt(0) || 'S'}
                    </div>
                    <div className="supplier-content">
                      <h4>{supplier.name || 'Unknown Supplier'}</h4>
                      <div className="supplier-rating">
                        <span className="stars">
                          {'★'.repeat(Math.floor(supplier.rating || 0))}
                          {'☆'.repeat(5 - Math.floor(supplier.rating || 0))}
                        </span>
                        <span className="rating-value">{(supplier.rating || 0).toFixed(1)}</span>
                      </div>
                      <div className="supplier-metrics">
                        <span>Delivery: {(supplier.delivery || 0).toFixed(1)}%</span>
                        <span>Quality: {(supplier.quality || 0).toFixed(1)}%</span>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;