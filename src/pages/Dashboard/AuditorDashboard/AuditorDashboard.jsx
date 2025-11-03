import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../../utils/constants/userRoles';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import DashboardStats from '../../../components/dashboard/DashboardStats/DashboardStats';
import RecentActivity from '../../../components/dashboard/RecentActivity/RecentActivity';
import './AuditorDashboard.css';

const AuditorDashboard = () => {
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
      <div className="auditor-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading Auditor Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="auditor-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Auditor Dashboard</h1>
          <p>Compliance monitoring and audit trails</p>
        </div>
        <div className="user-welcome">
          <span>Welcome, {user?.name || 'Auditor'}</span>
          <span className="user-role">{ROLE_DISPLAY_NAMES[USER_ROLES.AUDITOR]}</span>
        </div>
      </div>

      <div className="stats-section">
        <DashboardStats
          stats={[
            {
              title: 'Audit Logs',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📋'
            },
            {
              title: 'Compliance Issues',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '⚠️'
            },
            {
              title: 'System Events',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '📊'
            },
            {
              title: 'User Activities',
              value: 0,
              change: '+0%',
              trend: 'up',
              icon: '👥'
            }
          ]}
        />
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Audit Overview</h2>
            <p>System compliance and monitoring</p>
          </div>
          <div className="audit-features">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div className="feature-content">
                <h4>Compliance Monitoring</h4>
                <p>Track system compliance with procurement policies</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📈</div>
              <div className="feature-content">
                <h4>Audit Reports</h4>
                <p>Generate comprehensive audit trail reports</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div className="feature-content">
                <h4>Security Monitoring</h4>
                <p>Monitor system access and security events</p>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Recent Audit Activity</h2>
            <p>Latest system events and compliance checks</p>
          </div>
          <RecentActivity activities={recentActivity} />
          {recentActivity.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Recent Activity</h3>
              <p>Audit activity will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;
