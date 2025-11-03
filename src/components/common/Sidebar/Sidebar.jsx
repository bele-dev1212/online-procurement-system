import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, hasRole, logout } = useAuth();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const [quickStats, setQuickStats] = useState({
    pendingOrders: 0,
    activeSuppliers: 0,
    lowStock: 0,
    pendingBids: 0
  });

  // Fetch real quick stats from API
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        // TODO: Replace with actual API calls
        // const stats = await dashboardAPI.getQuickStats();
        const mockStats = {
          pendingOrders: 12,
          activeSuppliers: 45,
          lowStock: 8,
          pendingBids: 5
        };
        setQuickStats(mockStats);
      } catch (error) {
        console.error('Failed to fetch quick stats:', error);
      }
    };

    if (user) {
      fetchQuickStats();
    }
  }, [user]);

  // Menu items with role-based filtering
  const getMenuItems = () => {
    const baseMenuItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        path: '/dashboard',
        badge: null,
        roles: ['admin', 'procurement_manager', 'supplier']
      }
    ];

    // Procurement Management (Admin & Procurement Manager)
    if (hasRole('admin') || hasRole('procurement_manager')) {
      baseMenuItems.push(
        {
          id: 'procurement',
          label: 'Procurement',
          icon: '📋',
          path: '/procurement',
          roles: ['admin', 'procurement_manager'],
          subItems: [
            { 
              id: 'purchase-orders', 
              label: 'Purchase Orders', 
              path: '/procurement/orders', 
              badge: quickStats.pendingOrders 
            },
            { 
              id: 'requisitions', 
              label: 'Requisitions', 
              path: '/procurement/requisitions', 
              badge: 3 
            },
            { 
              id: 'rfqs', 
              label: 'RFQs', 
              path: '/procurement/rfqs', 
              badge: quickStats.pendingBids 
            },
            { 
              id: 'approvals', 
              label: 'Approvals', 
              path: '/procurement/approvals', 
              badge: 7 
            }
          ]
        },
        {
          id: 'suppliers',
          label: 'Supplier Management',
          icon: '👥',
          path: '/suppliers',
          roles: ['admin', 'procurement_manager'],
          subItems: [
            { 
              id: 'supplier-directory', 
              label: 'Supplier Directory', 
              path: '/suppliers/directory', 
              badge: quickStats.activeSuppliers 
            },
            { 
              id: 'supplier-performance', 
              label: 'Performance', 
              path: '/suppliers/performance', 
              badge: null 
            },
            { 
              id: 'add-supplier', 
              label: 'Add Supplier', 
              path: '/suppliers/create', 
              badge: null 
            },
            { 
              id: 'contracts', 
              label: 'Contracts', 
              path: '/suppliers/contracts', 
              badge: 4 
            }
          ]
        },
        {
          id: 'inventory',
          label: 'Inventory',
          icon: '📦',
          path: '/inventory',
          roles: ['admin', 'procurement_manager'],
          subItems: [
            { 
              id: 'products', 
              label: 'Products', 
              path: '/inventory/products', 
              badge: null 
            },
            { 
              id: 'categories', 
              label: 'Categories', 
              path: '/inventory/categories', 
              badge: null 
            },
            { 
              id: 'stock-alerts', 
              label: 'Stock Alerts', 
              path: '/inventory/alerts', 
              badge: quickStats.lowStock 
            },
            { 
              id: 'stock-movements', 
              label: 'Movements', 
              path: '/inventory/movements', 
              badge: null 
            }
          ]
        },
        {
          id: 'bidding',
          label: 'Bidding',
          icon: '🏷️',
          path: '/bidding',
          roles: ['admin', 'procurement_manager'],
          subItems: [
            { 
              id: 'active-bids', 
              label: 'Active Bids', 
              path: '/bidding/active', 
              badge: quickStats.pendingBids 
            },
            { 
              id: 'bid-evaluation', 
              label: 'Evaluation', 
              path: '/bidding/evaluation', 
              badge: 2 
            },
            { 
              id: 'awarded-bids', 
              label: 'Awarded Bids', 
              path: '/bidding/awarded', 
              badge: null 
            },
            { 
              id: 'bid-history', 
              label: 'History', 
              path: '/bidding/history', 
              badge: null 
            }
          ]
        }
      );
    }

    // Supplier Portal (Supplier & Admin)
    if (hasRole('supplier') || hasRole('admin')) {
      baseMenuItems.push({
        id: 'supplier-portal',
        label: 'Supplier Portal',
        icon: '🏪',
        path: '/supplier/dashboard',
        roles: ['supplier', 'admin'],
        subItems: [
          { 
            id: 'supplier-dashboard', 
            label: 'Dashboard', 
            path: '/supplier/dashboard', 
            badge: null 
          },
          { 
            id: 'rfq-opportunities', 
            label: 'RFQ Opportunities', 
            path: '/supplier/rfq-opportunities', 
            badge: quickStats.pendingBids 
          },
          { 
            id: 'bid-management', 
            label: 'Bid Management', 
            path: '/supplier/bid-management', 
            badge: null 
          },
          { 
            id: 'order-fulfillment', 
            label: 'Order Fulfillment', 
            path: '/supplier/order-fulfillment', 
            badge: quickStats.pendingOrders 
          },
          { 
            id: 'product-catalog', 
            label: 'Product Catalog', 
            path: '/supplier/product-catalog', 
            badge: null 
          },
          { 
            id: 'supplier-profile', 
            label: 'My Profile', 
            path: '/supplier/profile', 
            badge: null 
          }
        ]
      });
    }

    // Reports & Analytics (All authenticated users)
    baseMenuItems.push({
      id: 'reports',
      label: 'Reports & Analytics',
      icon: '📈',
      path: '/reports',
      roles: ['admin', 'procurement_manager', 'supplier'],
      subItems: [
        { 
          id: 'procurement-reports', 
          label: 'Procurement', 
          path: '/reports/procurement', 
          badge: null 
        },
        { 
          id: 'supplier-reports', 
          label: 'Supplier', 
          path: '/reports/supplier', 
          badge: null 
        },
        { 
          id: 'inventory-reports', 
          label: 'Inventory', 
          path: '/reports/inventory', 
          badge: null 
        },
        { 
          id: 'financial-reports', 
          label: 'Financial', 
          path: '/reports/financial', 
          badge: null 
        }
      ]
    });

    // Settings (All authenticated users)
    baseMenuItems.push({
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/settings',
      badge: null,
      roles: ['admin', 'procurement_manager', 'supplier']
    });

    return baseMenuItems;
  };

  // Quick actions with role-based filtering
  const getQuickActions = () => {
    const actions = [];

    if (hasRole('admin') || hasRole('procurement_manager')) {
      actions.push(
        { id: 'quick-order', label: 'Create PO', icon: '📄', path: '/procurement/orders/create' },
        { id: 'add-supplier', label: 'Add Supplier', icon: '👥', path: '/suppliers/create' },
        { id: 'new-rfq', label: 'New RFQ', icon: '📋', path: '/procurement/rfqs/create' },
        { id: 'stock-check', label: 'Stock Check', icon: '📦', path: '/inventory/check' }
      );
    }

    if (hasRole('supplier')) {
      actions.push(
        { id: 'view-rfqs', label: 'View RFQs', icon: '📋', path: '/supplier/rfq-opportunities' },
        { id: 'manage-bids', label: 'Manage Bids', icon: '💼', path: '/supplier/bid-management' },
        { id: 'update-catalog', label: 'Update Catalog', icon: '📦', path: '/supplier/product-catalog' }
      );
    }

    return actions;
  };

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading || !user) {
    return (
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} loading`}>
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-logo">
              <div className="logo-icon">🏢</div>
              <span className="logo-text">ProcureFlow</span>
            </div>
          )}
        </div>
        <div className="sidebar-loading">
          <div className="loading-spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const menuItems = getMenuItems();
  const quickActions = getQuickActions();

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
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'User'}</div>
            <div className="user-department">{user?.department || 'Procurement'}</div>
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && quickActions.length > 0 && (
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
      {!isCollapsed && (hasRole('admin') || hasRole('procurement_manager')) && (
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
          <button 
            className="collapsed-action-btn logout"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="action-icon">🚪</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;