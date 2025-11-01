import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSuppliers } from '../../../../hooks/useSuppliers';
import SearchBar from '../../../../components/common/SearchBar/SearchBar';
import LoadingSpinner from '../../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../../components/common/Modal/Modal';
import { formatCurrency } from '../../../../utils/helpers/formatters';
import { supplierCategories } from '../../../../utils/enums/supplierStatus';
import './SupplierPerformance.css';

const SupplierPerformance = () => {
  const navigate = useNavigate();
  const { suppliers, loading, error, refetch } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overallScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [timeRange, setTimeRange] = useState('last6months');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Generate performance data for demonstration
  const generatePerformanceData = () => {
    const baseScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const deliveryScore = Math.floor(Math.random() * 20) + 80; // 80-100
    const qualityScore = Math.floor(Math.random() * 25) + 75; // 75-100
    const responseScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const costScore = Math.floor(Math.random() * 35) + 65; // 65-100

    return {
      overallScore: baseScore,
      delivery: {
        score: deliveryScore,
        onTimeRate: Math.floor(Math.random() * 15) + 85, // 85-100%
        totalDeliveries: Math.floor(Math.random() * 50) + 50,
        lateDeliveries: Math.floor(Math.random() * 5) + 1
      },
      quality: {
        score: qualityScore,
        defectRate: (Math.random() * 5).toFixed(1), // 0-5%
        returnRate: (Math.random() * 3).toFixed(1), // 0-3%
        inspectionPassRate: Math.floor(Math.random() * 10) + 90 // 90-100%
      },
      responsiveness: {
        score: responseScore,
        avgResponseTime: (Math.random() * 24 + 4).toFixed(1), // 4-28 hours
        quoteAccuracy: Math.floor(Math.random() * 15) + 85, // 85-100%
        communicationRating: Math.floor(Math.random() * 20) + 80 // 80-100%
      },
      cost: {
        score: costScore,
        priceCompetitiveness: Math.floor(Math.random() * 20) + 75, // 75-95%
        costReduction: (Math.random() * 10 - 2).toFixed(1), // -2% to +8%
        invoiceAccuracy: Math.floor(Math.random() * 15) + 85 // 85-100%
      },
      financial: {
        totalSpend: Math.floor(Math.random() * 500000) + 500000,
        totalOrders: Math.floor(Math.random() * 100) + 50,
        avgOrderValue: Math.floor(Math.random() * 5000) + 5000,
        paymentTermsCompliance: Math.floor(Math.random() * 15) + 85
      },
      trends: {
        scoreChange: (Math.random() * 10 - 3).toFixed(1), // -3 to +7
        deliveryImprovement: (Math.random() * 8 - 2).toFixed(1),
        qualityImprovement: (Math.random() * 6 - 1).toFixed(1)
      },
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  };

  // Add performance data to suppliers
  const suppliersWithPerformance = useMemo(() => {
    return suppliers.map(supplier => ({
      ...supplier,
      performance: generatePerformanceData(supplier)
    }));
  }, [suppliers]);

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliersWithPerformance.filter(supplier => {
      const matchesSearch = 
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;

      const matchesScore = scoreFilter === 'all' || 
        (scoreFilter === 'excellent' && supplier.performance.overallScore >= 90) ||
        (scoreFilter === 'good' && supplier.performance.overallScore >= 80 && supplier.performance.overallScore < 90) ||
        (scoreFilter === 'fair' && supplier.performance.overallScore >= 70 && supplier.performance.overallScore < 80) ||
        (scoreFilter === 'poor' && supplier.performance.overallScore < 70);

      return matchesSearch && matchesCategory && matchesStatus && matchesScore;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy.includes('.')) {
        // Handle nested properties like 'financial.totalSpend'
        const keys = sortBy.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      } else if (sortBy === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else {
        aValue = a.performance?.[sortBy];
        bValue = b.performance?.[sortBy];
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [suppliersWithPerformance, searchTerm, categoryFilter, scoreFilter, statusFilter, sortBy, sortOrder]);

  // Performance statistics
  const performanceStats = useMemo(() => {
    const scores = suppliersWithPerformance.map(s => s.performance.overallScore);
    const totalSpend = suppliersWithPerformance.reduce((sum, s) => sum + s.performance.financial.totalSpend, 0);
    
    return {
      averageScore: scores.length ? (scores.reduce((a, b) => a + b) / scores.length).toFixed(1) : 0,
      topPerformers: suppliersWithPerformance.filter(s => s.performance.overallScore >= 90).length,
      needsImprovement: suppliersWithPerformance.filter(s => s.performance.overallScore < 70).length,
      totalSuppliers: suppliersWithPerformance.length,
      totalSpend: totalSpend
    };
  }, [suppliersWithPerformance]);

  // Handlers
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  };

  const getScoreBadge = (score) => {
    const colorClass = getScoreColor(score);
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Needs Improvement'
    };
    
    return (
      <span className={`score-badge ${colorClass}`}>
        {labels[colorClass]}
      </span>
    );
  };

  const getTrendIcon = (change) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '➡️';
  };

  const getTrendColor = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const renderScoreCircle = (score, size = 'medium') => {
    const colorClass = getScoreColor(score);
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className={`score-circle ${size} ${colorClass}`}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy="0.3em"
            fontSize="20"
            fontWeight="600"
            fill="currentColor"
          >
            {score}
          </text>
        </svg>
      </div>
    );
  };

  const renderPerformanceCard = (supplier) => {
    const perf = supplier.performance;
    
    return (
      <div key={supplier.id} className="performance-card">
        <div className="card-header">
          <div className="supplier-info">
            <div className="supplier-avatar">
              {supplier.name?.charAt(0).toUpperCase()}
            </div>
            <div className="supplier-details">
              <h3 className="supplier-name">{supplier.name}</h3>
              <p className="company-name">{supplier.companyName}</p>
              <span className="category-badge">{supplier.category}</span>
            </div>
          </div>
          <div className="overall-score">
            {renderScoreCircle(perf.overallScore, 'small')}
            <div className="score-trend">
              <span className={`trend ${getTrendColor(perf.trends.scoreChange)}`}>
                {getTrendIcon(perf.trends.scoreChange)} {Math.abs(perf.trends.scoreChange)}%
              </span>
            </div>
          </div>
        </div>

        <div className="performance-metrics">
          <div className="metric-row">
            <div className="metric">
              <span className="metric-label">Delivery</span>
              <div className="metric-bar">
                <div 
                  className={`metric-fill ${getScoreColor(perf.delivery.score)}`}
                  style={{ width: `${perf.delivery.score}%` }}
                ></div>
              </div>
              <span className="metric-value">{perf.delivery.score}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Quality</span>
              <div className="metric-bar">
                <div 
                  className={`metric-fill ${getScoreColor(perf.quality.score)}`}
                  style={{ width: `${perf.quality.score}%` }}
                ></div>
              </div>
              <span className="metric-value">{perf.quality.score}</span>
            </div>
          </div>
          <div className="metric-row">
            <div className="metric">
              <span className="metric-label">Responsiveness</span>
              <div className="metric-bar">
                <div 
                  className={`metric-fill ${getScoreColor(perf.responsiveness.score)}`}
                  style={{ width: `${perf.responsiveness.score}%` }}
                ></div>
              </div>
              <span className="metric-value">{perf.responsiveness.score}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Cost</span>
              <div className="metric-bar">
                <div 
                  className={`metric-fill ${getScoreColor(perf.cost.score)}`}
                  style={{ width: `${perf.cost.score}%` }}
                ></div>
              </div>
              <span className="metric-value">{perf.cost.score}</span>
            </div>
          </div>
        </div>

        <div className="financial-stats">
          <div className="financial-item">
            <span className="financial-label">Total Spend</span>
            <span className="financial-value">
              {formatCurrency(perf.financial.totalSpend)}
            </span>
          </div>
          <div className="financial-item">
            <span className="financial-label">Total Orders</span>
            <span className="financial-value">{perf.financial.totalOrders}</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="performance-badge">
            {getScoreBadge(perf.overallScore)}
          </div>
          <div className="card-actions">
            <button 
              onClick={() => handleViewDetails(supplier)}
              className="btn-outline"
            >
              View Details
            </button>
            <Link 
              to={`/suppliers/${supplier.id}`}
              className="btn-secondary"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTable = () => {
    return (
      <div className="performance-table-container">
        <table className="performance-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Supplier {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('overallScore')} className="sortable">
                Overall Score {sortBy === 'overallScore' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Delivery</th>
              <th>Quality</th>
              <th>Responsiveness</th>
              <th>Cost</th>
              <th onClick={() => handleSort('financial.totalSpend')} className="sortable">
                Total Spend {sortBy === 'financial.totalSpend' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Trend</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => {
              const perf = supplier.performance;
              return (
                <tr key={supplier.id}>
                  <td className="supplier-info">
                    <div className="supplier-main">
                      <div className="supplier-avatar small">
                        {supplier.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="supplier-name">{supplier.name}</div>
                        <div className="company-name">{supplier.companyName}</div>
                        <div className="category">{supplier.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="overall-score">
                    <div className="score-display">
                      {renderScoreCircle(perf.overallScore, 'tiny')}
                      <span className="score-value">{perf.overallScore}</span>
                    </div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-score">{perf.delivery.score}</div>
                    <div className="metric-detail">
                      {perf.delivery.onTimeRate}% on time
                    </div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-score">{perf.quality.score}</div>
                    <div className="metric-detail">
                      {perf.quality.defectRate}% defects
                    </div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-score">{perf.responsiveness.score}</div>
                    <div className="metric-detail">
                      {perf.responsiveness.avgResponseTime}h avg
                    </div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-score">{perf.cost.score}</div>
                    <div className="metric-detail">
                      {perf.cost.priceCompetitiveness}% competitive
                    </div>
                  </td>
                  <td className="financial-cell">
                    {formatCurrency(perf.financial.totalSpend)}
                  </td>
                  <td className="trend-cell">
                    <span className={`trend ${getTrendColor(perf.trends.scoreChange)}`}>
                      {getTrendIcon(perf.trends.scoreChange)} {Math.abs(perf.trends.scoreChange)}%
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewDetails(supplier)}
                        className="btn-action view"
                      >
                        Details
                      </button>
                      <Link 
                        to={`/suppliers/${supplier.id}`}
                        className="btn-action profile"
                      >
                        Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="supplier-performance-loading">
        <LoadingSpinner size="large" />
        <p>Loading supplier performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supplier-performance-error">
        <div className="error-content">
          <h3>Error Loading Performance Data</h3>
          <p>{error}</p>
          <button onClick={refetch} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-performance">
      {/* Header */}
      <div className="performance-header">
        <div className="header-content">
          <h1>Supplier Performance</h1>
          <p>Track and analyze supplier performance metrics and scores</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="performance-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{performanceStats.averageScore}</h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{performanceStats.topPerformers}</h3>
              <p>Top Performers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{performanceStats.needsImprovement}</h3>
              <p>Need Improvement</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{formatCurrency(performanceStats.totalSpend)}</h3>
              <p>Total Spend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="performance-controls">
        <div className="controls-left">
          <SearchBar
            placeholder="Search suppliers..."
            onSearch={handleSearch}
            className="search-bar"
          />
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {supplierCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select 
            value={scoreFilter} 
            onChange={(e) => setScoreFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Scores</option>
            <option value="excellent">Excellent (90+)</option>
            <option value="good">Good (80-89)</option>
            <option value="fair">Fair (70-79)</option>
            <option value="poor">Needs Improvement (&lt;70)</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="last12months">Last 12 Months</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>

        <div className="controls-right">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="overallScore">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="financial.totalSpend">Sort by Spend</option>
            <option value="delivery.score">Sort by Delivery</option>
            <option value="quality.score">Sort by Quality</option>
          </select>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              ▦
            </button>
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Performance Content */}
      <div className="performance-content">
        {filteredSuppliers.length === 0 ? (
          <div className="no-suppliers">
            <div className="no-suppliers-content">
              <h3>No suppliers found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="performance-cards">
            {filteredSuppliers.map(renderPerformanceCard)}
          </div>
        ) : (
          renderPerformanceTable()
        )}
      </div>

      {/* Performance Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Supplier Performance Details"
        size="xlarge"
        actions={[
          {
            label: 'Close',
            onClick: () => setShowDetailModal(false),
            variant: 'secondary'
          },
          {
            label: 'View Full Profile',
            onClick: () => {
              navigate(`/suppliers/${selectedSupplier?.id}`);
              setShowDetailModal(false);
            },
            variant: 'primary'
          }
        ]}
      >
        {selectedSupplier && (
          <div className="performance-detail">
            <div className="detail-header">
              <div className="supplier-info">
                <div className="supplier-avatar large">
                  {selectedSupplier.name?.charAt(0).toUpperCase()}
                </div>
                <div className="supplier-titles">
                  <h2>{selectedSupplier.name}</h2>
                  <p>{selectedSupplier.companyName}</p>
                  <span className="category-badge">{selectedSupplier.category}</span>
                </div>
              </div>
              <div className="overall-performance">
                {renderScoreCircle(selectedSupplier.performance.overallScore, 'large')}
                <div className="performance-summary">
                  <h3>{selectedSupplier.performance.overallScore}</h3>
                  <p>Overall Score</p>
                  {getScoreBadge(selectedSupplier.performance.overallScore)}
                </div>
              </div>
            </div>

            <div className="detail-grid">
              {/* Delivery Performance */}
              <div className="detail-section">
                <h4>🚚 Delivery Performance</h4>
                <div className="metric-details">
                  <div className="metric-item">
                    <span className="metric-label">On-Time Delivery Rate</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.delivery.onTimeRate}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Total Deliveries</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.delivery.totalDeliveries}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Late Deliveries</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.delivery.lateDeliveries}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Performance */}
              <div className="detail-section">
                <h4>✅ Quality Performance</h4>
                <div className="metric-details">
                  <div className="metric-item">
                    <span className="metric-label">Defect Rate</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.quality.defectRate}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Return Rate</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.quality.returnRate}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Inspection Pass Rate</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.quality.inspectionPassRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Responsiveness */}
              <div className="detail-section">
                <h4>💬 Responsiveness</h4>
                <div className="metric-details">
                  <div className="metric-item">
                    <span className="metric-label">Avg Response Time</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.responsiveness.avgResponseTime} hours
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Quote Accuracy</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.responsiveness.quoteAccuracy}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Communication Rating</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.responsiveness.communicationRating}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Performance */}
              <div className="detail-section">
                <h4>💰 Cost Performance</h4>
                <div className="metric-details">
                  <div className="metric-item">
                    <span className="metric-label">Price Competitiveness</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.cost.priceCompetitiveness}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Cost Reduction</span>
                    <span className={`metric-value ${
                      selectedSupplier.performance.cost.costReduction > 0 ? 'positive' : 'negative'
                    }`}>
                      {selectedSupplier.performance.cost.costReduction > 0 ? '+' : ''}
                      {selectedSupplier.performance.cost.costReduction}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Invoice Accuracy</span>
                    <span className="metric-value">
                      {selectedSupplier.performance.cost.invoiceAccuracy}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="detail-section full-width">
                <h4>📊 Financial Summary</h4>
                <div className="financial-grid">
                  <div className="financial-item">
                    <span className="financial-label">Total Spend</span>
                    <span className="financial-value">
                      {formatCurrency(selectedSupplier.performance.financial.totalSpend)}
                    </span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Total Orders</span>
                    <span className="financial-value">
                      {selectedSupplier.performance.financial.totalOrders}
                    </span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Avg Order Value</span>
                    <span className="financial-value">
                      {formatCurrency(selectedSupplier.performance.financial.avgOrderValue)}
                    </span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Payment Compliance</span>
                    <span className="financial-value">
                      {selectedSupplier.performance.financial.paymentTermsCompliance}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="detail-section full-width">
                <h4>📈 Performance Trends</h4>
                <div className="trends-grid">
                  <div className="trend-item">
                    <span className="trend-label">Overall Score Change</span>
                    <span className={`trend-value ${getTrendColor(selectedSupplier.performance.trends.scoreChange)}`}>
                      {getTrendIcon(selectedSupplier.performance.trends.scoreChange)}
                      {Math.abs(selectedSupplier.performance.trends.scoreChange)}%
                    </span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Delivery Improvement</span>
                    <span className={`trend-value ${getTrendColor(selectedSupplier.performance.trends.deliveryImprovement)}`}>
                      {getTrendIcon(selectedSupplier.performance.trends.deliveryImprovement)}
                      {Math.abs(selectedSupplier.performance.trends.deliveryImprovement)}%
                    </span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Quality Improvement</span>
                    <span className={`trend-value ${getTrendColor(selectedSupplier.performance.trends.qualityImprovement)}`}>
                      {getTrendIcon(selectedSupplier.performance.trends.qualityImprovement)}
                      {Math.abs(selectedSupplier.performance.trends.qualityImprovement)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupplierPerformance;