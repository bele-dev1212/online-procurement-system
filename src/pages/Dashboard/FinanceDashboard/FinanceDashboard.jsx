import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions/QuickActions';
import './FinanceDashboard.css';

const FinanceDashboard = () => {
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
      <div className="finance-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Finance Dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Financial Approvals',
      description: 'Review and approve expenditures',
      icon: '💰',
      link: '/finance/approvals',
      color: 'blue'
    },
    {
      title: 'Budget Management',
      description: 'Manage and track budgets',
      icon: '📊',
      link: '/finance/budgets',
      color: 'green'
    },
    {
      title: 'Cost Analysis',
      description: 'Analyze procurement costs',
      icon: '📈',
      link: '/finance/analysis',
      color: 'purple'
    },
    {
      title: 'Financial Reports',
      description: 'Generate financial reports',
      icon: '📑',
      link: '/reports/finance',
      color: 'orange'
    }
  ];

  return (
    <div className="finance-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Finance Dashboard</h1>
          <p>Manage financial approvals and budget tracking</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Finance Manager'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.FINANCE_MANAGER]}</span>
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
              title: 'Monthly Budget',
              value: '₵0',
              change: '+0%',
              trend: 'up',
              icon: '💰'
            },
            {
              title: 'Approved Spend',
              value: '₵0',
              change: '+0%',
              trend: 'up',
              icon: '✅'
            },
            {
              title: 'Cost Savings',
              value: '₵0',
              change: '+0%',
              trend: 'up',
              icon: '💸'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-left">
          <div className="content-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Frequently used financial tasks</p>
            </div>
            <QuickActions actions={quickActions} />
          </div>
        </div>

        <div className="content-right">
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Financial Activity</h2>
              <p>Latest approvals and transactions</p>
            </div>
            <RecentActivity activities={recentActivity} />
            {recentActivity.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>No Recent Activity</h3>
                <p>Financial activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
