import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions/QuickActions';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalUsers: 0,
          activeOrganizations: 0,
          pendingApprovals: 0,
          systemHealth: 100
        });
        
        setRecentActivity([]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove system users',
      icon: '👥',
      link: '/admin/users',
      color: 'blue'
    },
    {
      title: 'Organization Settings',
      description: 'Configure organization preferences',
      icon: '🏢',
      link: '/admin/organizations',
      color: 'green'
    },
    {
      title: 'System Configuration',
      description: 'Manage system-wide settings',
      icon: '⚙️',
      link: '/admin/settings',
      color: 'purple'
    },
    {
      title: 'View Reports',
      description: 'Access comprehensive analytics',
      icon: '📊',
      link: '/reports/analytics',
      color: 'orange'
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Organization Admin</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Administrator'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.ADMIN]}</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-section">
        <DashboardStats
          stats={[
            {
              title: 'Total Users',
              value: stats.totalUsers,
              change: '+12%',
              trend: 'up',
              icon: '👥'
            },
            {
              title: 'Active Organizations',
              value: stats.activeOrganizations,
              change: '+5%',
              trend: 'up',
              icon: '🏢'
            },
            {
              title: 'Pending Approvals',
              value: stats.pendingApprovals,
              change: '-3%',
              trend: 'down',
              icon: '⏳'
            },
            {
              title: 'System Health',
              value: `${stats.systemHealth}%`,
              change: '100%',
              trend: 'stable',
              icon: '💚'
            }
          ]}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="content-left">
          {/* Quick Actions */}
          <div className="content-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Frequently used administrative tasks</p>
            </div>
            <QuickActions actions={quickActions} />
          </div>

          {/* System Alerts */}
          <div className="content-section">
            <div className="section-header">
              <h2>System Alerts</h2>
              <p>Important system notifications</p>
            </div>
            <div className="alerts-container">
              <div className="alert-item info">
                <div className="alert-icon">ℹ️</div>
                <div className="alert-content">
                  <h4>System Update Available</h4>
                  <p>Version 2.1.0 is ready for deployment</p>
                </div>
              </div>
              <div className="alert-item success">
                <div className="alert-icon">✅</div>
                <div className="alert-content">
                  <h4>Backup Completed</h4>
                  <p>Daily system backup was successful</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-right">
          {/* Recent Activity */}
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <p>Latest system events and actions</p>
            </div>
            <RecentActivity activities={recentActivity} />
            {recentActivity.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No Recent Activity</h3>
                <p>System activity will appear here</p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="content-section">
            <div className="section-header">
              <h2>System Status</h2>
              <p>Current system performance metrics</p>
            </div>
            <div className="status-grid">
              <div className="status-item online">
                <div className="status-indicator"></div>
                <div className="status-info">
                  <h4>API Server</h4>
                  <p>Operational</p>
                </div>
              </div>
              <div className="status-item online">
                <div className="status-indicator"></div>
                <div className="status-info">
                  <h4>Database</h4>
                  <p>Connected</p>
                </div>
              </div>
              <div className="status-item online">
                <div className="status-indicator"></div>
                <div className="status-info">
                  <h4>File Storage</h4>
                  <p>Available</p>
                </div>
              </div>
              <div className="status-item online">
                <div className="status-indicator"></div>
                <div className="status-info">
                  <h4>Email Service</h4>
                  <p>Running</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
