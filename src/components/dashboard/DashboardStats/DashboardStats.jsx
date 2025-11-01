import React, { useState, useEffect } from 'react';
import './DashboardStats.css';

const DashboardStats = ({
  timeframe = 'month',
  onTimeframeChange,
  showFilters = true,
  className = '',
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data generator
  const generateMockData = (timeframe) => {
    const baseValues = {
      day: { multiplier: 1, variance: 0.3 },
      week: { multiplier: 7, variance: 0.5 },
      month: { multiplier: 30, variance: 0.7 },
      quarter: { multiplier: 90, variance: 1.0 }
    };

    const { multiplier, variance } = baseValues[timeframe] || baseValues.month;
    const baseAmount = 1000 * multiplier;

    return {
      totalOrders: Math.floor(baseAmount * (0.8 + Math.random() * variance)),
      pendingApprovals: Math.floor(baseAmount * 0.1 * (0.5 + Math.random() * variance)),
      activeSuppliers: Math.floor(50 + Math.random() * 20),
      totalSpend: Math.floor(baseAmount * 100 * (0.9 + Math.random() * variance)),
      costSavings: Math.floor(baseAmount * 20 * (0.8 + Math.random() * variance)),
      averageProcessingTime: Math.floor(2 + Math.random() * 3),
      onTimeDelivery: Math.floor(85 + Math.random() * 10),
      budgetUtilization: Math.floor(70 + Math.random() * 25)
    };
  };

  const generateTrendData = (currentStats, previousStats) => {
    const trends = {};
    Object.keys(currentStats).forEach(key => {
      const current = currentStats[key];
      const previous = previousStats[key] || current * 0.8;
      const change = ((current - previous) / previous) * 100;
      trends[key] = {
        value: change,
        isPositive: change >= 0,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
      };
    });
    return trends;
  };

  // Fetch stats data
  const fetchStats = async (timeframe) => {
    setLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentStats = generateMockData(timeframe);
        const previousStats = generateMockData(timeframe); // In real app, this would be previous period data
        
        const trends = generateTrendData(currentStats, previousStats);
        
        resolve({
          stats: currentStats,
          trends,
          lastUpdated: new Date()
        });
      }, 1000);
    });
  };

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchStats(timeframe);
      setStats(data.stats);
      setTrendData(data.trends);
      setLastUpdated(data.lastUpdated);
      setLoading(false);
    };

    loadStats();

    // Set up auto-refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadStats, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeframe, autoRefresh, refreshInterval]);

  const handleRefresh = async () => {
    const data = await fetchStats(timeframe);
    setStats(data.stats);
    setTrendData(data.trends);
    setLastUpdated(data.lastUpdated);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num}`;
  };

  const formatCount = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPercentage = (num) => {
    return `${num}%`;
  };

  const getStatCards = () => [
    {
      id: 'totalOrders',
      title: 'Total Orders',
      value: formatCount(stats.totalOrders || 0),
      icon: '📋',
      color: 'blue',
      description: 'Purchase orders created',
      trend: trendData.totalOrders,
      format: 'count'
    },
    {
      id: 'pendingApprovals',
      title: 'Pending Approvals',
      value: formatCount(stats.pendingApprovals || 0),
      icon: '⏳',
      color: 'orange',
      description: 'Awaiting approval',
      trend: trendData.pendingApprovals,
      format: 'count',
      alert: (stats.pendingApprovals || 0) > 50
    },
    {
      id: 'activeSuppliers',
      title: 'Active Suppliers',
      value: formatCount(stats.activeSuppliers || 0),
      icon: '👥',
      color: 'green',
      description: 'Registered suppliers',
      trend: trendData.activeSuppliers,
      format: 'count'
    },
    {
      id: 'totalSpend',
      title: 'Total Spend',
      value: formatNumber(stats.totalSpend || 0),
      icon: '💰',
      color: 'purple',
      description: 'Total procurement spend',
      trend: trendData.totalSpend,
      format: 'currency'
    },
    {
      id: 'costSavings',
      title: 'Cost Savings',
      value: formatNumber(stats.costSavings || 0),
      icon: '💸',
      color: 'teal',
      description: 'Achieved through negotiations',
      trend: trendData.costSavings,
      format: 'currency'
    },
    {
      id: 'averageProcessingTime',
      title: 'Avg. Processing Time',
      value: `${stats.averageProcessingTime || 0} days`,
      icon: '⏱️',
      color: 'indigo',
      description: 'Order to delivery',
      trend: trendData.averageProcessingTime,
      format: 'days'
    },
    {
      id: 'onTimeDelivery',
      title: 'On-Time Delivery',
      value: formatPercentage(stats.onTimeDelivery || 0),
      icon: '🚚',
      color: 'cyan',
      description: 'Orders delivered on time',
      trend: trendData.onTimeDelivery,
      format: 'percentage'
    },
    {
      id: 'budgetUtilization',
      title: 'Budget Utilization',
      value: formatPercentage(stats.budgetUtilization || 0),
      icon: '📊',
      color: 'pink',
      description: 'Of allocated budget used',
      trend: trendData.budgetUtilization,
      format: 'percentage',
      progress: stats.budgetUtilization || 0
    }
  ];

  const getTrendIcon = (trend) => {
    if (!trend) return '➡️';
    
    switch (trend.direction) {
      case 'up':
        return trend.isPositive ? '📈' : '⚠️';
      case 'down':
        return trend.isPositive ? '⚠️' : '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    if (!trend) return 'neutral';
    
    if (trend.direction === 'up') {
      return trend.isPositive ? 'positive' : 'negative';
    } else if (trend.direction === 'down') {
      return trend.isPositive ? 'negative' : 'positive';
    }
    return 'neutral';
  };

  const formatTrendValue = (trend) => {
    if (!trend) return 'N/A';
    
    const sign = trend.value > 0 ? '+' : '';
    return `${sign}${Math.abs(trend.value).toFixed(1)}%`;
  };

  const statCards = getStatCards();

  return (
    <div className={`dashboard-stats ${className}`}>
      {/* Header with Controls */}
      <div className="stats-header">
        <div className="header-left">
          <h2 className="stats-title">Procurement Overview</h2>
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {loading && <span className="updating-indicator"> • Updating...</span>}
          </div>
        </div>
        
        <div className="header-controls">
          {showFilters && (
            <div className="timeframe-filter">
              <label htmlFor="timeframe-select" className="filter-label">
                Timeframe:
              </label>
              <select
                id="timeframe-select"
                value={timeframe}
                onChange={(e) => onTimeframeChange?.(e.target.value)}
                className="timeframe-select"
                disabled={loading}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          )}
          
          <button
            className={`refresh-button ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh stats"
          >
            {loading ? '🔄' : '🔄'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div
            key={card.id}
            className={`stat-card stat-card-${card.color} ${
              card.alert ? 'stat-card-alert' : ''
            } ${loading ? 'stat-card-loading' : ''}`}
          >
            {/* Card Header */}
            <div className="stat-card-header">
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-title-section">
                <h3 className="stat-title">{card.title}</h3>
                <p className="stat-description">{card.description}</p>
              </div>
              {card.alert && <div className="stat-alert-badge">!</div>}
            </div>

            {/* Card Value */}
            <div className="stat-value-section">
              <div className="stat-value">{card.value}</div>
              
              {/* Trend Indicator */}
              {trendData[card.id] && (
                <div className={`stat-trend stat-trend-${getTrendColor(trendData[card.id])}`}>
                  <span className="trend-icon">
                    {getTrendIcon(trendData[card.id])}
                  </span>
                  <span className="trend-value">
                    {formatTrendValue(trendData[card.id])}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar for Budget Utilization */}
            {card.id === 'budgetUtilization' && card.progress !== undefined && (
              <div className="stat-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  ></div>
                </div>
                <div className="progress-labels">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="stat-skeleton">
                <div className="skeleton-line large"></div>
                <div className="skeleton-line medium"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="actions-title">Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-button action-primary">
            <span className="action-icon">📄</span>
            <span className="action-text">Create Purchase Order</span>
          </button>
          <button className="action-button action-secondary">
            <span className="action-icon">👥</span>
            <span className="action-text">Add Supplier</span>
          </button>
          <button className="action-button action-secondary">
            <span className="action-icon">📋</span>
            <span className="action-text">New RFQ</span>
          </button>
          <button className="action-button action-secondary">
            <span className="action-icon">📊</span>
            <span className="action-text">Generate Report</span>
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="performance-card">
          <h3 className="performance-title">Performance Summary</h3>
          <div className="performance-metrics">
            <div className="performance-metric">
              <span className="metric-label">Efficiency Score</span>
              <span className="metric-value">87%</span>
              <div className="metric-trend positive">
                <span>+5%</span>
              </div>
            </div>
            <div className="performance-metric">
              <span className="metric-label">Supplier Performance</span>
              <span className="metric-value">92%</span>
              <div className="metric-trend positive">
                <span>+2%</span>
              </div>
            </div>
            <div className="performance-metric">
              <span className="metric-label">Cost Efficiency</span>
              <span className="metric-value">78%</span>
              <div className="metric-trend negative">
                <span>-3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Stat Card Component for reuse
export const StatCard = ({
  title,
  value,
  icon,
  color = 'blue',
  description,
  trend,
  loading = false,
  alert = false,
  progress,
  className = ''
}) => {
  const getTrendIcon = (trend) => {
    if (!trend) return '➡️';
    
    switch (trend.direction) {
      case 'up':
        return trend.isPositive ? '📈' : '⚠️';
      case 'down':
        return trend.isPositive ? '⚠️' : '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    if (!trend) return 'neutral';
    
    if (trend.direction === 'up') {
      return trend.isPositive ? 'positive' : 'negative';
    } else if (trend.direction === 'down') {
      return trend.isPositive ? 'negative' : 'positive';
    }
    return 'neutral';
  };

  const formatTrendValue = (trend) => {
    if (!trend) return 'N/A';
    
    const sign = trend.value > 0 ? '+' : '';
    return `${sign}${Math.abs(trend.value).toFixed(1)}%`;
  };

  return (
    <div className={`stat-card stat-card-${color} ${alert ? 'stat-card-alert' : ''} ${loading ? 'stat-card-loading' : ''} ${className}`}>
      <div className="stat-card-header">
        <div className="stat-icon">{icon}</div>
        <div className="stat-title-section">
          <h3 className="stat-title">{title}</h3>
          {description && <p className="stat-description">{description}</p>}
        </div>
        {alert && <div className="stat-alert-badge">!</div>}
      </div>

      <div className="stat-value-section">
        <div className="stat-value">{value}</div>
        
        {trend && (
          <div className={`stat-trend stat-trend-${getTrendColor(trend)}`}>
            <span className="trend-icon">
              {getTrendIcon(trend)}
            </span>
            <span className="trend-value">
              {formatTrendValue(trend)}
            </span>
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="stat-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="stat-skeleton">
          <div className="skeleton-line large"></div>
          <div className="skeleton-line medium"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;