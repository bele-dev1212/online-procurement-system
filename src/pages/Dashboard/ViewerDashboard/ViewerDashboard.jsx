import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import './ViewerDashboard.css';

const ViewerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setStats({});
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
      <div className="viewer-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Viewer Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="viewer-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Viewer Dashboard</h1>
          <p>Read-only access to procurement data</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Viewer'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.VIEWER]}</span>
        </div>
      </div>

      <div className="stats-section">
        <DashboardStats
          stats={[
            {
              title: 'Purchase Orders',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📋'
            },
            {
              title: 'Active Suppliers',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '🏭'
            },
            {
              title: 'Inventory Items',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📦'
            },
            {
              title: 'Active Bids',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📝'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>System Overview</h2>
            <p>Current procurement system status</p>
          </div>
          <div className="readonly-notice">
            <div className="notice-icon">👁️</div>
            <div className="notice-content">
              <h3>Read-Only Access</h3>
              <p>You have view-only permissions. Contact an administrator if you need edit access.</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Recent System Activity</h2>
            <p>Latest updates across the platform</p>
          </div>
          <RecentActivity activities={recentActivity} />
          {recentActivity.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No Recent Activity</h3>
              <p>System activity will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
