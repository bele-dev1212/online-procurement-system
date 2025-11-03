import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions/QuickActions';
import './InventoryDashboard.css';

const InventoryDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      <div className="inventory-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Inventory Dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add or edit product information',
      icon: '📦',
      link: '/inventory',
      color: 'blue'
    },
    {
      title: 'Stock Adjustment',
      description: 'Update stock levels and counts',
      icon: '📊',
      link: '/inventory/adjustments',
      color: 'green'
    },
    {
      title: 'Category Management',
      description: 'Organize product categories',
      icon: '📑',
      link: '/inventory/categories',
      color: 'purple'
    },
    {
      title: 'Stock Alerts',
      description: 'View low stock notifications',
      icon: '⚠️',
      link: '/inventory/alerts',
      color: 'orange'
    }
  ];

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Inventory Dashboard</h1>
          <p>Manage stock levels and product catalog</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Inventory Manager'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.INVENTORY_MANAGER]}</span>
        </div>
      </div>

      <div className="stats-section">
        <DashboardStats
          stats={[
            {
              title: 'Total Products',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📦'
            },
            {
              title: 'Low Stock Items',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '⚠️'
            },
            {
              title: 'Inventory Value',
              value: '₵0',
              change: '+0%',
              trend: 'up',
              icon: '💰'
            },
            {
              title: 'Stock Accuracy',
              value: '0%',
              change: '+0%',
              trend: 'up',
              icon: '✅'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-left">
          <div className="content-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Frequently used inventory tasks</p>
            </div>
            <QuickActions actions={quickActions} />
          </div>
        </div>

        <div className="content-right">
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Inventory Activity</h2>
              <p>Latest stock movements and updates</p>
            </div>
            <RecentActivity activities={recentActivity} />
            {recentActivity.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No Recent Activity</h3>
                <p>Inventory activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
