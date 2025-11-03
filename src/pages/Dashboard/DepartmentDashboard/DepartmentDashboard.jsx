import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions/QuickActions';
import './DepartmentDashboard.css';

const DepartmentDashboard = () => {
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
      <div className="department-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Department Dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Department Requisitions',
      description: 'View department purchase requests',
      icon: '📑',
      link: '/procurement/requisitions',
      color: 'blue'
    },
    {
      title: 'Approve Requests',
      description: 'Approve department purchases',
      icon: '✅',
      link: '/procurement/approvals',
      color: 'green'
    },
    {
      title: 'Department Budget',
      description: 'View department spending',
      icon: '💰',
      link: '/finance/department',
      color: 'purple'
    },
    {
      title: 'Team Management',
      description: 'Manage department team',
      icon: '👥',
      link: '/department/team',
      color: 'orange'
    }
  ];

  return (
    <div className="department-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Department Dashboard</h1>
          <p>Manage department procurement and approvals</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Department Manager'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.DEPARTMENT_MANAGER]}</span>
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
              title: 'Department Budget',
              value: '₵0',
              change: '+0%',
              trend: 'up',
              icon: '💰'
            },
            {
              title: 'Team Members',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '👥'
            },
            {
              title: 'Monthly Spend',
              value: '₵0',
              change: '+0%',
              trend: 'up',
              icon: '📊'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-left">
          <div className="content-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Frequently used department tasks</p>
            </div>
            <QuickActions actions={quickActions} />
          </div>
        </div>

        <div className="content-right">
          <div className="content-section">
            <div className="section-header">
              <h2>Recent Department Activity</h2>
              <p>Latest department requests and approvals</p>
            </div>
            <RecentActivity activities={recentActivity} />
            {recentActivity.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3>No Recent Activity</h3>
                <p>Department activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
