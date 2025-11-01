import React, { useState, useEffect, useMemo } from 'react';
import { useReports } from '../../../hooks/useReports';
import { useProcurement } from '../../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useInventory } from '../../../hooks/useInventory';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import DatePicker from '../../../components/common/DatePicker/DatePicker';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const {
    loading,
    generateAnalyticsReport,
    getAnalyticsStatistics,
    exportReport
  } = useReports();

  useProcurement();
  const { suppliers } = useSuppliers();
  useInventory();

  const [filters, setFilters] = useState({
    dateRange: 'last_12_months',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    view: 'overview',
    metric: 'spending',
    comparisonPeriod: 'previous_period'
  });

  const [analyticsData, setAnalyticsData] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [realTimeData, setRealTimeData] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('spending');

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoRefresh) {
        setRealTimeData(() => ({
          liveOrders: Math.floor(Math.random() * 50) + 10,
          pendingApprovals: Math.floor(Math.random() * 20) + 5,
          lowStockItems: Math.floor(Math.random() * 15) + 3,
          activeSuppliers: suppliers.filter(s => s.status === 'active').length
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, suppliers]);

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      const analytics = await generateAnalyticsReport(filters);
      setAnalyticsData(analytics);
      
      const stats = await getAnalyticsStatistics(filters);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      if (key === 'dateRange') {
        const now = new Date();
        switch (value) {
          case 'last_30_days':
            return {
              ...newFilters,
              startDate: new Date(now - 30 * 24 * 60 * 60 * 1000),
              endDate: now
            };
          case 'last_90_days':
            return {
              ...newFilters,
              startDate: new Date(now - 90 * 24 * 60 * 60 * 1000),
              endDate: now
            };
          case 'last_12_months':
            return {
              ...newFilters,
              startDate: new Date(now - 365 * 24 * 60 * 60 * 1000),
              endDate: now
            };
          case 'this_quarter':
            { const quarter = Math.floor(now.getMonth() / 3);
            const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
            return {
              ...newFilters,
              startDate: quarterStart,
              endDate: now
            }; }
          case 'this_year':
            { const yearStart = new Date(now.getFullYear(), 0, 1);
            return {
              ...newFilters,
              startDate: yearStart,
              endDate: now
            }; }
          default:
            return newFilters;
        }
      }
      
      return newFilters;
    });
  };

  const handleExport = async () => {
    try {
      await exportReport(analyticsData, exportFormat, 'analytics_dashboard');
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };


  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return '#27ae60';
    if (trend < 0) return '#e74c3c';
    return '#7f8c8d';
  };

  // Memoized calculations for performance
  const kpiData = useMemo(() => {
    if (!analyticsData) return [];

    return [
      {
        title: 'Total Spending',
        value: formatCurrency(statistics.totalSpending),
        trend: statistics.spendingTrend,
        icon: '💰',
        color: '#3498db'
      },
      {
        title: 'Cost Savings',
        value: formatCurrency(statistics.costSavings),
        trend: statistics.savingsTrend,
        icon: '💸',
        color: '#27ae60'
      },
      {
        title: 'Procurement Efficiency',
        value: formatPercentage(statistics.efficiencyRate),
        trend: statistics.efficiencyTrend,
        icon: '⚡',
        color: '#f39c12'
      },
      {
        title: 'Supplier Performance',
        value: `${Math.round(statistics.avgSupplierScore)}%`,
        trend: statistics.supplierScoreTrend,
        icon: '🏆',
        color: '#9b59b6'
      },
      {
        title: 'Order Cycle Time',
        value: `${statistics.avgCycleTime} days`,
        trend: -statistics.cycleTimeTrend, // Negative because lower is better
        icon: '⏱️',
        color: '#e74c3c'
      },
      {
        title: 'Inventory Turnover',
        value: statistics.inventoryTurnover?.toFixed(1) || '0.0',
        trend: statistics.turnoverTrend,
        icon: '📦',
        color: '#1abc9c'
      }
    ];
  }, [analyticsData, statistics]);

  const spendingByCategory = useMemo(() => {
    if (!analyticsData?.spendingByCategory) return [];
    return analyticsData.spendingByCategory.slice(0, 8);
  }, [analyticsData]);

  const monthlyTrend = useMemo(() => {
    if (!analyticsData?.monthlyTrend) return [];
    return analyticsData.monthlyTrend.slice(-12); // Last 12 months
  }, [analyticsData]);

  const supplierPerformance = useMemo(() => {
    if (!analyticsData?.supplierPerformance) return [];
    return analyticsData.supplierPerformance.slice(0, 10);
  }, [analyticsData]);

  const riskAnalysis = useMemo(() => {
    if (!analyticsData?.riskAnalysis) return [];
    return analyticsData.riskAnalysis;
  }, [analyticsData]);

  const renderSparkline = (data, color = '#3498db') => {
    if (!data || data.length === 0) return null;

    const values = data.map(item => item.value || item.amount || item.count);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;

    return (
      <div className="sparkline">
        {values.map((value, index) => {
          const height = range > 0 ? ((value - minValue) / range) * 30 : 15;
          return (
            <div
              key={index}
              className="sparkline-bar"
              style={{
                height: `${height}px`,
                backgroundColor: color
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderGauge = (value, max = 100, color = '#3498db', size = 'medium') => {
    const percentage = (value / max) * 100;
    
    return (
      <div className={`gauge ${size}`}>
        <div className="gauge-background">
          <div 
            className="gauge-fill"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        <div className="gauge-value">{value}%</div>
      </div>
    );
  };

  const renderTrendChart = (data, title, color = '#3498db') => {
    if (!data || data.length === 0) {
      return <div className="no-data">No data available</div>;
    }

    const values = data.map(item => item.value || item.amount);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    return (
      <div className="trend-chart">
        <div className="chart-header">
          <h4>{title}</h4>
          <div className="chart-stats">
            <span className="current-value">
              {values[values.length - 1] ? formatCurrency(values[values.length - 1]) : 'N/A'}
            </span>
            <span className="trend">
              {getTrendIcon(values[values.length - 1] - values[0])}
            </span>
          </div>
        </div>
        <div className="chart-area">
          <svg width="100%" height="80" viewBox={`0 0 ${data.length * 20} 80`}>
            <path
              d={data.map((item, index) => {
                const x = index * 20 + 10;
                const y = 70 - ((item.value - minValue) / (maxValue - minValue)) * 60;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            {data.map((item, index) => {
              const x = index * 20 + 10;
              const y = 70 - ((item.value - minValue) / (maxValue - minValue)) * 60;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                />
              );
            })}
          </svg>
        </div>
        <div className="chart-labels">
          {data.map((item, index) => (
            <div key={index} className="chart-label">
              {item.month?.substring(0, 3) || item.category?.substring(0, 3) || ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDonutChart = (data, title, colors = ['#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6']) => {
    if (!data || data.length === 0) {
      return <div className="no-data">No data available</div>;
    }

    const total = data.reduce((sum, item) => sum + (item.value || item.amount), 0);
    let currentAngle = 0;

    return (
      <div className="donut-chart">
        <h4>{title}</h4>
        <div className="chart-container">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {data.map((item, index) => {
              const value = item.value || item.amount;
              const percentage = value / total;
              const angle = percentage * 360;
              const largeArc = percentage > 0.5 ? 1 : 0;
              
              const x1 = 60 + 50 * Math.cos(currentAngle * Math.PI / 180);
              const y1 = 60 + 50 * Math.sin(currentAngle * Math.PI / 180);
              currentAngle += angle;
              const x2 = 60 + 50 * Math.cos(currentAngle * Math.PI / 180);
              const y2 = 60 + 50 * Math.sin(currentAngle * Math.PI / 180);

              const pathData = [
                `M 60 60`,
                `L ${x1} ${y1}`,
                `A 50 50 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');

              const color = colors[index % colors.length];

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx="60" cy="60" r="30" fill="white" />
          </svg>
        </div>
        <div className="donut-legend">
          {data.map((item, index) => {
            const value = item.value || item.amount;
            const percentage = (value / total) * 100;
            const color = colors[index % colors.length];
            const label = item.category || item.name;

            return (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: color }}
                />
                <span className="legend-label">{label}</span>
                <span className="legend-value">{percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && !analyticsData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Procurement Analytics Dashboard</h1>
          <p>Real-time insights and performance metrics for your procurement operations</p>
        </div>
        <div className="header-actions">
          <div className="auto-refresh">
            <label>
              <input
                type="checkbox"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
              />
              Auto Refresh
            </label>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowExportModal(true)}
          >
            Export Dashboard
          </button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="real-time-metrics">
        <h3>🔄 Live Operations</h3>
        <div className="metrics-grid">
          <div className="live-metric">
            <div className="metric-icon">📋</div>
            <div className="metric-info">
              <div className="metric-value">{realTimeData.liveOrders || 0}</div>
              <div className="metric-label">Live Orders</div>
            </div>
          </div>
          <div className="live-metric">
            <div className="metric-icon">⏳</div>
            <div className="metric-info">
              <div className="metric-value">{realTimeData.pendingApprovals || 0}</div>
              <div className="metric-label">Pending Approvals</div>
            </div>
          </div>
          <div className="live-metric">
            <div className="metric-icon">⚠️</div>
            <div className="metric-info">
              <div className="metric-value">{realTimeData.lowStockItems || 0}</div>
              <div className="metric-label">Low Stock Items</div>
            </div>
          </div>
          <div className="live-metric">
            <div className="metric-icon">🏢</div>
            <div className="metric-info">
              <div className="metric-value">{realTimeData.activeSuppliers || 0}</div>
              <div className="metric-label">Active Suppliers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_12_months">Last 12 Months</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
        </div>

        <div className="filter-group">
          <label>View</label>
          <select
            value={filters.view}
            onChange={(e) => handleFilterChange('view', e.target.value)}
          >
            <option value="overview">Overview</option>
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="strategic">Strategic</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Primary Metric</label>
          <select
            value={filters.metric}
            onChange={(e) => handleFilterChange('metric', e.target.value)}
          >
            <option value="spending">Spending</option>
            <option value="efficiency">Efficiency</option>
            <option value="savings">Savings</option>
            <option value="performance">Performance</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Compare With</label>
          <select
            value={filters.comparisonPeriod}
            onChange={(e) => handleFilterChange('comparisonPeriod', e.target.value)}
          >
            <option value="previous_period">Previous Period</option>
            <option value="same_period_last_year">Same Period Last Year</option>
            <option value="budget">Budget</option>
            <option value="forecast">Forecast</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-section">
        <h3>Key Performance Indicators</h3>
        <div className="kpi-grid">
          {kpiData.map((kpi, index) => (
            <div key={index} className="kpi-card">
              <div className="kpi-header">
                <div 
                  className="kpi-icon"
                  style={{ backgroundColor: kpi.color }}
                >
                  {kpi.icon}
                </div>
                <div className="kpi-trend">
                  <span 
                    className="trend-icon"
                    style={{ color: getTrendColor(kpi.trend) }}
                  >
                    {getTrendIcon(kpi.trend)}
                  </span>
                  <span 
                    className="trend-value"
                    style={{ color: getTrendColor(kpi.trend) }}
                  >
                    {Math.abs(kpi.trend || 0)}%
                  </span>
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-title">{kpi.title}</div>
              {renderSparkline(monthlyTrend.slice(-6), kpi.color)}
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Spending Trends */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h3>📈 Spending Trends & Forecast</h3>
            <div className="card-actions">
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="metric-select"
              >
                <option value="spending">Total Spending</option>
                <option value="savings">Cost Savings</option>
                <option value="efficiency">Efficiency</option>
              </select>
            </div>
          </div>
          <div className="card-content">
            {renderTrendChart(monthlyTrend, 'Monthly Spending Trend', '#3498db')}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="dashboard-card">
          <h3>📊 Spending by Category</h3>
          <div className="card-content">
            {renderDonutChart(spendingByCategory, 'Category Distribution')}
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="dashboard-card">
          <h3>🏆 Top Supplier Performance</h3>
          <div className="card-content">
            <div className="performance-list">
              {supplierPerformance.map((supplier, index) => (
                <div key={supplier.id} className="performance-item">
                  <div className="supplier-info">
                    <div className="supplier-rank">#{index + 1}</div>
                    <div className="supplier-name">{supplier.name}</div>
                  </div>
                  <div className="performance-score">
                    {renderGauge(supplier.score, 100, getTrendColor(supplier.trend), 'small')}
                  </div>
                  <div className="supplier-spending">
                    {formatCurrency(supplier.spending)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="dashboard-card">
          <h3>⚠️ Risk Assessment</h3>
          <div className="card-content">
            <div className="risk-metrics">
              <div className="risk-item">
                <div className="risk-label">High-Risk Suppliers</div>
                <div className="risk-value">{riskAnalysis.highRiskSuppliers || 0}</div>
                <div className="risk-bar">
                  <div 
                    className="risk-fill high"
                    style={{ width: `${(riskAnalysis.highRiskSuppliers / suppliers.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="risk-item">
                <div className="risk-label">Medium-Risk</div>
                <div className="risk-value">{riskAnalysis.mediumRiskSuppliers || 0}</div>
                <div className="risk-bar">
                  <div 
                    className="risk-fill medium"
                    style={{ width: `${(riskAnalysis.mediumRiskSuppliers / suppliers.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="risk-item">
                <div className="risk-label">Low-Risk</div>
                <div className="risk-value">{riskAnalysis.lowRiskSuppliers || 0}</div>
                <div className="risk-bar">
                  <div 
                    className="risk-fill low"
                    style={{ width: `${(riskAnalysis.lowRiskSuppliers / suppliers.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="dashboard-card">
          <h3>⚡ Operational Efficiency</h3>
          <div className="card-content">
            <div className="efficiency-metrics">
              <div className="efficiency-item">
                <div className="metric-label">Order Cycle Time</div>
                {renderGauge(85, 100, '#27ae60')}
                <div className="metric-comparison">↓ 12% from last period</div>
              </div>
              <div className="efficiency-item">
                <div className="metric-label">Approval Rate</div>
                {renderGauge(92, 100, '#3498db')}
                <div className="metric-comparison">↑ 5% from last period</div>
              </div>
              <div className="efficiency-item">
                <div className="metric-label">On-Time Delivery</div>
                {renderGauge(88, 100, '#f39c12')}
                <div className="metric-comparison">↑ 3% from last period</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Savings Analysis */}
        <div className="dashboard-card full-width">
          <h3>💸 Cost Savings Analysis</h3>
          <div className="card-content">
            <div className="savings-breakdown">
              <div className="savings-item">
                <div className="savings-type">Negotiation Savings</div>
                <div className="savings-amount">{formatCurrency(statistics.negotiationSavings)}</div>
                <div className="savings-trend positive">+15%</div>
              </div>
              <div className="savings-item">
                <div className="savings-type">Process Efficiency</div>
                <div className="savings-amount">{formatCurrency(statistics.processSavings)}</div>
                <div className="savings-trend positive">+8%</div>
              </div>
              <div className="savings-item">
                <div className="savings-type">Supplier Optimization</div>
                <div className="savings-amount">{formatCurrency(statistics.supplierSavings)}</div>
                <div className="savings-trend positive">+12%</div>
              </div>
              <div className="savings-item">
                <div className="savings-type">Inventory Reduction</div>
                <div className="savings-amount">{formatCurrency(statistics.inventorySavings)}</div>
                <div className="savings-trend negative">-3%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="insights-section">
        <h3>💡 Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <div className="insight-content">
              <h4>Cost Optimization Opportunity</h4>
              <p>Consolidate orders with top 3 suppliers to achieve volume discounts. Potential savings: {formatCurrency(statistics.optimizationPotential)}</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <h4>Process Improvement</h4>
              <p>Automate approval workflow for orders under $5,000. Could reduce cycle time by 2-3 days.</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🔄</div>
            <div className="insight-content">
              <h4>Supplier Diversification</h4>
              <p>Consider adding 2-3 alternative suppliers for high-risk categories to mitigate supply chain disruptions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Analytics Dashboard"
        size="medium"
      >
        <div className="export-modal-content">
          <div className="export-options">
            <h4>Export Format</h4>
            <div className="format-options">
              <label className="format-option">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span className="radio-label"></span>
                PDF Report
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span className="radio-label"></span>
                Excel Data Export
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  value="powerpoint"
                  checked={exportFormat === 'powerpoint'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span className="radio-label"></span>
                PowerPoint Presentation
              </label>
            </div>

            <div className="export-sections">
              <h4>Include Sections</h4>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Executive Summary
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                KPI Dashboard
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Detailed Analysis
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Insights & Recommendations
              </label>
            </div>
          </div>

          <div className="export-actions">
            <button
              onClick={() => setShowExportModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="btn-primary"
            >
              Export Dashboard
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnalyticsDashboard;