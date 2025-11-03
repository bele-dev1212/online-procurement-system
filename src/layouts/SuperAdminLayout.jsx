// src/layouts/SuperAdminLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/super-admin/organizations', label: 'Organizations', icon: '🏢' },
    { path: '/super-admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/super-admin/billing', label: 'Billing', icon: '💳' },
    { path: '/super-admin/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="super-admin-layout">
      {/* Sidebar */}
      <aside className="super-admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <h1>ProcureFlow</h1>
          </div>
          <div className="admin-badge">Super Admin</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Super Admin'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="logout-btn"
            aria-label="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="super-admin-main">
        <header className="super-admin-header">
          <div className="header-content">
            <h2>Super Admin Panel</h2>
            <p>Manage platform operations and analytics</p>
          </div>
        </header>

        <div className="super-admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Make sure this is the only export and it's default
export default SuperAdminLayout;