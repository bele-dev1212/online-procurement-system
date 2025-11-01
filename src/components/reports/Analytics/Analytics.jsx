import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');


  // Mock data - replace with actual API calls
  const mockData = {
    overview: {
      totalSpend: 1250000,
      totalOrders: 245,
      activeSuppliers: 42,
      costSavings: 187500,
      spendChange: 12.5,
      ordersChange: 8.3,
      suppliersChange: -2.3,
      savingsChange: 15.7
    },
    spendTrend: [
      { month: 'Jan', spend: 95000, budget: 100000 },
      { month: 'Feb', spend: 110000, budget: 100000 },
      { month: 'Mar', spend: 105000, budget: 100000 },
      { month: 'Apr', spend: 98000, budget: 100000 },
      { month: 'May', spend: 115000, budget: 100000 },
      { month: 'Jun', spend: 125000, budget: 100000 }
    ],
    categorySpend: [
      { category: 'Electronics', spend: 450000, percentage: 36 },
      { category: 'Office Supplies', spend: 280000, percentage: 22.4 },
      { category: 'Furniture', spend: 195000, percentage: 15.6 },
      { category: 'Software', spend: 175000, percentage: 14 },
      { category: 'Services', spend: 150000, percentage: 12 }
    ],
    supplierPerformance: [
      { name: 'TechCorp Inc.', rating: 4.8, orders: 45, spend: 285000, onTimeDelivery: 98 },
      { name: 'OfficeWorld Ltd', rating: 4.6, orders: 38, spend: 195000, onTimeDelivery: 95 },
      { name: 'FurniturePro', rating: 4.4, orders: 28, spend: 165000, onTimeDelivery: 92 },
      { name: 'SoftSolutions', rating: 4.2, orders: 22, spend: 175000, onTimeDelivery: 90 },
      { name: 'SupplyChain Co', rating: 4.1, orders: 35, spend: 142000, onTimeDelivery: 88 }
    ],
    procurementMetrics: {
      avgProcessingTime: 3.2,
      approvalRate: 94.5,
      complianceRate: 88.7,
      supplierDiversity: 28.3
    },
    kpis: [
      { name: 'Cost per Order', current: 245, target: 200, trend: 'up' },
      { name: 'Supplier Lead Time', current: 5.2, target: 4.5, trend: 'down' },
      { name: 'Purchase Order Accuracy', current: 96.8, target: 95, trend: 'up' },
      { name: 'Contract Utilization', current: 78.5, target: 85, trend: 'down' }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // In real implementation:
        // const data = await reportsAPI.getAnalytics(timeRange);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (change) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  const getTrendClass = (change) => {
    if (change > 0) return 'trend-positive';
    if (change < 0) return 'trend-negative';
    return 'trend-neutral';
  };

  const renderOverviewCards = () => (
    <div className="overview-cards">
      <div className="metric-card primary">
        <div className="metric-icon">💰</div>
        <div className="metric-content">
          <h3>Total Spend</h3>
          <div className="metric-value">{formatCurrency(mockData.overview.totalSpend)}</div>
          <div className={`metric-trend ${getTrendClass(mockData.overview.spendChange)}`}>
            <span className="trend-icon">{getTrendIcon(mockData.overview.spendChange)}</span>
            <span className="trend-value">{Math.abs(mockData.overview.spendChange)}%</span>
            <span className="trend-label">vs last period</span>
          </div>
        </div>
      </div>

      <div className="metric-card secondary">
        <div className="metric-icon">📦</div>
        <div className="metric-content">
          <h3>Total Orders</h3>
          <div className="metric-value">{mockData.overview.totalOrders}</div>
          <div className={`metric-trend ${getTrendClass(mockData.overview.ordersChange)}`}>
            <span className="trend-icon">{getTrendIcon(mockData.overview.ordersChange)}</span>
            <span className="trend-value">{Math.abs(mockData.overview.ordersChange)}%</span>
            <span className="trend-label">vs last period</span>
          </div>
        </div>
      </div>

      <div className="metric-card success">
        <div className="metric-icon">🏢</div>
        <div className="metric-content">
          <h3>Active Suppliers</h3>
          <div className="metric-value">{mockData.overview.activeSuppliers}</div>
          <div className={`metric-trend ${getTrendClass(mockData.overview.suppliersChange)}`}>
            <span className="trend-icon">{getTrendIcon(mockData.overview.suppliersChange)}</span>
            <span className="trend-value">{Math.abs(mockData.overview.suppliersChange)}%</span>
            <span className="trend-label">vs last period</span>
          </div>
        </div>
      </div>

      <div className="metric-card warning">
        <div className="metric-icon">💸</div>
        <div className="metric-content">
          <h3>Cost Savings</h3>
          <div className="metric-value">{formatCurrency(mockData.overview.costSavings)}</div>
          <div className={`metric-trend ${getTrendClass(mockData.overview.savingsChange)}`}>
            <span className="trend-icon">{getTrendIcon(mockData.overview.savingsChange)}</span>
            <span className="trend-value">{Math.abs(mockData.overview.savingsChange)}%</span>
            <span className="trend-label">vs last period</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpendChart = () => (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Spend Trend vs Budget</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color actual"></div>
            <span>Actual Spend</span>
          </div>
          <div className="legend-item">
            <div className="legend-color budget"></div>
            <span>Budget</span>
          </div>
        </div>
      </div>
      <div className="chart-content">
        <div className="bar-chart">
          {mockData.spendTrend.map((item, index) => (
            <div key={index} className="chart-bar-group">
              <div className="bar-labels">
                <span className="month-label">{item.month}</span>
                <span className="value-label">{formatCurrency(item.spend)}</span>
              </div>
              <div className="bars-container">
                <div 
                  className="bar actual" 
                  style={{ height: `${(item.spend / 130000) * 100}%` }}
                  title={`Actual: ${formatCurrency(item.spend)}`}
                ></div>
                <div 
                  className="bar budget" 
                  style={{ height: `${(item.budget / 130000) * 100}%` }}
                  title={`Budget: ${formatCurrency(item.budget)}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategorySpend = () => (
    <div className="chart-container">
      <h3>Spend by Category</h3>
      <div className="category-list">
        {mockData.categorySpend.map((category, index) => (
          <div key={index} className="category-item">
            <div className="category-header">
              <span className="category-name">{category.category}</span>
              <span className="category-percentage">{formatPercentage(category.percentage)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${category.percentage}%` }}
              ></div>
            </div>
            <div className="category-amount">
              {formatCurrency(category.spend)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSupplierPerformance = () => (
    <div className="chart-container">
      <h3>Top Suppliers by Performance</h3>
      <div className="suppliers-table">
        <div className="table-header">
          <div className="col-supplier">Supplier</div>
          <div className="col-rating">Rating</div>
          <div className="col-orders">Orders</div>
          <div className="col-spend">Spend</div>
          <div className="col-delivery">On-Time Delivery</div>
        </div>
        <div className="table-body">
          {mockData.supplierPerformance.map((supplier, index) => (
            <div key={index} className="table-row">
              <div className="col-supplier">
                <span className="supplier-name">{supplier.name}</span>
              </div>
              <div className="col-rating">
                <div className="rating-display">
                  <span className="rating-value">{supplier.rating}</span>
                  <div className="rating-stars">
                    {'★'.repeat(Math.floor(supplier.rating))}
                    {'☆'.repeat(5 - Math.floor(supplier.rating))}
                  </div>
                </div>
              </div>
              <div className="col-orders">{supplier.orders}</div>
              <div className="col-spend">{formatCurrency(supplier.spend)}</div>
              <div className="col-delivery">
                <span className="delivery-rate">{supplier.onTimeDelivery}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProcurementMetrics = () => (
    <div className="metrics-grid">
      <div className="metric-item">
        <div className="metric-title">Avg Processing Time</div>
        <div className="metric-value-large">{mockData.procurementMetrics.avgProcessingTime} days</div>
        <div className="metric-subtitle">From request to approval</div>
      </div>
      <div className="metric-item">
        <div className="metric-title">Approval Rate</div>
        <div className="metric-value-large">{mockData.procurementMetrics.approvalRate}%</div>
        <div className="metric-subtitle">Of submitted requests</div>
      </div>
      <div className="metric-item">
        <div className="metric-title">Compliance Rate</div>
        <div className="metric-value-large">{mockData.procurementMetrics.complianceRate}%</div>
        <div className="metric-subtitle">With procurement policies</div>
      </div>
      <div className="metric-item">
        <div className="metric-title">Supplier Diversity</div>
        <div className="metric-value-large">{mockData.procurementMetrics.supplierDiversity}%</div>
        <div className="metric-subtitle">Diverse-owned suppliers</div>
      </div>
    </div>
  );

  const renderKPIs = () => (
    <div className="kpi-container">
      <h3>Key Performance Indicators</h3>
      <div className="kpi-grid">
        {mockData.kpis.map((kpi, index) => (
          <div key={index} className="kpi-item">
            <div className="kpi-header">
              <span className="kpi-name">{kpi.name}</span>
              <span className={`kpi-trend ${kpi.trend}`}>
                {kpi.trend === 'up' ? '↗️' : '↘️'}
              </span>
            </div>
            <div className="kpi-values">
              <span className="kpi-current">{typeof kpi.current === 'number' ? kpi.current.toFixed(1) : kpi.current}</span>
              <span className="kpi-target">Target: {kpi.target}</span>
            </div>
            <div className="kpi-progress">
              <div 
                className="kpi-progress-bar"
                style={{ 
                  width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%`,
                  backgroundColor: kpi.current >= kpi.target ? '#10b981' : '#ef4444'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Procurement Analytics</h1>
          <p>Comprehensive insights into your procurement performance and spending patterns</p>
        </div>
        <div className="header-controls">
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-select"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button className="btn-export">
            📊 Export Report
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'spend' ? 'active' : ''}`}
          onClick={() => setActiveTab('spend')}
        >
          Spend Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Supplier Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance Metrics
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            {renderOverviewCards()}
            <div className="charts-grid">
              <div className="chart-column">
                {renderSpendChart()}
              </div>
              <div className="chart-column">
                {renderCategorySpend()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spend' && (
          <div className="tab-content">
            {renderSpendChart()}
            {renderCategorySpend()}
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="tab-content">
            {renderSupplierPerformance()}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="tab-content">
            {renderProcurementMetrics()}
            {renderKPIs()}
          </div>
        )}
      </div>

      <div className="analytics-footer">
        <div className="data-info">
          <span className="update-time">
            Last updated: {new Date().toLocaleString()}
          </span>
          <span className="data-source">
            Data source: Procurement System & ERP
          </span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;