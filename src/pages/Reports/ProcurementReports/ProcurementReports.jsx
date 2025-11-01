import React, { useState, useEffect, useMemo } from 'react';
import { useReports } from '../../../hooks/useReports';
import { useProcurement } from '../../../hooks/usePurchaseOrders';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import DatePicker from '../../../components/common/DatePicker/DatePicker';
import './ProcurementReports.css';

const ProcurementReports = () => {
  const {
    loading,
    generateProcurementReport,
    exportReport,
    getReportStatistics
  } = useReports();

  const { purchaseOrders } = useProcurement();

  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    status: 'all',
    category: 'all',
    supplier: 'all',
    department: 'all'
  });

  const [reportData, setReportData] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (purchaseOrders.length > 0) {
      generateReport();
    }
  }, [filters, purchaseOrders]);

  const loadInitialData = async () => {
    await generateReport();
  };

  const generateReport = async () => {
    try {
      const report = await generateProcurementReport(filters);
      setReportData(report);
      
      const stats = await getReportStatistics(filters);
      setStatistics(stats);
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
          case 'last_7_days':
            return {
              ...newFilters,
              startDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
              endDate: now
            };
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
          case 'this_month':
            { const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
              ...newFilters,
              startDate: firstDay,
              endDate: now
            }; }
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
      await exportReport(reportData, exportFormat, 'procurement_report');
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Memoized calculations for better performance
  const chartData = useMemo(() => {
    if (!reportData) return null;

    const monthlySpending = {};
    const categorySpending = {};
    const supplierSpending = {};
    const statusDistribution = {};

    reportData.purchaseOrders?.forEach(order => {
      // Monthly spending
      const month = new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlySpending[month] = (monthlySpending[month] || 0) + order.totalAmount;

      // Category spending
      const category = order.category || 'Uncategorized';
      categorySpending[category] = (categorySpending[category] || 0) + order.totalAmount;

      // Supplier spending
      const supplier = order.supplier?.name || 'Unknown Supplier';
      supplierSpending[supplier] = (supplierSpending[supplier] || 0) + order.totalAmount;

      // Status distribution
      statusDistribution[order.status] = (statusDistribution[order.status] || 0) + 1;
    });

    return {
      monthlySpending: Object.entries(monthlySpending)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([month, amount]) => ({ month, amount })),
      categorySpending: Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([category, amount]) => ({ category, amount })),
      supplierSpending: Object.entries(supplierSpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([supplier, amount]) => ({ supplier, amount })),
      statusDistribution: Object.entries(statusDistribution)
        .map(([status, count]) => ({ status, count }))
    };
  }, [reportData]);

  const topSuppliers = useMemo(() => {
    if (!chartData?.supplierSpending) return [];
    return chartData.supplierSpending.slice(0, 5);
  }, [chartData]);

  const topCategories = useMemo(() => {
    if (!chartData?.categorySpending) return [];
    return chartData.categorySpending.slice(0, 5);
  }, [chartData]);

  const renderChart = (data, title, color = '#3498db') => {
    if (!data || data.length === 0) {
      return <div className="no-data">No data available for the selected period</div>;
    }

    const maxValue = Math.max(...data.map(item => item.amount || item.count));

    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="chart-bars">
          {data.map((item, index) => {
            const value = item.amount || item.count;
            const percentage = (value / maxValue) * 100;
            const label = item.month || item.category || item.supplier || item.status;
            
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
                  {item.amount ? formatCurrency(value) : value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPieChart = (data, title) => {
    if (!data || data.length === 0) {
      return <div className="no-data">No data available</div>;
    }

    const total = data.reduce((sum, item) => sum + (item.amount || item.count), 0);
    let currentAngle = 0;

    return (
      <div className="pie-chart-container">
        <h4>{title}</h4>
        <div className="pie-chart">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const value = item.amount || item.count;
              const percentage = value / total;
              const angle = percentage * 360;
              const largeArc = percentage > 0.5 ? 1 : 0;
              
              const x1 = 100 + 80 * Math.cos(currentAngle * Math.PI / 180);
              const y1 = 100 + 80 * Math.sin(currentAngle * Math.PI / 180);
              currentAngle += angle;
              const x2 = 100 + 80 * Math.cos(currentAngle * Math.PI / 180);
              const y2 = 100 + 80 * Math.sin(currentAngle * Math.PI / 180);

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');

              const color = `hsl(${index * 60}, 70%, 50%)`;

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
          </svg>
        </div>
        <div className="pie-legend">
          {data.map((item, index) => {
            const value = item.amount || item.count;
            const percentage = (value / total) * 100;
            const color = `hsl(${index * 60}, 70%, 50%)`;
            const label = item.category || item.status;

            return (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="legend-label">{label}</span>
                <span className="legend-value">
                  {formatCurrency(value)} ({percentage.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && !reportData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="procurement-reports-container">
      <div className="reports-header">
        <div className="header-content">
          <h1>Procurement Reports</h1>
          <p>Comprehensive analysis of procurement activities and spending</p>
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
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
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
            <label>Order Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="it_equipment">IT Equipment</option>
              <option value="furniture">Furniture</option>
              <option value="services">Services</option>
              <option value="raw_materials">Raw Materials</option>
            </select>
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
              dateRange: 'last_30_days',
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              endDate: new Date(),
              status: 'all',
              category: 'all',
              supplier: 'all',
              department: 'all'
            })}
            className="btn-outline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-section">
        <h3>Key Performance Indicators</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{formatCurrency(statistics.totalSpending || 0)}</div>
            <div className="metric-label">Total Spending</div>
            <div className="metric-change positive">
              +12.5% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{statistics.totalOrders || 0}</div>
            <div className="metric-label">Total Orders</div>
            <div className="metric-change positive">
              +8.3% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{formatCurrency(statistics.averageOrderValue || 0)}</div>
            <div className="metric-label">Average Order Value</div>
            <div className="metric-change negative">
              -2.1% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{statistics.uniqueSuppliers || 0}</div>
            <div className="metric-label">Active Suppliers</div>
            <div className="metric-change positive">
              +5.2% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">
              {statistics.completionRate ? formatPercentage(statistics.completionRate) : '0%'}
            </div>
            <div className="metric-label">On-Time Delivery</div>
            <div className="metric-change positive">
              +3.7% from previous period
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-value">
              {statistics.savingsRate ? formatPercentage(statistics.savingsRate) : '0%'}
            </div>
            <div className="metric-label">Cost Savings</div>
            <div className="metric-change positive">
              +4.2% from previous period
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="charts-section">
        <div className="charts-header">
          <h3>Spending Analysis</h3>
          <div className="chart-controls">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            {chartType === 'bar' 
              ? renderChart(chartData?.monthlySpending, 'Monthly Spending Trend', '#3498db')
              : chartType === 'pie'
              ? renderPieChart(chartData?.categorySpending?.slice(0, 6), 'Spending by Category')
              : renderChart(chartData?.monthlySpending, 'Monthly Spending Trend', '#3498db')
            }
          </div>

          <div className="chart-card">
            {renderChart(topCategories, 'Top Categories by Spending', '#27ae60')}
          </div>

          <div className="chart-card">
            {renderChart(topSuppliers, 'Top Suppliers by Spending', '#e74c3c')}
          </div>

          <div className="chart-card">
            {renderPieChart(chartData?.statusDistribution, 'Orders by Status')}
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="data-section">
        <h3>Detailed Procurement Data</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.purchaseOrders?.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.orderNumber}</td>
                  <td className="supplier">{order.supplier?.name}</td>
                  <td className="category">{order.category}</td>
                  <td className="order-date">{formatDate(order.orderDate)}</td>
                  <td className="status">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="amount">{formatCurrency(order.totalAmount)}</td>
                  <td className="delivery-date">
                    {order.deliveryDate ? formatDate(order.deliveryDate) : 'Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!reportData?.purchaseOrders || reportData.purchaseOrders.length === 0) && (
            <div className="no-data-message">
              No procurement data found for the selected filters
            </div>
          )}
        </div>

        {reportData?.purchaseOrders && reportData.purchaseOrders.length > 10 && (
          <div className="table-footer">
            <p>Showing 10 of {reportData.purchaseOrders.length} orders</p>
            <button className="btn-outline">View All Orders</button>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Report"
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
                Charts and Visualizations
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Detailed Data Table
              </label>
              <label className="section-option">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Executive Summary
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

export default ProcurementReports;