import React, { useState, useEffect, useMemo } from 'react';
import './SupplierReports.css';

const SupplierReports = () => {
  const [reports, setReports] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const [filters, setFilters] = useState({
    reportType: 'performance',
    timeRange: 'last_30_days',
    supplier: 'all',
    status: 'all',
    category: 'all'
  });
  const [selectedSuppliers, setSelectedSuppliers] = useState(new Set());
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    format: 'pdf',
    includeDetails: true,
    includeCharts: true,
    includeRecommendations: true
  });

  // Mock data - replace with actual API calls
  const mockSuppliers = [
    {
      id: 'SUPP-001',
      name: 'TechCorp Inc.',
      category: 'Electronics',
      status: 'active',
      rating: 4.8,
      totalSpend: 1250000,
      totalOrders: 45,
      onTimeDelivery: 98.2,
      qualityScore: 95.5,
      contractCompliance: 96.8,
      riskLevel: 'low',
      contact: {
        email: 'procurement@techcorp.com',
        phone: '+1-555-0123'
      },
      performance: {
        delivery: { score: 98, trend: 'up' },
        quality: { score: 96, trend: 'stable' },
        communication: { score: 94, trend: 'up' },
        pricing: { score: 92, trend: 'stable' }
      }
    },
    {
      id: 'SUPP-002',
      name: 'OfficeWorld Ltd',
      category: 'Office Supplies',
      status: 'active',
      rating: 4.6,
      totalSpend: 875000,
      totalOrders: 38,
      onTimeDelivery: 95.4,
      qualityScore: 92.8,
      contractCompliance: 94.2,
      riskLevel: 'low',
      contact: {
        email: 'sales@officeworld.com',
        phone: '+1-555-0124'
      },
      performance: {
        delivery: { score: 95, trend: 'stable' },
        quality: { score: 93, trend: 'up' },
        communication: { score: 91, trend: 'down' },
        pricing: { score: 89, trend: 'stable' }
      }
    },
    {
      id: 'SUPP-003',
      name: 'CompuGlobal Ltd',
      category: 'Electronics',
      status: 'active',
      rating: 4.2,
      totalSpend: 685000,
      totalOrders: 28,
      onTimeDelivery: 89.7,
      qualityScore: 88.3,
      contractCompliance: 91.5,
      riskLevel: 'medium',
      contact: {
        email: 'orders@compuglobal.com',
        phone: '+1-555-0125'
      },
      performance: {
        delivery: { score: 89, trend: 'down' },
        quality: { score: 88, trend: 'stable' },
        communication: { score: 85, trend: 'up' },
        pricing: { score: 92, trend: 'up' }
      }
    },
    {
      id: 'SUPP-004',
      name: 'SoftSolutions Corp',
      category: 'Software',
      status: 'active',
      rating: 4.4,
      totalSpend: 956000,
      totalOrders: 22,
      onTimeDelivery: 92.1,
      qualityScore: 94.7,
      contractCompliance: 97.3,
      riskLevel: 'low',
      contact: {
        email: 'support@softsolutions.com',
        phone: '+1-555-0126'
      },
      performance: {
        delivery: { score: 92, trend: 'stable' },
        quality: { score: 95, trend: 'up' },
        communication: { score: 93, trend: 'stable' },
        pricing: { score: 88, trend: 'down' }
      }
    },
    {
      id: 'SUPP-005',
      name: 'FurniturePro Inc',
      category: 'Furniture',
      status: 'active',
      rating: 4.1,
      totalSpend: 745000,
      totalOrders: 35,
      onTimeDelivery: 87.9,
      qualityScore: 86.2,
      contractCompliance: 89.8,
      riskLevel: 'medium',
      contact: {
        email: 'info@furniturepro.com',
        phone: '+1-555-0127'
      },
      performance: {
        delivery: { score: 87, trend: 'down' },
        quality: { score: 86, trend: 'down' },
        communication: { score: 82, trend: 'stable' },
        pricing: { score: 90, trend: 'up' }
      }
    },
    {
      id: 'SUPP-006',
      name: 'NetTech Solutions',
      category: 'Networking',
      status: 'active',
      rating: 4.7,
      totalSpend: 1345000,
      totalOrders: 18,
      onTimeDelivery: 97.8,
      qualityScore: 96.9,
      contractCompliance: 98.1,
      riskLevel: 'low',
      contact: {
        email: 'procurement@nettech.com',
        phone: '+1-555-0128'
      },
      performance: {
        delivery: { score: 98, trend: 'up' },
        quality: { score: 97, trend: 'stable' },
        communication: { score: 96, trend: 'up' },
        pricing: { score: 91, trend: 'stable' }
      }
    }
  ];

  const mockReports = [
    {
      id: 'SUPP-REP-2024-001',
      name: 'Supplier Performance Quarterly Review',
      type: 'performance',
      description: 'Comprehensive performance analysis of all active suppliers',
      generatedDate: new Date('2024-01-15T14:30:00Z'),
      timeRange: 'last_90_days',
      status: 'completed',
      format: 'pdf',
      size: '3.2 MB',
      suppliers: 42,
      metrics: {
        averageRating: 4.4,
        averageDelivery: 94.2,
        totalSpend: 5850000,
        costSavings: 425000
      }
    },
    {
      id: 'SUPP-REP-2024-002',
      name: 'Supplier Risk Assessment',
      type: 'risk',
      description: 'Risk analysis and mitigation recommendations for key suppliers',
      generatedDate: new Date('2024-01-10T11:15:00Z'),
      timeRange: 'last_30_days',
      status: 'completed',
      format: 'excel',
      size: '2.1 MB',
      suppliers: 28,
      metrics: {
        highRisk: 3,
        mediumRisk: 8,
        lowRisk: 17,
        riskScore: 6.2
      }
    },
    {
      id: 'SUPP-REP-2024-003',
      name: 'Supplier Compliance Report',
      type: 'compliance',
      description: 'Compliance tracking and audit results for supplier contracts',
      generatedDate: new Date('2024-01-08T09:45:00Z'),
      timeRange: 'last_30_days',
      status: 'completed',
      format: 'pdf',
      size: '1.8 MB',
      suppliers: 35,
      metrics: {
        complianceRate: 95.8,
        violations: 4,
        auditsCompleted: 12,
        improvementAreas: 8
      }
    },
    {
      id: 'SUPP-REP-2024-004',
      name: 'Supplier Spend Analysis',
      type: 'spend',
      description: 'Detailed analysis of supplier spending patterns and trends',
      generatedDate: new Date('2024-01-05T16:20:00Z'),
      timeRange: 'last_90_days',
      status: 'completed',
      format: 'excel',
      size: '4.1 MB',
      suppliers: 42,
      metrics: {
        totalSpend: 5850000,
        topSupplierSpend: 1345000,
        averageSpend: 139285,
        spendGrowth: 12.5
      }
    }
  ];

  const reportTypes = [
    { value: 'performance', label: 'Performance Reports', icon: '📊', description: 'Supplier performance metrics and KPIs' },
    { value: 'risk', label: 'Risk Assessment', icon: '⚠️', description: 'Risk analysis and mitigation reports' },
    { value: 'compliance', label: 'Compliance Reports', icon: '✅', description: 'Contract compliance and audit reports' },
    { value: 'spend', label: 'Spend Analysis', icon: '💰', description: 'Spending patterns and cost analysis' },
    { value: 'comparative', label: 'Comparative Analysis', icon: '⚖️', description: 'Supplier comparison and benchmarking' },
    { value: 'custom', label: 'Custom Reports', icon: '🎛️', description: 'Customized supplier reports' }
  ];

  const timeRangeOptions = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Software', label: 'Software' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Networking', label: 'Networking' },
    { value: 'Services', label: 'Services' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: '📄' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
    { value: 'csv', label: 'CSV File', icon: '📋' },
    { value: 'html', label: 'Web Page', icon: '🌐' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      // const suppliersResponse = await suppliersAPI.getSuppliers();
      // const reportsResponse = await reportsAPI.getSupplierReports();
      
      setTimeout(() => {
        setSuppliers(mockSuppliers);
        setReports(mockReports);
        setLoading(false);
      }, 1200);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSupplierSelection = (supplierId, checked) => {
    const newSelected = new Set(selectedSuppliers);
    if (checked) {
      newSelected.add(supplierId);
    } else {
      newSelected.delete(supplierId);
    }
    setSelectedSuppliers(newSelected);
  };

  const handleSelectAllSuppliers = (checked) => {
    if (checked) {
      setSelectedSuppliers(new Set(filteredSuppliers.map(supplier => supplier.id)));
    } else {
      setSelectedSuppliers(new Set());
    }
  };

  const generatePerformanceReport = async () => {
    setGeneratingReport(true);
    try {
      if (selectedSuppliers.size === 0 && filters.supplier === 'all') {
        alert('Please select at least one supplier or use specific filters');
        setGeneratingReport(false);
        return;
      }

      const reportData = {
        ...reportConfig,
        filters: filters,
        selectedSuppliers: Array.from(selectedSuppliers),
        generatedDate: new Date().toISOString(),
        type: filters.reportType
      };

      // In real implementation:
      // const response = await reportsAPI.generateSupplierReport(reportData);
      
      console.log('Generating supplier report:', reportData);
      
      // Simulate report generation
      setTimeout(() => {
        const newReport = {
          id: `SUPP-REP-${new Date().getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`,
          name: reportConfig.name || `${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report`,
          type: filters.reportType,
          description: reportConfig.description,
          generatedDate: new Date(),
          timeRange: filters.timeRange,
          status: 'completed',
          format: reportConfig.format,
          size: '2.8 MB',
          suppliers: selectedSuppliers.size > 0 ? selectedSuppliers.size : filteredSuppliers.length,
          metrics: generateReportMetrics()
        };

        setReports(prev => [newReport, ...prev]);
        setGeneratingReport(false);
        setActiveTab('reports');
        
        // Reset selection
        setSelectedSuppliers(new Set());
        setReportConfig({
          name: '',
          description: '',
          format: 'pdf',
          includeDetails: true,
          includeCharts: true,
          includeRecommendations: true
        });

        alert('Supplier report generated successfully!');
      }, 3000);

    } catch (error) {
      console.error('Error generating report:', error);
      setGeneratingReport(false);
      alert('Error generating report. Please try again.');
    }
  };

  const generateReportMetrics = () => {
    const selectedSupplierData = selectedSuppliers.size > 0 
      ? suppliers.filter(s => selectedSuppliers.has(s.id))
      : filteredSuppliers;

    switch (filters.reportType) {
      case 'performance':
        return {
          averageRating: calculateAverage(selectedSupplierData, 'rating'),
          averageDelivery: calculateAverage(selectedSupplierData, 'onTimeDelivery'),
          totalSpend: selectedSupplierData.reduce((sum, s) => sum + s.totalSpend, 0),
          costSavings: Math.round(selectedSupplierData.reduce((sum, s) => sum + s.totalSpend, 0) * 0.15)
        };
      case 'risk':
        { const riskCounts = selectedSupplierData.reduce((acc, s) => {
          acc[s.riskLevel] = (acc[s.riskLevel] || 0) + 1;
          return acc;
        }, {});
        return {
          highRisk: riskCounts.high || 0,
          mediumRisk: riskCounts.medium || 0,
          lowRisk: riskCounts.low || 0,
          riskScore: calculateAverage(selectedSupplierData.map(s => 
            s.riskLevel === 'high' ? 8 : s.riskLevel === 'medium' ? 5 : 2
          ))
        }; }
      case 'compliance':
        return {
          complianceRate: calculateAverage(selectedSupplierData, 'contractCompliance'),
          violations: Math.round(selectedSupplierData.length * 0.1),
          auditsCompleted: Math.round(selectedSupplierData.length * 0.3),
          improvementAreas: Math.round(selectedSupplierData.length * 0.2)
        };
      case 'spend':
        return {
          totalSpend: selectedSupplierData.reduce((sum, s) => sum + s.totalSpend, 0),
          topSupplierSpend: Math.max(...selectedSupplierData.map(s => s.totalSpend)),
          averageSpend: selectedSupplierData.reduce((sum, s) => sum + s.totalSpend, 0) / selectedSupplierData.length,
          spendGrowth: 12.5
        };
      default:
        return {};
    }
  };

  const calculateAverage = (data, field) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item[field], 0);
    return Math.round((sum / data.length) * 100) / 100;
  };

  const downloadReport = (report) => {
    console.log('Downloading report:', report);
    alert(`Downloading ${report.name}...`);
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(prev => prev.filter(report => report.id !== reportId));
    }
  };

  const shareReport = (report) => {
    console.log('Sharing report:', report);
    alert(`Share options for ${report.name}`);
  };

  const getRiskBadge = (riskLevel) => {
    const riskConfig = {
      low: { label: 'Low Risk', class: 'risk-low', icon: '✅' },
      medium: { label: 'Medium Risk', class: 'risk-medium', icon: '⚠️' },
      high: { label: 'High Risk', class: 'risk-high', icon: '🚨' }
    };

    const config = riskConfig[riskLevel] || { label: 'Unknown', class: 'risk-unknown', icon: '❓' };
    
    return (
      <span className={`risk-badge ${config.class}`}>
        <span className="risk-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'status-active', icon: '🟢' },
      pending: { label: 'Pending', class: 'status-pending', icon: '🟡' },
      suspended: { label: 'Suspended', class: 'status-suspended', icon: '🟠' },
      inactive: { label: 'Inactive', class: 'status-inactive', icon: '🔴' }
    };

    const config = statusConfig[status] || { label: status, class: 'status-unknown', icon: '⚪' };
    
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter suppliers based on current filters
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      if (filters.status !== 'all' && supplier.status !== filters.status) return false;
      if (filters.category !== 'all' && supplier.category !== filters.category) return false;
      if (filters.supplier !== 'all' && supplier.id !== filters.supplier) return false;
      return true;
    });
  }, [suppliers, filters]);

  if (loading) {
    return (
      <div className="supplier-reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading supplier reports...</p>
      </div>
    );
  }

  return (
    <div className="supplier-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1>Supplier Reports & Analytics</h1>
          <p>Comprehensive supplier performance analysis and reporting</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setActiveTab('generate')}
          >
            📊 Generate New Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="reports-tabs">
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          📈 Supplier Performance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          🚀 Generate Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📁 Saved Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          🔍 Advanced Analytics
        </button>
      </div>

      <div className="reports-content">
        {/* Supplier Performance Dashboard */}
        {activeTab === 'performance' && (
          <div className="tab-content">
            <div className="performance-header">
              <h2>Supplier Performance Dashboard</h2>
              <p>Real-time performance metrics and supplier insights</p>
            </div>

            {/* Performance Filters */}
            <div className="performance-filters">
              <div className="filter-group">
                <label>Supplier Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Category:</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Supplier:</label>
                <select
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                >
                  <option value="all">All Suppliers</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="performance-metrics">
              <div className="metric-card">
                <div className="metric-icon">🏢</div>
                <div className="metric-content">
                  <h3>{filteredSuppliers.length}</h3>
                  <p>Active Suppliers</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">⭐</div>
                <div className="metric-content">
                  <h3>{calculateAverage(filteredSuppliers, 'rating').toFixed(1)}</h3>
                  <p>Average Rating</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🚚</div>
                <div className="metric-content">
                  <h3>{calculateAverage(filteredSuppliers, 'onTimeDelivery').toFixed(1)}%</h3>
                  <p>On-Time Delivery</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <h3>{formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.totalSpend, 0))}</h3>
                  <p>Total Spend</p>
                </div>
              </div>
            </div>

            {/* Suppliers Grid */}
            <div className="suppliers-grid">
              {filteredSuppliers.map(supplier => (
                <div key={supplier.id} className="supplier-card">
                  <div className="card-header">
                    <div className="supplier-info">
                      <h3>{supplier.name}</h3>
                      <div className="supplier-meta">
                        <span className="category">{supplier.category}</span>
                        {getStatusBadge(supplier.status)}
                        {getRiskBadge(supplier.riskLevel)}
                      </div>
                    </div>
                    <div className="supplier-rating">
                      <span className="rating-value">⭐ {supplier.rating}</span>
                      <span className="total-orders">{supplier.totalOrders} orders</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="performance-metrics">
                      <div className="performance-item">
                        <label>Delivery Performance</label>
                        <div className="performance-score">
                          <span>{supplier.onTimeDelivery}%</span>
                          <span 
                            className="trend"
                            style={{ color: getTrendColor(supplier.performance.delivery.trend) }}
                          >
                            {getTrendIcon(supplier.performance.delivery.trend)}
                          </span>
                        </div>
                      </div>

                      <div className="performance-item">
                        <label>Quality Score</label>
                        <div className="performance-score">
                          <span>{supplier.qualityScore}%</span>
                          <span 
                            className="trend"
                            style={{ color: getTrendColor(supplier.performance.quality.trend) }}
                          >
                            {getTrendIcon(supplier.performance.quality.trend)}
                          </span>
                        </div>
                      </div>

                      <div className="performance-item">
                        <label>Contract Compliance</label>
                        <div className="performance-score">
                          <span>{supplier.contractCompliance}%</span>
                          <span 
                            className="trend"
                            style={{ color: getTrendColor(supplier.performance.communication.trend) }}
                          >
                            {getTrendIcon(supplier.performance.communication.trend)}
                          </span>
                        </div>
                      </div>

                      <div className="performance-item">
                        <label>Total Spend</label>
                        <div className="performance-score">
                          <span>{formatCurrency(supplier.totalSpend)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="supplier-contact">
                      <span>{supplier.contact.email}</span>
                      <span>{supplier.contact.phone}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn-action primary"
                      onClick={() => handleSupplierSelection(supplier.id, !selectedSuppliers.has(supplier.id))}
                    >
                      {selectedSuppliers.has(supplier.id) ? '✅ Selected' : '📊 Select for Report'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Reports Tab */}
        {activeTab === 'generate' && (
          <div className="tab-content">
            <div className="generate-header">
              <h2>Generate Supplier Report</h2>
              <p>Create comprehensive supplier analysis reports</p>
            </div>

            <div className="generate-wizard">
              {/* Step 1: Report Configuration */}
              <div className="wizard-step">
                <h3>📋 Report Configuration</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="reportName">Report Name</label>
                    <input
                      type="text"
                      id="reportName"
                      value={reportConfig.name}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      placeholder="Enter report name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reportType">Report Type</label>
                    <select
                      id="reportType"
                      value={filters.reportType}
                      onChange={(e) => handleFilterChange('reportType', e.target.value)}
                    >
                      {reportTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeRange">Time Range</label>
                    <select
                      id="timeRange"
                      value={filters.timeRange}
                      onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                    >
                      {timeRangeOptions.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reportFormat">Output Format</label>
                    <select
                      id="reportFormat"
                      value={reportConfig.format}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        format: e.target.value
                      }))}
                    >
                      {formatOptions.map(format => (
                        <option key={format.value} value={format.value}>
                          {format.icon} {format.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="reportDescription">Description</label>
                    <textarea
                      id="reportDescription"
                      value={reportConfig.description}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Enter report description"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Supplier Selection */}
              <div className="wizard-step">
                <h3>👥 Supplier Selection</h3>
                <div className="selection-header">
                  <div className="selection-info">
                    <strong>{selectedSuppliers.size}</strong> supplier(s) selected
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleSelectAllSuppliers(selectedSuppliers.size !== filteredSuppliers.length)}
                  >
                    {selectedSuppliers.size === filteredSuppliers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="suppliers-selection">
                  {filteredSuppliers.map(supplier => (
                    <div key={supplier.id} className="selection-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.has(supplier.id)}
                          onChange={(e) => handleSupplierSelection(supplier.id, e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        <div className="supplier-selection-info">
                          <strong>{supplier.name}</strong>
                          <span>{supplier.category} • ⭐ {supplier.rating}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Report Options */}
              <div className="wizard-step">
                <h3>⚙️ Report Options</h3>
                <div className="options-grid">
                  <div className="option-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeDetails}
                        onChange={(e) => setReportConfig(prev => ({
                          ...prev,
                          includeDetails: e.target.checked
                        }))}
                      />
                      <span className="checkmark"></span>
                      Include Detailed Supplier Data
                    </label>
                  </div>

                  <div className="option-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeCharts}
                        onChange={(e) => setReportConfig(prev => ({
                          ...prev,
                          includeCharts: e.target.checked
                        }))}
                      />
                      <span className="checkmark"></span>
                      Include Charts and Visualizations
                    </label>
                  </div>

                  <div className="option-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeRecommendations}
                        onChange={(e) => setReportConfig(prev => ({
                          ...prev,
                          includeRecommendations: e.target.checked
                        }))}
                      />
                      <span className="checkmark"></span>
                      Include Recommendations
                    </label>
                  </div>

                  <div className="option-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeExecutiveSummary}
                        onChange={(e) => setReportConfig(prev => ({
                          ...prev,
                          includeExecutiveSummary: e.target.checked
                        }))}
                      />
                      <span className="checkmark"></span>
                      Include Executive Summary
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="wizard-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveTab('performance')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={generatePerformanceReport}
                  disabled={generatingReport || (selectedSuppliers.size === 0 && filters.supplier === 'all')}
                >
                  {generatingReport ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Generating Report...
                    </>
                  ) : (
                    '🚀 Generate Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Reports Tab */}
        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="saved-reports-header">
              <h2>Saved Supplier Reports</h2>
              <p>Access and manage previously generated supplier reports</p>
            </div>

            <div className="reports-grid">
              {reports.length === 0 ? (
                <div className="no-reports">
                  <div className="no-reports-icon">📊</div>
                  <h3>No Reports Generated</h3>
                  <p>Generate your first supplier report to get started.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('generate')}
                  >
                    Generate Report
                  </button>
                </div>
              ) : (
                reports.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="card-header">
                      <div className="report-icon">
                        {reportTypes.find(t => t.value === report.type)?.icon || '📊'}
                      </div>
                      <div className="report-title">
                        <h3>{report.name}</h3>
                        <p>{report.description}</p>
                      </div>
                      <div className="report-meta">
                        <span className="format">{report.format.toUpperCase()}</span>
                        <span className="size">{report.size}</span>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="report-details">
                        <div className="detail-item">
                          <label>Generated:</label>
                          <span>{formatDate(report.generatedDate)}</span>
                        </div>
                        <div className="detail-item">
                          <label>Time Range:</label>
                          <span>{timeRangeOptions.find(t => t.value === report.timeRange)?.label}</span>
                        </div>
                        <div className="detail-item">
                          <label>Suppliers:</label>
                          <span>{report.suppliers} suppliers</span>
                        </div>
                      </div>

                      {report.metrics && (
                        <div className="report-metrics">
                          {Object.entries(report.metrics).map(([key, value]) => (
                            <div key={key} className="metric">
                              <span className="metric-label">
                                {key.split(/(?=[A-Z])/).join(' ')}
                              </span>
                              <span className="metric-value">
                                {typeof value === 'number' ? 
                                  (key.includes('Rate') || key.includes('Score') ? `${value}%` : 
                                   key.includes('Spend') ? formatCurrency(value) : value)
                                  : value
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="card-actions">
                      <button 
                        className="btn-action primary"
                        onClick={() => downloadReport(report)}
                      >
                        📥 Download
                      </button>
                      <button 
                        className="btn-action secondary"
                        onClick={() => shareReport(report)}
                      >
                        🔗 Share
                      </button>
                      <button 
                        className="btn-action danger"
                        onClick={() => deleteReport(report.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Advanced Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <div className="analytics-header">
              <h2>Supplier Analytics</h2>
              <p>Advanced analytics and insights for supplier performance</p>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>📈 Performance Trends</h3>
                <div className="analytics-content">
                  <p>Track supplier performance trends over time and identify improvement areas.</p>
                  <div className="coming-soon">
                    <span>Advanced Analytics Coming Soon</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>⚖️ Comparative Analysis</h3>
                <div className="analytics-content">
                  <p>Compare suppliers across multiple performance dimensions.</p>
                  <div className="coming-soon">
                    <span>Advanced Analytics Coming Soon</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>📊 Risk Analytics</h3>
                <div className="analytics-content">
                  <p>Advanced risk assessment and predictive analytics.</p>
                  <div className="coming-soon">
                    <span>Advanced Analytics Coming Soon</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>💰 Spend Analytics</h3>
                <div className="analytics-content">
                  <p>Deep dive into spending patterns and cost optimization opportunities.</p>
                  <div className="coming-soon">
                    <span>Advanced Analytics Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierReports;