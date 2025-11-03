import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions/QuickActions';
import './BidDashboard.css';

const BidDashboard = () => {
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
      <div className="bid-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Bid Dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Create New Bid',
      description: 'Start new bidding process',
      icon: '📝',
      link: '/bidding/create',
      color: 'blue'
    },
    {
      title: 'Manage Bids',
      description: 'View and manage all bids',
      icon: '📑',
      link: '/bidding',
      color: 'green'
    },
    {
      title: 'Evaluate Bids',
      description: 'Review and score bid responses',
      icon: '⭐',
      link: '/bidding/evaluation',
      color: 'purple'
    },
    {
      title: 'Bid Templates',
      description: 'Manage bid templates',
      icon: '📋',
      link: '/bidding/templates',
      color: 'orange'
    }
  ];

  return (
    <div className="bid-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Bid Management Dashboard</h1>
          <p>Manage bidding processes and evaluations</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Bid Manager'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.BID_MANAGER]}</span>
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
              title: 'Pending Evaluation',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '⏳'
            },
            {
              title: 'Completed Bids',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '✅'
            },
            {
              title: 'Avg. Response Time',
              value: '0 days',
              change: '+0%',
              trend: 'up',
              icon: '⏱️'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-left">
          <div className="content-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Frequently used bid management tasks</p>
            </div>
            <QuickActions actions={quickActions} />
          </div>
        </div>

        <div className="content-right">
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Bid Activity</h2>
              <p>Latest bid updates and evaluations</p>
            </div>
            <RecentActivity activities={recentActivity} />
            {recentActivity.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No Recent Activity</h3>
                <p>Bid activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidDashboard;
