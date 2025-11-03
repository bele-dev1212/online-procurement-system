import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import './SupplierUserDashboard.css';

const SupplierUserDashboard = () => {
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
      <div className="supplier-user-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Supplier Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="supplier-user-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Supplier Portal</h1>
          <p>Supplier access and bid management</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Supplier'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.SUPPLIER_USER]}</span>
        </div>
      </div>

      <div className="stats-section">
        <DashboardStats
          stats={[
            {
              title: 'Active Bids',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📝'
            },
            {
              title: 'Submitted Quotes',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📋'
            },
            {
              title: 'Awarded Contracts',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '✅'
            },
            {
              title: 'Performance Rating',
              value: '0%',
              change: '+0%',
              trend: 'up',
              icon: '⭐'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Supplier Information</h2>
            <p>Your supplier profile and capabilities</p>
          </div>
          <div className="supplier-info">
            <div className="info-item">
              <div className="info-icon">🏭</div>
              <div className="info-content">
                <h4>Supplier Portal</h4>
                <p>Access available bids and submit quotations</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📊</div>
              <div className="info-content">
                <h4>Performance Tracking</h4>
                <p>Monitor your supplier performance metrics</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <h4>Support</h4>
                <p>Contact procurement team for assistance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Recent Supplier Activity</h2>
            <p>Your latest bids and interactions</p>
          </div>
          <RecentActivity activities={recentActivity} />
          {recentActivity.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Recent Activity</h3>
              <p>Your supplier activity will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierUserDashboard;
