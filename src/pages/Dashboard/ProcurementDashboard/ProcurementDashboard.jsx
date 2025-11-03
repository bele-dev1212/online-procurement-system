import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions/QuickActions';
import './ProcurementDashboard.css';

const ProcurementDashboard = () => {
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
      <div className="procurement-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Procurement Dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Create Purchase Order',
      description: 'Create new purchase order',
      icon: '📋',
      link: '/procurement/create-purchase-order',
      color: 'blue'
    },
    {
      title: 'Manage RFQs',
      description: 'Create and manage requests for quotation',
      icon: '📝',
      link: '/procurement/rfq',
      color: 'green'
    },
    {
      title: 'View Requisitions',
      description: 'Review and approve purchase requisitions',
      icon: '📑',
      link: '/procurement/requisitions',
      color: 'purple'
    },
    {
      title: 'Supplier Management',
      description: 'Manage supplier relationships',
      icon: '🏭',
      link: '/suppliers',
      color: 'orange'
    }
  ];

  return (
    <div className="procurement-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Procurement Dashboard</h1>
          <p>Manage purchasing and supplier relationships</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Procurement Manager'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.PROCUREMENT_MANAGER]}</span>
        </div>
      </div>

      <div className="stats-section">
        <DashboardStats
          stats={[
            {
              title: 'Pending Approvals',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '⏳'
            },
            {
              title: 'Active RFQs',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📝'
            },
            {
              title: 'Monthly Spend',
              value: '₵0',
              change: '+0%',
              trend: 'up',
              icon: '💰'
            },
            {
              title: 'Supplier Performance',
              value: '0%',
              change: '+0%',
              trend: 'up',
              icon: '⭐'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-left">
          <div className="content-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Frequently used procurement tasks</p>
            </div>
            <QuickActions actions={quickActions} />
          </div>
        </div>

        <div className="content-right">
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Procurement Activity</h2>
              <p>Latest purchases and approvals</p>
            </div>
            <RecentActivity activities={recentActivity} />
            {recentActivity.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No Recent Activity</h3>
                <p>Procurement activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
