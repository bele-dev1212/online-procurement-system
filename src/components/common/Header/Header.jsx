import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock user data - replace with actual authentication
  useEffect(() => {
    const userData = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Procurement Manager',
      avatar: '/assets/images/avatars/user1.jpg'
    };
    setUser(userData);
  }, []);

  // Mock notifications
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: 'New RFQ Received',
        message: 'You have a new Request for Quotation from IT Department',
        time: '5 min ago',
        read: false,
        type: 'rfq'
      },
      {
        id: 2,
        title: 'Purchase Order Approved',
        message: 'PO #PO-2024-001 has been approved',
        time: '1 hour ago',
        read: false,
        type: 'purchase-order'
      },
      {
        id: 3,
        title: 'Supplier Response',
        message: 'ABC Suppliers responded to your RFQ',
        time: '2 hours ago',
        read: true,
        type: 'supplier'
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div 
            className="logo" 
            onClick={() => handleNavigation('/dashboard')}
          >
            <div className="logo-icon">🏢</div>
            <span className="logo-text">ProcureFlow</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <div className="nav-links">
            <button
              className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigation('/dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-link ${isActiveRoute('/procurement') ? 'active' : ''}`}
              onClick={() => handleNavigation('/procurement')}
            >
              📋 Procurement
            </button>
            <button
              className={`nav-link ${isActiveRoute('/suppliers') ? 'active' : ''}`}
              onClick={() => handleNavigation('/suppliers')}
            >
              👥 Suppliers
            </button>
            <button
              className={`nav-link ${isActiveRoute('/inventory') ? 'active' : ''}`}
              onClick={() => handleNavigation('/inventory')}
            >
              📦 Inventory
            </button>
            <button
              className={`nav-link ${isActiveRoute('/bidding') ? 'active' : ''}`}
              onClick={() => handleNavigation('/bidding')}
            >
              🏷️ Bidding
            </button>
            <button
              className={`nav-link ${isActiveRoute('/reports') ? 'active' : ''}`}
              onClick={() => handleNavigation('/reports')}
            >
              📈 Reports
            </button>
          </div>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search suppliers, orders, products..."
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>

          {/* Notifications */}
          <div className="notification-container">
            <button 
              className="notification-btn"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <span className="notification-count">{unreadCount} unread</span>
              </div>
              <div className="notification-list">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {notification.type === 'rfq' && '📋'}
                      {notification.type === 'purchase-order' && '📄'}
                      {notification.type === 'supplier' && '👥'}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <button 
                  className="view-all-btn"
                  onClick={() => handleNavigation('/notifications')}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="user-profile">
            <button
              className="profile-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="user-name">{user?.name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-name">{user?.name}</div>
                  <div className="profile-role">{user?.role}</div>
                  <div className="profile-email">{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    handleNavigation('/profile');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  👤 My Profile
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    handleNavigation('/settings');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  ⚙️ Settings
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <button
            className={`mobile-nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`mobile-nav-link ${isActiveRoute('/procurement') ? 'active' : ''}`}
            onClick={() => handleNavigation('/procurement')}
          >
            📋 Procurement
          </button>
          <button
            className={`mobile-nav-link ${isActiveRoute('/suppliers') ? 'active' : ''}`}
            onClick={() => handleNavigation('/suppliers')}
          >
            👥 Suppliers
          </button>
          <button
            className={`mobile-nav-link ${isActiveRoute('/inventory') ? 'active' : ''}`}
            onClick={() => handleNavigation('/inventory')}
          >
            📦 Inventory
          </button>
          <button
            className={`mobile-nav-link ${isActiveRoute('/bidding') ? 'active' : ''}`}
            onClick={() => handleNavigation('/bidding')}
          >
            🏷️ Bidding
          </button>
          <button
            className={`mobile-nav-link ${isActiveRoute('/reports') ? 'active' : ''}`}
            onClick={() => handleNavigation('/reports')}
          >
            📈 Reports
          </button>
          <div className="mobile-nav-divider"></div>
          <button
            className="mobile-nav-link"
            onClick={() => {
              handleNavigation('/profile');
              setIsMenuOpen(false);
            }}
          >
            👤 My Profile
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => {
              handleNavigation('/settings');
              setIsMenuOpen(false);
            }}
          >
            ⚙️ Settings
          </button>
          <button
            className="mobile-nav-link logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;