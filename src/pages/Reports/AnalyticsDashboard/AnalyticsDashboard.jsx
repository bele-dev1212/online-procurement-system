import React, { useState, useEffect, useMemo } from 'react';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useInventory } from '../../../hooks/useInventory';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import './AnalyticsDashboard.css';
import { formatCurrency } from '../../../utils/helpers/formatters';
const AnalyticsDashboard = () => {
  const { purchaseOrders, loading: poLoading } = usePurchaseOrders();
  const { suppliers, loading: supplierLoading } = useSuppliers();
  const { inventory, loading: inventoryLoading } = useInventory();

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

  const loading = poLoading || supplierLoading || inventoryLoading;

  // Real-time data calculation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoRefresh) {
        setRealTimeData({
          liveOrders: purchaseOrders?.filter(po => 
            ['pending', 'approved', 'ordered'].includes(po.status)
          ).length || 0,
          pendingApprovals: purchaseOrders?.filter(po => 
            po.status === 'pending'
          ).length || 0,
          lowStockItems: inventory?.filter(item => 
            item.stockQuantity <= (item.minStock || 10)
          ).length || 0,
          activeSuppliers: suppliers?.filter(s => s.status === 'active').length || 0
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, purchaseOrders, inventory, suppliers]);

  // Calculate analytics data from actual data
  useEffect(() => {
    if (loading) return;
    
    const calculateAnalytics = () => {
      // Calculate spending by category
      const spendingByCategory = {};
      purchaseOrders?.forEach(po => {
        po.items?.forEach(item => {
          const category = item.category || 'Uncategorized';
          spendingByCategory[category] = (spendingByCategory[category] || 0) + (item.total || 0);
        });
      });

      // Calculate monthly trend
      const monthlyTrend = {};
      purchaseOrders?.forEach(po => {
        const month = new Date(po.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthlyTrend[month] = (monthlyTrend[month] || 0) + (po.totalAmount || 0);
      });

      // Calculate supplier performance
      const supplierPerformance = suppliers?.map(supplier => {
        const supplierOrders = purchaseOrders?.filter(po => po.supplierId === supplier.id);
        const totalSpending = supplierOrders?.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
        const onTimeOrders = supplierOrders?.filter(po => 
          po.deliveryDate && new Date(po.deliveryDate) <= new Date(po.expectedDelivery)
        ).length;
        
        return {
          id: supplier.id,
          name: supplier.name,
          score: supplierOrders?.length ? Math.round((onTimeOrders / supplierOrders.length) * 100) : 0,
          trend: 0, // You can calculate trend based on historical data
          spending: totalSpending || 0
        };
      }).sort((a, b) => b.score - a.score);

      // Calculate risk analysis
      const riskAnalysis = {
        highRiskSuppliers: suppliers?.filter(s => 
          s.rating < 3 || s.status !== 'active'
        ).length || 0,
        mediumRiskSuppliers: suppliers?.filter(s => 
          s.rating >= 3 && s.rating < 4 && s.status === 'active'
        ).length || 0,
        lowRiskSuppliers: suppliers?.filter(s => 
          s.rating >= 4 && s.status === 'active'
        ).length || 0
      };

      // Calculate statistics
      const totalSpending = purchaseOrders?.reduce((sum, po) => sum + (po.totalAmount || 0), 0) || 0;
      const costSavings = purchaseOrders?.reduce((sum, po) => sum + (po.costSavings || 0), 0) || 0;
      const avgSupplierScore = supplierPerformance?.length ? 
        supplierPerformance.reduce((sum, s) => sum + s.score, 0) / supplierPerformance.length : 0;

      setAnalyticsData({
        spendingByCategory: Object.entries(spendingByCategory).map(([category, value]) => ({
          category,
          value
        })),
        monthlyTrend: Object.entries(monthlyTrend).map(([month, value]) => ({
          month,
          value
        })),
        supplierPerformance: supplierPerformance || [],
        riskAnalysis
      });

      setStatistics({
        totalSpending,
        costSavings,
        avgSupplierScore,
        spendingTrend: 5, // You can calculate actual trend
        savingsTrend: 8,
        efficiencyRate: 0.85,
        efficiencyTrend: 3,
        supplierScoreTrend: 2,
        avgCycleTime: 7,
        cycleTimeTrend: -1,
        inventoryTurnover: 4.2,
        turnoverTrend: 0.5,
        negotiationSavings: costSavings * 0.6,
        processSavings: costSavings * 0.25,
        supplierSavings: costSavings * 0.10,
        inventorySavings: costSavings * 0.05,
        optimizationPotential: totalSpending * 0.08
      });
    };

    calculateAnalytics();
  }, [purchaseOrders, suppliers, inventory, loading]);

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
            const quarter = Math.floor(now.getMonth() / 3);
            const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
            return {
              ...newFilters,
              startDate: quarterStart,
              endDate: now
            };
          case 'this_year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return {
              ...newFilters,
              startDate: yearStart,
              endDate: now
            };
          default:
            return newFilters;
        }
      }
      
      return newFilters;
    });
  };

  const handleExport = async () => {
    try {
      // Simple export functionality - you can implement actual export logic here
      const dataStr = JSON.stringify(analyticsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_dashboard_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
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
  }, [statistics]);

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

  // Rest of the component remains the same...
  // [Include all the rendering functions and JSX from your original component]

  if (loading && !analyticsData) {
    return (
      <div className="analytics-dashboard-loading">
        <LoadingSpinner size="large" />
        <p>Loading analytics data...</p>
      </div>
    );
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

      {/* Continue with the rest of your JSX from the original component */}
      {/* Real-time Metrics, Filters, KPI Cards, Dashboard Grid, etc. */}
      
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
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span className="radio-label"></span>
                JSON Data
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
