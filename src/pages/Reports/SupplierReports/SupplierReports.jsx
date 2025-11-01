import React, { useState, useEffect, useMemo } from 'react';
import { useReports } from '../../../hooks/useReports';
import { useSuppliers } from '../../../hooks/useSuppliers';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import DatePicker from '../../../components/common/DatePicker/DatePicker';
import SupplierPerformanceScore from '../../../components/suppliers/SupplierPerformanceScore/SupplierPerformanceScore';
import './SupplierReports.css';

const SupplierReports = () => {
  const {
    loading,
    generateSupplierReport,
    exportReport,
    getSupplierPerformance
  } = useReports();

  const { suppliers, fetchSuppliers } = useSuppliers();

  const [filters, setFilters] = useState({
    dateRange: 'last_12_months',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    performanceRating: 'all',
    category: 'all',
    status: 'active',
    minOrders: 0,
    region: 'all'
  });

  const [reportData, setReportData] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  // eslint-disable-next-line no-empty-pattern
  const [] = useState('bar');
  const [viewMode, setViewMode] = useState('overview'); // overview, performance, financial

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (suppliers.length > 0) {
      generateReport();
    }
  }, [filters, suppliers]);

  const loadInitialData = async () => {
    await fetchSuppliers();
    await generateReport();
  };

  const generateReport = async () => {
    try {
      const report = await generateSupplierReport(filters);
      setReportData(report);
      
      const performance = await getSupplierPerformance(filters);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Handle date range presets
      if (key === 'dateRange') {
        const now = new Date();
        switch (value) {
          case 'last_3_months':
            return {
              ...newFilters,
              startDate: new Date(now - 90 * 24 * 60 * 60 * 1000),
              endDate: now
            };
          case 'last_6_months':
            return {
              ...newFilters,
              startDate: new Date(now - 180 * 24 * 60 * 60 * 1000),
              endDate: now
            };
          case 'last_12_months':
            return {
              ...newFilters,
              startDate: new Date(now - 365 * 24 * 60 * 60 * 1000),
              endDate: now
            };
          case 'this_year':
            { const yearStart = new Date(now.getFullYear(), 0, 1);
            return {
              ...newFilters,
              startDate: yearStart,
              endDate: now
            }; }
          case 'last_year':
            { const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
            const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
            return {
              ...newFilters,
              startDate: lastYearStart,
              endDate: lastYearEnd
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
      await exportReport(reportData, exportFormat, 'supplier_report');
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const openSupplierDetail = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'suspended': return '#e74c3c';
      case 'inactive': return '#95a5a6';
      default: return '#bdc3c7';
    }
  };

  // Memoized calculations for better performance
  const chartData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) return null;

    const performanceDistribution = {};
    const categorySpending = {};
    const regionalPerformance = {};
    const monthlySpending = {};

    performanceData.forEach(supplier => {
      // Performance distribution
      const performanceBand = Math.floor(supplier.overallScore / 10) * 10;
      performanceDistribution[performanceBand] = (performanceDistribution[performanceBand] || 0) + 1;

      // Category spending
      const category = supplier.category || 'Uncategorized';
      categorySpending[category] = (categorySpending[category] || 0) + (supplier.totalSpending || 0);

      // Regional performance
      const region = supplier.region || 'Unknown';
      if (!regionalPerformance[region]) {
        regionalPerformance[region] = {
          totalSuppliers: 0,
          totalSpending: 0,
          averageScore: 0
        };
      }
      regionalPerformance[region].totalSuppliers++;
      regionalPerformance[region].totalSpending += supplier.totalSpending || 0;
      regionalPerformance[region].averageScore += supplier.overallScore || 0;

      // Monthly spending (example - would need actual time series data)
      if (supplier.monthlySpending) {
        Object.entries(supplier.monthlySpending).forEach(([month, amount]) => {
          monthlySpending[month] = (monthlySpending[month] || 0) + amount;
        });
      }
    });

    // Calculate averages for regional performance
    Object.keys(regionalPerformance).forEach(region => {
      regionalPerformance[region].averageScore /= regionalPerformance[region].totalSuppliers;
    });

    return {
      performanceDistribution: Object.entries(performanceDistribution)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([band, count]) => ({ band: `${band}-${parseInt(band) + 9}`, count })),
      categorySpending: Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .map(([category, amount]) => ({ category, amount })),
      regionalPerformance: Object.entries(regionalPerformance)
        .sort(([, a], [, b]) => b.totalSpending - a.totalSpending)
        .map(([region, data]) => ({ 
          region, 
          ...data,
          averageScore: Math.round(data.averageScore)
        })),
      monthlySpending: Object.entries(monthlySpending)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([month, amount]) => ({ month, amount }))
    };
  }, [performanceData]);

  const topPerformers = useMemo(() => {
    if (!performanceData) return [];
    return [...performanceData]
      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
      .slice(0, 10);
  }, [performanceData]);

  const topSpenders = useMemo(() => {
    if (!performanceData) return [];
    return [...performanceData]
      .sort((a, b) => (b.totalSpending || 0) - (a.totalSpending || 0))
      .slice(0, 10);
  }, [performanceData]);

  const riskSuppliers = useMemo(() => {
    if (!performanceData) return [];
    return performanceData
      .filter(supplier => (supplier.overallScore || 0) < 70)
      .sort((a, b) => (a.overallScore || 0) - (b.overallScore || 0))
      .slice(0, 10);
  }, [performanceData]);

  const renderChart = (data, title, color = '#3498db', valueKey = 'amount') => {
    if (!data || data.length === 0) {
      return <div className="no-data">No data available for the selected period</div>;
    }

    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));

    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="chart-bars">
          {data.map((item, index) => {
            const value = item[valueKey];
            const percentage = (value / maxValue) * 100;
            const label = item.month || item.category || item.region || item.band;
            
            return (
              <div key={index} className="chart-bar">
                <div className="bar-label">{label}</div>
                <div className="bar-track">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  ></div>
                </div>
                <div className="bar-value">
                  {valueKey === 'amount' ? formatCurrency(value) : 
                   valueKey === 'count' ? value :
                   valueKey === 'averageScore' ? `${value}%` : value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  const renderSupplierCard = (supplier, index, showRank = false) => {
    return (
      <div 
        key={supplier.id} 
        className="supplier-card"
        onClick={() => openSupplierDetail(supplier)}
      >
        <div className="supplier-header">
          <div className="supplier-info">
            {showRank && <div className="supplier-rank">#{index + 1}</div>}
            <div className="supplier-name">{supplier.name}</div>
            <div className="supplier-category">{supplier.category}</div>
          </div>
          <div className="supplier-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(supplier.status) }}
            >
              {supplier.status}
            </span>
          </div>
        </div>

        <div className="supplier-metrics">
          <div className="metric">
            <div className="metric-label">Performance Score</div>
            <div className="metric-value">
              <SupplierPerformanceScore score={supplier.overallScore} />
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Total Spending</div>
            <div className="metric-value">{formatCurrency(supplier.totalSpending)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Total Orders</div>
            <div className="metric-value">{formatNumber(supplier.totalOrders)}</div>
          </div>
        </div>

        <div className="supplier-details">
          <div className="detail-item">
            <span className="label">On-Time Delivery:</span>
            <span className="value">{formatPercentage(supplier.onTimeDelivery)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Quality Rating:</span>
            <span className="value">{formatPercentage(supplier.qualityRating)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Response Time:</span>
            <span className="value">{supplier.avgResponseTime} days</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !reportData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="supplier-reports-container">
      <div className="reports-header">
        <div className="header-content">
          <h1>Supplier Performance Reports</h1>
          <p>Comprehensive analysis of supplier performance and spending</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setShowExportModal(true)}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
          onClick={() => setViewMode('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`toggle-btn ${viewMode === 'performance' ? 'active' : ''}`}
          onClick={() => setViewMode('performance')}
        >
          🎯 Performance
        </button>
        <button
          className={`toggle-btn ${viewMode === 'financial' ? 'active' : ''}`}
          onClick={() => setViewMode('financial')}
        >
          💰 Financial
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h3>Report Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="this_year">This Year</option>
              <option value="last_year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <>
              <div className="filter-group">
                <label>Start Date</label>
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                />
              </div>
            </>
          )}

          <div className="filter-group">
            <label>Performance Rating</label>
            <select
              value={filters.performanceRating}
              onChange={(e) => handleFilterChange('performanceRating', e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="excellent">Excellent (90-100)</option>
              <option value="good">Good (80-89)</option>
              <option value="fair">Fair (70-79)</option>
              <option value="poor">Poor (60-69)</option>
              <option value="critical">Critical (Below 60)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="raw_materials">Raw Materials</option>
              <option value="services">Services</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Minimum Orders</label>
            <input
              type="number"
              value={filters.minOrders}
              onChange={(e) => handleFilterChange('minOrders', parseInt(e.target.value) || 0)}
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button
            onClick={generateReport}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Apply Filters'}
          </button>
          <button
            onClick={() => setFilters({
              dateRange: 'last_12_months',
              startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
              endDate: new Date(),
              performanceRating: 'all',
              category: 'all',
              status: 'active',
              minOrders: 0,
              region: 'all'
            })}
            className="btn-outline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-section">
        <h3>Supplier Portfolio Overview</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{formatNumber(reportData?.totalSuppliers || 0)}</div>
            <div className="metric-label">Total Suppliers</div>
            <div className="metric-change positive">
              +5.2% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{formatCurrency(reportData?.totalSpending || 0)}</div>
            <div className="metric-label">Total Spending</div>
            <div className="metric-change positive">
              +12.8% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{formatNumber(reportData?.totalOrders || 0)}</div>
            <div className="metric-label">Total Orders</div>
            <div className="metric-change positive">
              +8.3% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">
              {reportData?.avgPerformanceScore ? `${Math.round(reportData.avgPerformanceScore)}%` : '0%'}
            </div>
            <div className="metric-label">Avg Performance Score</div>
            <div className="metric-change positive">
              +2.1% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">
              {reportData?.onTimeDeliveryRate ? formatPercentage(reportData.onTimeDeliveryRate) : '0%'}
            </div>
            <div className="metric-label">On-Time Delivery Rate</div>
            <div className="metric-change positive">
              +3.7% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">
              {reportData?.qualityRating ? formatPercentage(reportData.qualityRating) : '0%'}
            </div>
            <div className="metric-label">Quality Rating</div>
            <div className="metric-change negative">
              -1.2% from previous period
            </div>
          </div>
        </div>
      </div>

      {/* Overview View */}
      {viewMode === 'overview' && (
        <div className="overview-section">
          <div className="overview-grid">
            {/* Top Performers */}
            <div className="overview-card">
              <h3>🏆 Top Performers</h3>
              <div className="suppliers-list">
                {topPerformers.map((supplier, index) => renderSupplierCard(supplier, index, true))}
                {topPerformers.length === 0 && (
                  <div className="no-data">No supplier data available</div>
                )}
              </div>
            </div>

            {/* Top Spenders */}
            <div className="overview-card">
              <h3>💰 Top Spenders</h3>
              <div className="suppliers-list">
                {topSpenders.map((supplier, index) => renderSupplierCard(supplier, index, true))}
                {topSpenders.length === 0 && (
                  <div className="no-data">No supplier data available</div>
                )}
              </div>
            </div>

            {/* Risk Suppliers */}
            <div className="overview-card risk-card">
              <h3>⚠️ Suppliers Needing Attention</h3>
              <div className="suppliers-list">
                {riskSuppliers.map((supplier, index) => renderSupplierCard(supplier, index))}
                {riskSuppliers.length === 0 && (
                  <div className="no-data">No suppliers requiring attention</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance View */}
      {viewMode === 'performance' && (
        <div className="performance-section">
          <div className="charts-grid">
            <div className="chart-card">
              {renderChart(chartData?.performanceDistribution, 'Performance Score Distribution', '#3498db', 'count')}
            </div>
            <div className="chart-card">
              {renderChart(chartData?.regionalPerformance, 'Regional Performance (Avg Score)', '#27ae60', 'averageScore')}
            </div>
            <div className="chart-card">
              {renderChart(chartData?.categorySpending?.slice(0, 8), 'Spending by Category', '#e74c3c')}
            </div>
          </div>
        </div>
      )}

      {/* Financial View */}
      {viewMode === 'financial' && (
        <div className="financial-section">
          <div className="financial-grid">
            <div className="financial-card">
              <h3>📈 Spending Trend</h3>
              {renderChart(chartData?.monthlySpending, 'Monthly Spending', '#9b59b6')}
            </div>
            <div className="financial-card">
              <h3>🌍 Regional Spending</h3>
              {renderChart(chartData?.regionalPerformance, 'Spending by Region', '#f39c12', 'totalSpending')}
            </div>
          </div>

          {/* Supplier Financial Table */}
          <div className="financial-table-section">
            <h3>Supplier Financial Summary</h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Category</th>
                    <th>Total Spending</th>
                    <th>Orders</th>
                    <th>Avg Order Value</th>
                    <th>Spending Trend</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topSpenders.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="supplier-name">{supplier.name}</td>
                      <td className="category">{supplier.category}</td>
                      <td className="amount">{formatCurrency(supplier.totalSpending)}</td>
                      <td className="orders">{formatNumber(supplier.totalOrders)}</td>
                      <td className="avg-order-value">
                        {formatCurrency(supplier.avgOrderValue)}
                      </td>
                      <td className="trend">
                        <span className={`trend-indicator ${
                          (supplier.spendingTrend || 0) > 0 ? 'positive' : 'negative'
                        }`}>
                          {(supplier.spendingTrend || 0) > 0 ? '↗' : '↘'} 
                          {Math.abs(supplier.spendingTrend || 0)}%
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => openSupplierDetail(supplier)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Supplier Performance Details"
        size="large"
      >
        {selectedSupplier && (
          <div className="supplier-detail-modal">
            <div className="supplier-header">
              <div className="supplier-basic-info">
                <h3>{selectedSupplier.name}</h3>
                <div className="supplier-meta">
                  <span className="category">{selectedSupplier.category}</span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedSupplier.status) }}
                  >
                    {selectedSupplier.status}
                  </span>
                </div>
              </div>
              <div className="overall-score">
                <SupplierPerformanceScore score={selectedSupplier.overallScore} size="large" />
              </div>
            </div>

            <div className="detail-sections">
              <div className="detail-section">
                <h4>Performance Metrics</h4>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <label>On-Time Delivery</label>
                    <div className="metric-value">
                      {formatPercentage(selectedSupplier.onTimeDelivery)}
                    </div>
                  </div>
                  <div className="metric-item">
                    <label>Quality Rating</label>
                    <div className="metric-value">
                      {formatPercentage(selectedSupplier.qualityRating)}
                    </div>
                  </div>
                  <div className="metric-item">
                    <label>Response Time</label>
                    <div className="metric-value">
                      {selectedSupplier.avgResponseTime} days
                    </div>
                  </div>
                  <div className="metric-item">
                    <label>Communication Score</label>
                    <div className="metric-value">
                      {formatPercentage(selectedSupplier.communicationScore)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Financial Summary</h4>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <label>Total Spending</label>
                    <div className="metric-value">
                      {formatCurrency(selectedSupplier.totalSpending)}
                    </div>
                  </div>
                  <div className="metric-item">
                    <label>Total Orders</label>
                    <div className="metric-value">
                      {formatNumber(selectedSupplier.totalOrders)}
                    </div>
                  </div>
                  <div className="metric-item">
                    <label>Average Order Value</label>
                    <div className="metric-value">
                      {formatCurrency(selectedSupplier.avgOrderValue)}
                    </div>
                  </div>
                  <div className="metric-item">
                    <label>Spending Trend</label>
                    <div className="metric-value">
                      <span className={`trend ${
                        (selectedSupplier.spendingTrend || 0) > 0 ? 'positive' : 'negative'
                      }`}>
                        {(selectedSupplier.spendingTrend || 0) > 0 ? '+' : ''}
                        {selectedSupplier.spendingTrend}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedSupplier.issues && selectedSupplier.issues.length > 0 && (
                <div className="detail-section">
                  <h4>Recent Issues</h4>
                  <div className="issues-list">
                    {selectedSupplier.issues.map((issue, index) => (
                      <div key={index} className="issue-item">
                        <div className="issue-type">{issue.type}</div>
                        <div className="issue-description">{issue.description}</div>
                        <div className="issue-date">{issue.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Supplier Report"
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
                PDF Document
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span className="radio-label"></span>
                Excel Spreadsheet
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span className="radio-label"></span>
                CSV File
              </label>
            </div>

            <div className="export-sections">
              <h4>Include Sections</h4>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Key Metrics Summary
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Performance Analysis
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Financial Summary
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Supplier Rankings
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
              Export Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierReports;