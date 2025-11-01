import React, { useState, useEffect } from 'react';
import './ProcurementReports.css';

const ProcurementReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    reportType: 'all',
    dateRange: 'last_30_days',
    department: 'all',
    status: 'all',
    supplier: 'all'
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    schedule: 'once'
  });

  // Mock data - replace with actual API calls
  const mockReports = [
    {
      id: 'REP-2024-001',
      name: 'Monthly Procurement Summary',
      type: 'summary',
      description: 'Comprehensive overview of procurement activities for the month',
      generatedDate: new Date('2024-01-15T10:30:00Z'),
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      },
      status: 'completed',
      format: 'pdf',
      size: '2.4 MB',
      records: 245,
      createdBy: 'John Smith',
      department: 'Procurement',
      metrics: {
        totalSpend: 1250000,
        totalOrders: 45,
        averageOrderValue: 27777,
        costSavings: 187500,
        complianceRate: 94.5
      }
    },
    {
      id: 'REP-2024-002',
      name: 'Supplier Performance Analysis',
      type: 'supplier',
      description: 'Detailed analysis of supplier performance and delivery metrics',
      generatedDate: new Date('2024-01-14T14:15:00Z'),
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      },
      status: 'completed',
      format: 'excel',
      size: '1.8 MB',
      records: 28,
      createdBy: 'Sarah Johnson',
      department: 'Vendor Management',
      metrics: {
        totalSuppliers: 42,
        averageRating: 4.3,
        onTimeDelivery: 92.8,
        qualityScore: 89.5,
        contractCompliance: 96.2
      }
    },
    {
      id: 'REP-2024-003',
      name: 'Purchase Order Tracking',
      type: 'tracking',
      description: 'Real-time tracking of purchase order status and approvals',
      generatedDate: new Date('2024-01-13T09:45:00Z'),
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      },
      status: 'completed',
      format: 'pdf',
      size: '3.1 MB',
      records: 156,
      createdBy: 'Mike Chen',
      department: 'Operations',
      metrics: {
        totalPOs: 156,
        pendingApproval: 12,
        approved: 132,
        rejected: 8,
        averageProcessingTime: 2.4
      }
    },
    {
      id: 'REP-2024-004',
      name: 'Inventory Stock Analysis',
      type: 'inventory',
      description: 'Analysis of inventory levels, turnover, and stock alerts',
      generatedDate: new Date('2024-01-12T16:20:00Z'),
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      },
      status: 'completed',
      format: 'excel',
      size: '2.1 MB',
      records: 89,
      createdBy: 'Emily Davis',
      department: 'Inventory',
      metrics: {
        totalProducts: 89,
        lowStockItems: 8,
        outOfStock: 3,
        averageTurnover: 4.2,
        stockValue: 456000
      }
    },
    {
      id: 'REP-2024-005',
      name: 'Cost Savings Report',
      type: 'savings',
      description: 'Detailed breakdown of cost savings and avoidance initiatives',
      generatedDate: new Date('2024-01-11T11:30:00Z'),
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      },
      status: 'completed',
      format: 'pdf',
      size: '1.5 MB',
      records: 34,
      createdBy: 'Robert Wilson',
      department: 'Finance',
      metrics: {
        totalSavings: 187500,
        negotiatedSavings: 125000,
        processSavings: 42500,
        contractSavings: 20000,
        roi: 285
      }
    },
    {
      id: 'REP-2024-006',
      name: 'Q1 Procurement Forecast',
      type: 'forecast',
      description: 'Procurement demand forecast for Q1 2024',
      generatedDate: new Date('2024-01-10T13:15:00Z'),
      dateRange: {
        start: '2024-01-01',
        end: '2024-03-31'
      },
      status: 'completed',
      format: 'pdf',
      size: '2.8 MB',
      records: 67,
      createdBy: 'Lisa Brown',
      department: 'Planning',
      metrics: {
        forecastSpend: 3850000,
        plannedOrders: 89,
        expectedSavings: 285000,
        riskLevel: 'medium',
        confidence: 85
      }
    }
  ];

  const reportTypes = [
    { value: 'all', label: 'All Reports', icon: '📊' },
    { value: 'summary', label: 'Summary Reports', icon: '📈' },
    { value: 'supplier', label: 'Supplier Reports', icon: '🏢' },
    { value: 'tracking', label: 'Tracking Reports', icon: '📋' },
    { value: 'inventory', label: 'Inventory Reports', icon: '📦' },
    { value: 'savings', label: 'Savings Reports', icon: '💰' },
    { value: 'forecast', label: 'Forecast Reports', icon: '🔮' },
    { value: 'compliance', label: 'Compliance Reports', icon: '✅' }
  ];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'Procurement', label: 'Procurement' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Inventory', label: 'Inventory' },
    { value: 'Vendor Management', label: 'Vendor Management' },
    { value: 'Planning', label: 'Planning' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'generating', label: 'Generating' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'failed', label: 'Failed' }
  ];

  const dateRangeOptions = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'current_month', label: 'Current Month' },
    { value: 'current_quarter', label: 'Current Quarter' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: '📄' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
    { value: 'csv', label: 'CSV File', icon: '📋' },
    { value: 'html', label: 'Web Page', icon: '🌐' }
  ];

  const scheduleOptions = [
    { value: 'once', label: 'Run Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Simulate API call
      // const response = await reportsAPI.getProcurementReports(filters);
      // setReports(response.data);
      
      setTimeout(() => {
        setReports(mockReports);
        setLoading(false);
      }, 1200);
    } catch (error) {
      console.error('Error loading reports:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleReportSelection = (reportId, checked) => {
    const newSelected = new Set(selectedReports);
    if (checked) {
      newSelected.add(reportId);
    } else {
      newSelected.delete(reportId);
    }
    setSelectedReports(newSelected);
  };


  const generateNewReport = async () => {
    setGeneratingReport(true);
    try {
      // Validate report configuration
      if (!reportConfig.name.trim()) {
        alert('Please enter a report name');
        setGeneratingReport(false);
        return;
      }

      const reportData = {
        ...reportConfig,
        filters: filters,
        dateRange: dateRange,
        generatedDate: new Date().toISOString(),
        status: 'generating'
      };

      // In real implementation:
      // const response = await reportsAPI.generateReport(reportData);
      
      console.log('Generating report:', reportData);
      
      // Simulate report generation
      setTimeout(() => {
        const newReport = {
          id: `REP-${new Date().getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`,
          name: reportConfig.name,
          type: filters.reportType,
          description: reportConfig.description,
          generatedDate: new Date(),
          dateRange: dateRange,
          status: 'completed',
          format: reportConfig.format,
          size: '2.1 MB',
          records: 156,
          createdBy: 'Current User',
          department: 'Procurement',
          metrics: {
            totalSpend: 1250000,
            totalOrders: 45,
            averageOrderValue: 27777,
            costSavings: 187500,
            complianceRate: 94.5
          }
        };

        setReports(prev => [newReport, ...prev]);
        setGeneratingReport(false);
        setActiveTab('saved');
        setReportConfig({
          name: '',
          description: '',
          format: 'pdf',
          includeCharts: true,
          includeDetails: true,
          schedule: 'once'
        });

        alert('Report generated successfully!');
      }, 3000);

    } catch (error) {
      console.error('Error generating report:', error);
      setGeneratingReport(false);
      alert('Error generating report. Please try again.');
    }
  };

  const downloadReport = (report) => {
    console.log('Downloading report:', report);
    // In real implementation, this would trigger file download
    alert(`Downloading ${report.name}...`);
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(prev => prev.filter(report => report.id !== reportId));
      setSelectedReports(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(reportId);
        return newSelected;
      });
    }
  };

  const deleteSelectedReports = () => {
    if (selectedReports.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedReports.size} selected report(s)?`)) {
      setReports(prev => prev.filter(report => !selectedReports.has(report.id)));
      setSelectedReports(new Set());
    }
  };

  const shareReport = (report) => {
    console.log('Sharing report:', report);
    // In real implementation, this would open a share dialog
    alert(`Share options for ${report.name}`);
  };

  const duplicateReport = (report) => {
    const duplicatedReport = {
      ...report,
      id: `REP-${new Date().getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`,
      name: `${report.name} (Copy)`,
      generatedDate: new Date()
    };
    
    setReports(prev => [duplicatedReport, ...prev]);
    alert('Report duplicated successfully!');
  };

  const scheduleReport = (report) => {
    console.log('Scheduling report:', report);
    // In real implementation, this would open a scheduling dialog
    alert(`Schedule options for ${report.name}`);
  };

  const getReportIcon = (type) => {
    const icons = {
      summary: '📈',
      supplier: '🏢',
      tracking: '📋',
      inventory: '📦',
      savings: '💰',
      forecast: '🔮',
      compliance: '✅'
    };
    return icons[type] || '📊';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', class: 'status-completed', icon: '✅' },
      generating: { label: 'Generating', class: 'status-generating', icon: '⏳' },
      scheduled: { label: 'Scheduled', class: 'status-scheduled', icon: '📅' },
      failed: { label: 'Failed', class: 'status-failed', icon: '❌' }
    };

    const config = statusConfig[status] || { label: status, class: 'status-unknown', icon: '⚪' };
    
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getFormatBadge = (format) => {
    const formatConfig = {
      pdf: { label: 'PDF', class: 'format-pdf', icon: '📄' },
      excel: { label: 'Excel', class: 'format-excel', icon: '📊' },
      csv: { label: 'CSV', class: 'format-csv', icon: '📋' },
      html: { label: 'HTML', class: 'format-html', icon: '🌐' }
    };

    const config = formatConfig[format] || { label: format, class: 'format-unknown', icon: '📁' };
    
    return (
      <span className={`format-badge ${config.class}`}>
        <span className="format-icon">{config.icon}</span>
        {config.label}
      </span>
    );
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


  const filteredReports = reports.filter(report => {
    if (filters.reportType !== 'all' && report.type !== filters.reportType) return false;
    if (filters.department !== 'all' && report.department !== filters.department) return false;
    if (filters.status !== 'all' && report.status !== filters.status) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="procurement-reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading procurement reports...</p>
      </div>
    );
  }

  return (
    <div className="procurement-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1>Procurement Reports</h1>
          <p>Generate, manage, and analyze procurement reports and analytics</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setActiveTab('new')}
          >
            + Generate New Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="reports-tabs">
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          📁 Saved Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          🚀 Generate New
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          📅 Scheduled Reports
        </button>
      </div>

      <div className="reports-content">
        {/* Saved Reports Tab */}
        {activeTab === 'saved' && (
          <div className="tab-content">
            {/* Filters */}
            <div className="reports-filters">
              <div className="filter-group">
                <label>Report Type:</label>
                <select
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

              <div className="filter-group">
                <label>Department:</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Date Range:</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  {dateRangeOptions.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {filters.dateRange === 'custom' && (
                <div className="filter-group custom-dates">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    placeholder="Start Date"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              )}

              <button 
                className="btn-clear-filters"
                onClick={() => setFilters({
                  reportType: 'all',
                  dateRange: 'last_30_days',
                  department: 'all',
                  status: 'all',
                  supplier: 'all'
                })}
              >
                Clear Filters
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedReports.size > 0 && (
              <div className="bulk-actions">
                <div className="bulk-info">
                  <strong>{selectedReports.size}</strong> report(s) selected
                </div>
                <div className="bulk-buttons">
                  <button 
                    className="btn-bulk download"
                    onClick={() => console.log('Download selected:', Array.from(selectedReports))}
                  >
                    📥 Download Selected
                  </button>
                  <button 
                    className="btn-bulk delete"
                    onClick={deleteSelectedReports}
                  >
                    🗑️ Delete Selected
                  </button>
                </div>
              </div>
            )}

            {/* Reports Grid */}
            <div className="reports-grid">
              {filteredReports.length === 0 ? (
                <div className="no-reports">
                  <div className="no-reports-icon">📊</div>
                  <h3>No Reports Found</h3>
                  <p>Try adjusting your filters or generate a new report.</p>
                </div>
              ) : (
                filteredReports.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="card-header">
                      <input
                        type="checkbox"
                        checked={selectedReports.has(report.id)}
                        onChange={(e) => handleReportSelection(report.id, e.target.checked)}
                        className="report-checkbox"
                      />
                      <div className="report-icon">
                        {getReportIcon(report.type)}
                      </div>
                      <div className="report-title">
                        <h3>{report.name}</h3>
                        <p>{report.description}</p>
                      </div>
                      <div className="report-status">
                        {getStatusBadge(report.status)}
                        {getFormatBadge(report.format)}
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="report-meta">
                        <div className="meta-item">
                          <label>Generated:</label>
                          <span>{formatDate(report.generatedDate)}</span>
                        </div>
                        <div className="meta-item">
                          <label>Date Range:</label>
                          <span>
                            {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="meta-item">
                          <label>Department:</label>
                          <span>{report.department}</span>
                        </div>
                        <div className="meta-item">
                          <label>Created By:</label>
                          <span>{report.createdBy}</span>
                        </div>
                      </div>

                      <div className="report-metrics">
                        <div className="metric">
                          <span className="metric-value">{report.records}</span>
                          <span className="metric-label">Records</span>
                        </div>
                        <div className="metric">
                          <span className="metric-value">{report.size}</span>
                          <span className="metric-label">Size</span>
                        </div>
                        {report.metrics && (
                          <>
                            <div className="metric">
                              <span className="metric-value">
                                ${(report.metrics.totalSpend / 1000).toFixed(0)}K
                              </span>
                              <span className="metric-label">Spend</span>
                            </div>
                            <div className="metric">
                              <span className="metric-value">
                                {report.metrics.complianceRate}%
                              </span>
                              <span className="metric-label">Compliance</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="btn-action primary"
                        onClick={() => downloadReport(report)}
                        title="Download Report"
                      >
                        📥 Download
                      </button>
                      <button 
                        className="btn-action secondary"
                        onClick={() => shareReport(report)}
                        title="Share Report"
                      >
                        🔗 Share
                      </button>
                      <button 
                        className="btn-action secondary"
                        onClick={() => duplicateReport(report)}
                        title="Duplicate Report"
                      >
                        📋 Duplicate
                      </button>
                      <button 
                        className="btn-action secondary"
                        onClick={() => scheduleReport(report)}
                        title="Schedule Report"
                      >
                        📅 Schedule
                      </button>
                      <button 
                        className="btn-action danger"
                        onClick={() => deleteReport(report.id)}
                        title="Delete Report"
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

        {/* Generate New Report Tab */}
        {activeTab === 'new' && (
          <div className="tab-content">
            <div className="report-generator">
              <div className="generator-header">
                <h2>Generate New Report</h2>
                <p>Configure and generate a new procurement report</p>
              </div>

              <div className="generator-form">
                <div className="form-section">
                  <h3>Report Configuration</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="reportName">Report Name *</label>
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
                      <label htmlFor="reportType">Report Type *</label>
                      <select
                        id="reportType"
                        value={filters.reportType}
                        onChange={(e) => handleFilterChange('reportType', e.target.value)}
                      >
                        {reportTypes.filter(type => type.value !== 'all').map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
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

                    <div className="form-group">
                      <label htmlFor="reportSchedule">Schedule</label>
                      <select
                        id="reportSchedule"
                        value={reportConfig.schedule}
                        onChange={(e) => setReportConfig(prev => ({
                          ...prev,
                          schedule: e.target.value
                        }))}
                      >
                        {scheduleOptions.map(schedule => (
                          <option key={schedule.value} value={schedule.value}>
                            {schedule.label}
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

                <div className="form-section">
                  <h3>Report Options</h3>
                  <div className="options-grid">
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
                        Include Charts and Graphs
                      </label>
                      <small>Add visual representations of data</small>
                    </div>

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
                        Include Detailed Data
                      </label>
                      <small>Include raw data tables in the report</small>
                    </div>

                    <div className="option-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={reportConfig.includeSummary}
                          onChange={(e) => setReportConfig(prev => ({
                            ...prev,
                            includeSummary: e.target.checked
                          }))}
                        />
                        <span className="checkmark"></span>
                        Include Executive Summary
                      </label>
                      <small>Add high-level summary section</small>
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
                      <small>Add actionable insights and recommendations</small>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Data Filters</h3>
                  <div className="filters-grid">
                    <div className="filter-group">
                      <label>Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      >
                        {dateRangeOptions.map(range => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Department</label>
                      <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                      >
                        {departments.map(dept => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {filters.dateRange === 'custom' && (
                      <div className="filter-group custom-dates">
                        <label>Custom Date Range</label>
                        <div className="date-inputs">
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                          />
                          <span>to</span>
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveTab('saved')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={generateNewReport}
                    disabled={generatingReport || !reportConfig.name.trim()}
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
          </div>
        )}

        {/* Scheduled Reports Tab */}
        {activeTab === 'scheduled' && (
          <div className="tab-content">
            <div className="scheduled-reports">
              <div className="scheduled-header">
                <h2>Scheduled Reports</h2>
                <p>Manage automated report generation schedules</p>
              </div>

              <div className="no-scheduled-reports">
                <div className="no-reports-icon">📅</div>
                <h3>No Scheduled Reports</h3>
                <p>You haven't scheduled any reports yet. Schedule a report to have it generated automatically.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('new')}
                >
                  Schedule a Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcurementReports;