import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const [user, setUser] = useState(null);
  const [quickStats, setQuickStats] = useState({
    pendingOrders: 0,
    activeSuppliers: 0,
    lowStock: 0,
    pendingBids: 0
  });

  // Mock user data
  useEffect(() => {
    const userData = {
      name: 'John Doe',
      role: 'Procurement Manager',
      department: 'Procurement',
      avatar: '/assets/images/avatars/user1.jpg'
    };
    setUser(userData);
  }, []);

  // Mock quick stats
  useEffect(() => {
    const stats = {
      pendingOrders: 12,
      activeSuppliers: 45,
      lowStock: 8,
      pendingBids: 5
    };
    setQuickStats(stats);
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      badge: null
    },
    {
      id: 'procurement',
      label: 'Procurement',
      icon: '📋',
      path: '/procurement',
      subItems: [
        { id: 'purchase-orders', label: 'Purchase Orders', path: '/procurement/orders', badge: quickStats.pendingOrders },
        { id: 'requisitions', label: 'Requisitions', path: '/procurement/requisitions', badge: 3 },
        { id: 'rfqs', label: 'RFQs', path: '/procurement/rfqs', badge: quickStats.pendingBids },
        { id: 'approvals', label: 'Approvals', path: '/procurement/approvals', badge: 7 }
      ]
    },
    {
      id: 'suppliers',
      label: 'Supplier Management',
      icon: '👥',
      path: '/suppliers',
      subItems: [
        { id: 'supplier-directory', label: 'Supplier Directory', path: '/suppliers/directory', badge: quickStats.activeSuppliers },
        { id: 'supplier-performance', label: 'Performance', path: '/suppliers/performance', badge: null },
        { id: 'supplier-evaluation', label: 'Evaluation', path: '/suppliers/evaluation', badge: null },
        { id: 'contracts', label: 'Contracts', path: '/suppliers/contracts', badge: 4 }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '📦',
      path: '/inventory',
      subItems: [
        { id: 'products', label: 'Products', path: '/inventory/products', badge: null },
        { id: 'categories', label: 'Categories', path: '/inventory/categories', badge: null },
        { id: 'stock-alerts', label: 'Stock Alerts', path: '/inventory/alerts', badge: quickStats.lowStock },
        { id: 'stock-movements', label: 'Movements', path: '/inventory/movements', badge: null }
      ]
    },
    {
      id: 'bidding',
      label: 'Bidding',
      icon: '🏷️',
      path: '/bidding',
      subItems: [
        { id: 'active-bids', label: 'Active Bids', path: '/bidding/active', badge: quickStats.pendingBids },
        { id: 'bid-evaluation', label: 'Evaluation', path: '/bidding/evaluation', badge: 2 },
        { id: 'awarded-bids', label: 'Awarded Bids', path: '/bidding/awarded', badge: null },
        { id: 'bid-history', label: 'History', path: '/bidding/history', badge: null }
      ]
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: '📈',
      path: '/reports',
      subItems: [
        { id: 'procurement-reports', label: 'Procurement', path: '/reports/procurement', badge: null },
        { id: 'supplier-reports', label: 'Supplier', path: '/reports/supplier', badge: null },
        { id: 'inventory-reports', label: 'Inventory', path: '/reports/inventory', badge: null },
        { id: 'financial-reports', label: 'Financial', path: '/reports/financial', badge: null }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/settings',
      badge: null
    }
  ];

  const quickActions = [
    { id: 'quick-order', label: 'Create PO', icon: '📄', path: '/procurement/orders/create' },
    { id: 'add-supplier', label: 'Add Supplier', icon: '👥', path: '/suppliers/create' },
    { id: 'new-rfq', label: 'New RFQ', icon: '📋', path: '/procurement/rfqs/create' },
    { id: 'stock-check', label: 'Stock Check', icon: '📦', path: '/inventory/check' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSubMenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? '' : menuId);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  const isExactActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <div className="logo-icon">🏢</div>
            <span className="logo-text">ProcureFlow</span>
          </div>
        )}
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="user-profile-card">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
            <div className="user-department">{user?.department}</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="quick-actions-section">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                className="quick-action-btn"
                onClick={() => handleNavigation(action.path)}
                title={action.label}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.id} className="nav-item">
              {/* Main Menu Item */}
              <div
                className={`nav-link ${isActivePath(item.path) ? 'active' : ''} ${
                  item.subItems ? 'has-submenu' : ''
                }`}
                onClick={() => {
                  if (item.subItems) {
                    toggleSubMenu(item.id);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <div className="nav-content">
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </div>
                <div className="nav-right">
                  {item.badge !== null && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                  {item.subItems && (
                    <span className={`submenu-arrow ${
                      activeMenu === item.id ? 'expanded' : ''
                    }`}>
                      ▼
                    </span>
                  )}
                </div>
              </div>

              {/* Submenu Items */}
              {item.subItems && activeMenu === item.id && !isCollapsed && (
                <ul className="submenu">
                  {item.subItems.map(subItem => (
                    <li key={subItem.id} className="submenu-item">
                      <button
                        className={`submenu-link ${
                          isExactActivePath(subItem.path) ? 'active' : ''
                        }`}
                        onClick={() => handleNavigation(subItem.path)}
                      >
                        <span className="submenu-label">{subItem.label}</span>
                        {subItem.badge !== null && subItem.badge > 0 && (
                          <span className="submenu-badge">{subItem.badge}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="quick-stats">
            <h3 className="section-title">Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <div className="stat-value">{quickStats.pendingOrders}</div>
                  <div className="stat-label">Pending POs</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{quickStats.activeSuppliers}</div>
                  <div className="stat-label">Suppliers</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <div className="stat-value">{quickStats.lowStock}</div>
                  <div className="stat-label">Low Stock</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🏷️</div>
                <div className="stat-info">
                  <div className="stat-value">{quickStats.pendingBids}</div>
                  <div className="stat-label">Pending Bids</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Quick Actions */}
      {isCollapsed && (
        <div className="collapsed-actions">
          {quickActions.map(action => (
            <button
              key={action.id}
              className="collapsed-action-btn"
              onClick={() => handleNavigation(action.path)}
              title={action.label}
            >
              <span className="action-icon">{action.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;