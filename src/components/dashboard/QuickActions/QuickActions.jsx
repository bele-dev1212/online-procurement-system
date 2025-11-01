import React, { useState, useEffect } from 'react';
import './QuickActions.css';

const QuickActions = ({
  variant = 'grid', // 'grid' | 'list' | 'compact'
  size = 'medium', // 'small' | 'medium' | 'large'
  showLabels = true,
  showCounts = true,
  maxActions = 8,
  onActionClick,
  className = '',
  userRole = 'procurement_manager',
  pinnedActions = []
}) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState([]);

  // Action categories and definitions
  const actionCategories = {
    procurement: {
      label: 'Procurement',
      icon: '📋',
      color: 'blue'
    },
    suppliers: {
      label: 'Suppliers',
      icon: '👥',
      color: 'green'
    },
    bidding: {
      label: 'Bidding',
      icon: '🏷️',
      color: 'purple'
    },
    inventory: {
      label: 'Inventory',
      icon: '📦',
      color: 'orange'
    },
    reports: {
      label: 'Reports',
      icon: '📊',
      color: 'teal'
    },
    approvals: {
      label: 'Approvals',
      icon: '✅',
      color: 'indigo'
    },
    settings: {
      label: 'Settings',
      icon: '⚙️',
      color: 'gray'
    }
  };

  // All available actions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allActions = [
    // Procurement Actions
    {
      id: 'create_po',
      label: 'Create Purchase Order',
      description: 'Create a new purchase order',
      icon: '📄',
      category: 'procurement',
      path: '/procurement/purchase-orders/create',
      color: 'blue',
      roles: ['procurement_manager', 'department_head', 'finance_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+P',
      requiresApproval: false
    },
    {
      id: 'create_requisition',
      label: 'Create Requisition',
      description: 'Request new items or services',
      icon: '📝',
      category: 'procurement',
      path: '/procurement/requisitions/create',
      color: 'blue',
      roles: ['procurement_manager', 'department_head'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+R',
      requiresApproval: true
    },
    {
      id: 'create_rfq',
      label: 'Create RFQ',
      description: 'Request for quotation',
      icon: '📋',
      category: 'procurement',
      path: '/procurement/rfqs/create',
      color: 'blue',
      roles: ['procurement_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+Q',
      requiresApproval: false
    },

    // Supplier Actions
    {
      id: 'add_supplier',
      label: 'Add Supplier',
      description: 'Register new supplier',
      icon: '👥',
      category: 'suppliers',
      path: '/suppliers/create',
      color: 'green',
      roles: ['procurement_manager', 'supplier_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+S',
      requiresApproval: true
    },
    {
      id: 'supplier_directory',
      label: 'Supplier Directory',
      description: 'View all suppliers',
      icon: '📚',
      category: 'suppliers',
      path: '/suppliers/directory',
      color: 'green',
      roles: ['procurement_manager', 'supplier_manager', 'viewer'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+D',
      requiresApproval: false
    },
    {
      id: 'evaluate_supplier',
      label: 'Evaluate Supplier',
      description: 'Rate supplier performance',
      icon: '⭐',
      category: 'suppliers',
      path: '/suppliers/evaluation',
      color: 'green',
      roles: ['procurement_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+E',
      requiresApproval: false
    },

    // Bidding Actions
    {
      id: 'view_bids',
      label: 'View Bids',
      description: 'Monitor active bids',
      icon: '🏷️',
      category: 'bidding',
      path: '/bidding/active',
      color: 'purple',
      roles: ['procurement_manager', 'supplier'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+B',
      requiresApproval: false
    },
    {
      id: 'evaluate_bids',
      label: 'Evaluate Bids',
      description: 'Compare and evaluate bids',
      icon: '📊',
      category: 'bidding',
      path: '/bidding/evaluation',
      color: 'purple',
      roles: ['procurement_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+V',
      requiresApproval: false
    },
    {
      id: 'award_bid',
      label: 'Award Bid',
      description: 'Select winning bid',
      icon: '🎯',
      category: 'bidding',
      path: '/bidding/award',
      color: 'purple',
      roles: ['procurement_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+A',
      requiresApproval: true
    },

    // Inventory Actions
    {
      id: 'add_product',
      label: 'Add Product',
      description: 'Add new product to inventory',
      icon: '📦',
      category: 'inventory',
      path: '/inventory/products/create',
      color: 'orange',
      roles: ['procurement_manager', 'inventory_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+I',
      requiresApproval: false
    },
    {
      id: 'stock_check',
      label: 'Stock Check',
      description: 'Check current stock levels',
      icon: '🔍',
      category: 'inventory',
      path: '/inventory/stock',
      color: 'orange',
      roles: ['procurement_manager', 'inventory_manager', 'viewer'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+C',
      requiresApproval: false
    },
    {
      id: 'low_stock_alerts',
      label: 'Low Stock Alerts',
      description: 'View items needing reorder',
      icon: '⚠️',
      category: 'inventory',
      path: '/inventory/alerts',
      color: 'orange',
      roles: ['procurement_manager', 'inventory_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+L',
      requiresApproval: false
    },

    // Reports Actions
    {
      id: 'procurement_report',
      label: 'Procurement Report',
      description: 'Generate procurement analytics',
      icon: '📈',
      category: 'reports',
      path: '/reports/procurement',
      color: 'teal',
      roles: ['procurement_manager', 'finance_manager', 'viewer'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+R',
      requiresApproval: false
    },
    {
      id: 'supplier_report',
      label: 'Supplier Report',
      description: 'Supplier performance analysis',
      icon: '👥',
      category: 'reports',
      path: '/reports/suppliers',
      color: 'teal',
      roles: ['procurement_manager', 'supplier_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+T',
      requiresApproval: false
    },
    {
      id: 'financial_report',
      label: 'Financial Report',
      description: 'Budget and spending analysis',
      icon: '💰',
      category: 'reports',
      path: '/reports/financial',
      color: 'teal',
      roles: ['procurement_manager', 'finance_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+F',
      requiresApproval: false
    },

    // Approval Actions
    {
      id: 'pending_approvals',
      label: 'Pending Approvals',
      description: 'Review items awaiting approval',
      icon: '⏳',
      category: 'approvals',
      path: '/approvals/pending',
      color: 'indigo',
      roles: ['procurement_manager', 'finance_manager', 'department_head'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+N',
      requiresApproval: false
    },
    {
      id: 'approval_workflow',
      label: 'Approval Workflow',
      description: 'Manage approval processes',
      icon: '🔄',
      category: 'approvals',
      path: '/approvals/workflow',
      color: 'indigo',
      roles: ['procurement_manager'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+W',
      requiresApproval: false
    },

    // Settings Actions
    {
      id: 'user_settings',
      label: 'User Settings',
      description: 'Manage your account settings',
      icon: '👤',
      category: 'settings',
      path: '/settings/profile',
      color: 'gray',
      roles: ['all'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+U',
      requiresApproval: false
    },
    {
      id: 'system_settings',
      label: 'System Settings',
      description: 'Configure system preferences',
      icon: '⚙️',
      category: 'settings',
      path: '/settings/system',
      color: 'gray',
      roles: ['procurement_manager', 'admin'],
      usageCount: 0,
      isPinned: false,
      shortcut: 'Ctrl+Shift+Y',
      requiresApproval: false
    }
  ];

  // Load actions based on user role and preferences
  useEffect(() => {
    const loadActions = () => {
      setLoading(true);

      // Filter actions by user role
      let filteredActions = allActions.filter(action => 
        action.roles.includes(userRole) || action.roles.includes('all')
      );

      // Apply pinned actions
      if (pinnedActions.length > 0) {
        filteredActions = filteredActions.map(action => ({
          ...action,
          isPinned: pinnedActions.includes(action.id)
        }));
      }

      // Apply recent usage from localStorage
      const savedUsage = JSON.parse(localStorage.getItem('quickActionsUsage') || '{}');
      filteredActions = filteredActions.map(action => ({
        ...action,
        usageCount: savedUsage[action.id] || 0
      }));

      // Sort by pinned status and usage count
      filteredActions.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.usageCount || 0) - (a.usageCount || 0);
      });

      setActions(filteredActions.slice(0, maxActions));
      setLoading(false);
    };

    loadActions();
  }, [userRole, pinnedActions, maxActions, allActions]);

  // Load recently used actions
  useEffect(() => {
    const savedRecent = JSON.parse(localStorage.getItem('recentQuickActions') || '[]');
    setRecentlyUsed(savedRecent.slice(0, 3));
  }, []);

  const handleActionClick = (action) => {
    // Update usage count
    const updatedActions = actions.map(a => 
      a.id === action.id ? { ...a, usageCount: (a.usageCount || 0) + 1 } : a
    );
    setActions(updatedActions);

    // Save to localStorage
    const usageData = JSON.parse(localStorage.getItem('quickActionsUsage') || '{}');
    usageData[action.id] = (usageData[action.id] || 0) + 1;
    localStorage.setItem('quickActionsUsage', JSON.stringify(usageData));

    // Update recently used
    const recent = [action, ...recentlyUsed.filter(a => a.id !== action.id)].slice(0, 3);
    setRecentlyUsed(recent);
    localStorage.setItem('recentQuickActions', JSON.stringify(recent));

    // Call the provided callback
    onActionClick?.(action);
  };

  const handlePinAction = (actionId, e) => {
    e.stopPropagation();
    
    const updatedActions = actions.map(action =>
      action.id === actionId ? { ...action, isPinned: !action.isPinned } : action
    );
    
    setActions(updatedActions);

    // Save pinned actions
    const pinned = updatedActions.filter(a => a.isPinned).map(a => a.id);
    localStorage.setItem('pinnedQuickActions', JSON.stringify(pinned));
  };


  const getGroupedActions = () => {
    const grouped = {};
    actions.forEach(action => {
      if (!grouped[action.category]) {
        grouped[action.category] = [];
      }
      grouped[action.category].push(action);
    });
    return grouped;
  };

  const renderActionButton = (action) => {
    const isRecentlyUsed = recentlyUsed.some(recent => recent.id === action.id);
    
    return (
      <button
        key={action.id}
        className={`action-button action-${action.color} action-size-${size} ${
          isRecentlyUsed ? 'recently-used' : ''
        } ${action.isPinned ? 'pinned' : ''}`}
        onClick={() => handleActionClick(action)}
        title={`${action.label} - ${action.description} (${action.shortcut})`}
        disabled={loading}
      >
        <div className="action-content">
          <div className="action-icon">{action.icon}</div>
          
          {showLabels && (
            <div className="action-text">
              <span className="action-label">{action.label}</span>
              {variant !== 'compact' && (
                <span className="action-description">{action.description}</span>
              )}
            </div>
          )}

          {action.requiresApproval && (
            <div className="approval-badge" title="Requires approval">
              ⭐
            </div>
          )}
        </div>

        <div className="action-meta">
          {action.isPinned && (
            <button
              className="pin-button pinned"
              onClick={(e) => handlePinAction(action.id, e)}
              title="Unpin action"
            >
              📌
            </button>
          )}
          
          {!action.isPinned && variant !== 'compact' && (
            <button
              className="pin-button"
              onClick={(e) => handlePinAction(action.id, e)}
              title="Pin action"
            >
              📍
            </button>
          )}

          {showCounts && action.usageCount > 0 && variant !== 'compact' && (
            <span className="usage-count">{action.usageCount}</span>
          )}

          {isRecentlyUsed && (
            <div className="recent-indicator" title="Recently used">
              🔥
            </div>
          )}
        </div>
      </button>
    );
  };

  const renderGridVariant = () => (
    <div className="actions-grid">
      {actions.map((action, index) => renderActionButton(action, index))}
    </div>
  );

  const renderListVariant = () => (
    <div className="actions-list">
      {actions.map((action, index) => (
        <div key={action.id} className="action-list-item">
          {renderActionButton(action, index)}
          {variant === 'list' && (
            <div className="action-shortcut">{action.shortcut}</div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCompactVariant = () => (
    <div className="actions-compact">
      {actions.map((action, index) => renderActionButton(action, index))}
    </div>
  );

  const renderGroupedVariant = () => {
    const groupedActions = getGroupedActions();
    
    return (
      <div className="actions-grouped">
        {Object.entries(groupedActions).map(([category, categoryActions]) => (
          <div key={category} className="action-group">
            <div className="group-header">
              <span className="group-icon">{actionCategories[category]?.icon}</span>
              <span className="group-label">{actionCategories[category]?.label}</span>
              {showCounts && (
                <span className="group-count">({categoryActions.length})</span>
              )}
            </div>
            <div className="group-actions">
              {categoryActions.map((action, index) => renderActionButton(action, index))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`quick-actions loading variant-${variant} ${className}`}>
        <div className="loading-skeleton">
          {Array.from({ length: maxActions }).map((_, index) => (
            <div key={index} className="action-skeleton">
              <div className="skeleton-icon"></div>
              {showLabels && (
                <div className="skeleton-text">
                  <div className="skeleton-line large"></div>
                  <div className="skeleton-line medium"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`quick-actions variant-${variant} size-${size} ${className}`}>
      {/* Header */}
      <div className="quick-actions-header">
        <h3 className="actions-title">Quick Actions</h3>
        <div className="actions-subtitle">
          {recentlyUsed.length > 0 && (
            <span className="recent-info">
              Recently used: {recentlyUsed.map(a => a.label).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Actions Content */}
      <div className="quick-actions-content">
        {variant === 'grid' && renderGridVariant()}
        {variant === 'list' && renderListVariant()}
        {variant === 'compact' && renderCompactVariant()}
        {variant === 'grouped' && renderGroupedVariant()}
      </div>

      {/* Footer */}
      <div className="quick-actions-footer">
        <div className="actions-stats">
          <span className="stat">
            {actions.filter(a => a.isPinned).length} pinned
          </span>
          <span className="stat">
            {actions.reduce((sum, a) => sum + (a.usageCount || 0), 0)} total uses
          </span>
        </div>
        
        {variant !== 'compact' && (
          <button className="customize-button" title="Customize quick actions">
            Customize
          </button>
        )}
      </div>
    </div>
  );
};

// Individual Action Button Component for reuse
export const ActionButton = ({
  label,
  description,
  icon,
  color = 'blue',
  size = 'medium',
  onClick,
  usageCount = 0,
  isPinned = false,
  requiresApproval = false,
  shortcut,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      className={`action-button action-${color} action-size-${size} ${
        isPinned ? 'pinned' : ''
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={`${label} - ${description} ${shortcut ? `(${shortcut})` : ''}`}
    >
      <div className="action-content">
        <div className="action-icon">{icon}</div>
        <div className="action-text">
          <span className="action-label">{label}</span>
          <span className="action-description">{description}</span>
        </div>
        
        {requiresApproval && (
          <div className="approval-badge" title="Requires approval">
            ⭐
          </div>
        )}
      </div>

      <div className="action-meta">
        {isPinned && <span className="pin-indicator">📌</span>}
        {usageCount > 0 && <span className="usage-count">{usageCount}</span>}
      </div>
    </button>
  );
};

export default QuickActions;