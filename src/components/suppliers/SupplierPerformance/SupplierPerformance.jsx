import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useSupplierPerformance } from '../../../hooks/useSupplierPerformance';
import { useNotifications } from '../../../hooks/useNotifications';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import './SupplierPerformance.css';

const SupplierPerformance = () => {
  const { id } = useParams();
  const { getSupplier, loading: supplierLoading } = useSuppliers();
  const { 
    performanceData, 
    metrics, 
    kpis, 
    trends,
    loading, 
    error,
    addPerformanceReview  } = useSupplierPerformance(id);
  
  const { addNotification } = useNotifications();

  const [supplier, setSupplier] = useState(null);
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    category: 'quality',
    comments: '',
    strengths: '',
    improvements: '',
    reviewer: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    try {
      const data = await getSupplier(id);
      setSupplier(data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to load supplier', 'error');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      await addPerformanceReview(id, reviewData);
      addNotification('Performance review added successfully', 'success');
      setIsReviewModalOpen(false);
      setReviewData({
        rating: 0,
        category: 'quality',
        comments: '',
        strengths: '',
        improvements: '',
        reviewer: '',
        date: new Date().toISOString().split('T')[0]
      });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      addNotification('Failed to add performance review', 'error');
    }
  };

  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({ ...prev, rating: newRating }));
  };

  const getPerformanceClass = (score) => {
    if (score >= 90) return 'performance--excellent';
    if (score >= 80) return 'performance--good';
    if (score >= 70) return 'performance--average';
    if (score >= 60) return 'performance--poor';
    return 'performance--critical';
  };

  const getTrendDirection = (trend) => {
    if (trend > 0) return 'trend-up';
    if (trend < 0) return 'trend-down';
    return 'trend-neutral';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return 'icon-trending-up';
    if (trend < 0) return 'icon-trending-down';
    return 'icon-minus';
  };

  const renderMetricCard = (metric) => {
    const trend = metric.trend || 0;
    const trendClass = getTrendDirection(trend);
    const trendIcon = getTrendIcon(trend);

    return (
      <div key={metric.id} className="metric-card">
        <div className="metric-header">
          <h4>{metric.name}</h4>
          <span className={`metric-trend ${trendClass}`}>
            <i className={trendIcon}></i>
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
        <div className="metric-value">
          <span className={`score ${getPerformanceClass(metric.score)}`}>
            {metric.score}%
          </span>
        </div>
        <div className="metric-progress">
          <div 
            className={`progress-bar ${getPerformanceClass(metric.score)}`}
            style={{ width: `${metric.score}%` }}
          ></div>
        </div>
        <div className="metric-target">
          Target: {metric.target}%
        </div>
      </div>
    );
  };

  const renderKpiCard = (kpi) => {
    return (
      <div key={kpi.id} className="kpi-card">
        <div className="kpi-icon">
          <i className={kpi.icon}></i>
        </div>
        <div className="kpi-content">
          <div className="kpi-value">{kpi.value}</div>
          <div className="kpi-label">{kpi.label}</div>
          <div className="kpi-change">
            <span className={`change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
              <i className={kpi.change >= 0 ? 'icon-trending-up' : 'icon-trending-down'}></i>
              {Math.abs(kpi.change)}%
            </span>
            vs previous period
          </div>
        </div>
      </div>
    );
  };

  const renderTrendChart = () => {
    // Simple trend visualization - in a real app, this would be a proper chart
    return (
      <div className="trend-chart">
        <div className="chart-header">
          <h4>Performance Trend</h4>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="chart-filter"
          >
            <option value="1month">1 Month</option>
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
          </select>
        </div>
        <div className="chart-content">
          <div className="trend-bars">
            {trends.map((trend, index) => (
              <div key={index} className="trend-bar">
                <div 
                  className={`bar-fill ${getPerformanceClass(trend.value)}`}
                  style={{ height: `${trend.value}%` }}
                  title={`${trend.period}: ${trend.value}%`}
                ></div>
                <div className="bar-label">{trend.period}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStarRating = (rating, onRatingChange = null, interactive = false) => {
    return (
      <div className={`star-rating ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          interactive ? (
            <button
              key={star}
              type="button"
              className={`star ${star <= rating ? 'filled' : ''}`}
              onClick={() => onRatingChange(star)}
            >
              ★
            </button>
          ) : (
            <span
              key={star}
              className={`star ${star <= rating ? 'filled' : ''}`}
            >
              ★
            </span>
          )
        ))}
        <span className="rating-value">{rating}.0</span>
      </div>
    );
  };

  const calculateOverallScore = () => {
    if (!metrics.length) return 0;
    return metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length;
  };

  const getRiskLevel = (score) => {
    if (score >= 90) return { level: 'Low', color: '#28a745' };
    if (score >= 80) return { level: 'Medium', color: '#ffc107' };
    if (score >= 70) return { level: 'High', color: '#fd7e14' };
    return { level: 'Critical', color: '#dc3545' };
  };

  if (loading || supplierLoading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error loading performance data: {error}</div>;
  if (!supplier) return <div className="not-found">Supplier not found</div>;

  const overallScore = calculateOverallScore();
  const riskLevel = getRiskLevel(overallScore);

  return (
    <div className="supplier-performance">
      {/* Header */}
      <div className="performance-header">
        <div className="header-left">
          <Link to={`/suppliers/${id}`} className="btn btn--secondary">
            ← Back to Supplier
          </Link>
          <div className="header-title">
            <h1>Supplier Performance</h1>
            <div className="supplier-info">
              <span className="supplier-name">{supplier.name}</span>
              <span className="supplier-category">{supplier.category}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn--primary"
            onClick={() => setIsReviewModalOpen(true)}
          >
            <i className="icon-plus"></i>
            Add Review
          </button>
          <button className="btn btn--outline">
            <i className="icon-download"></i>
            Export Report
          </button>
        </div>
      </div>

      {/* Overall Performance Score */}
      <div className="overall-performance">
        <div className="score-card">
          <div className="score-circle">
            <div className={`circle-progress ${getPerformanceClass(overallScore)}`}>
              <span className="score-value">{overallScore.toFixed(1)}%</span>
            </div>
          </div>
          <div className="score-details">
            <h3>Overall Performance Score</h3>
            <div className="risk-level">
              <span 
                className="risk-badge"
                style={{ backgroundColor: riskLevel.color }}
              >
                {riskLevel.level} Risk
              </span>
            </div>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span className="label">Quality:</span>
                <span className="value">{metrics.find(m => m.id === 'quality')?.score || 0}%</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Delivery:</span>
                <span className="value">{metrics.find(m => m.id === 'delivery')?.score || 0}%</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Cost:</span>
                <span className="value">{metrics.find(m => m.id === 'cost')?.score || 0}%</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Service:</span>
                <span className="value">{metrics.find(m => m.id === 'service')?.score || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-section">
        <h2>Key Performance Indicators</h2>
        <div className="kpi-grid">
          {kpis.map(renderKpiCard)}
        </div>
      </div>

      <div className="performance-content">
        {/* Metrics Grid */}
        <div className="metrics-section">
          <div className="section-header">
            <h2>Performance Metrics</h2>
            <div className="metric-filters">
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="filter-select"
              >
                <option value="overall">All Metrics</option>
                <option value="quality">Quality</option>
                <option value="delivery">Delivery</option>
                <option value="cost">Cost</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
          <div className="metrics-grid">
            {metrics
              .filter(metric => selectedMetric === 'overall' || metric.id === selectedMetric)
              .map(renderMetricCard)
            }
          </div>
        </div>

        {/* Trend Chart */}
        <div className="trend-section">
          {renderTrendChart()}
        </div>
      </div>

      {/* Performance Reviews */}
      <div className="reviews-section">
        <div className="section-header">
          <h2>Performance Reviews</h2>
          <span className="reviews-count">{performanceData.reviews?.length || 0} reviews</span>
        </div>
        
        {performanceData.reviews && performanceData.reviews.length > 0 ? (
          <div className="reviews-list">
            {performanceData.reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.reviewer}</span>
                    <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <div className="review-rating">
                    {renderStarRating(review.rating)}
                    <span className="review-category">{review.category}</span>
                  </div>
                </div>
                <div className="review-content">
                  <p className="review-comments">{review.comments}</p>
                  {review.strengths && (
                    <div className="review-strengths">
                      <strong>Strengths:</strong> {review.strengths}
                    </div>
                  )}
                  {review.improvements && (
                    <div className="review-improvements">
                      <strong>Areas for Improvement:</strong> {review.improvements}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <i className="icon-file-text"></i>
            <h4>No Performance Reviews</h4>
            <p>No performance reviews have been added for this supplier yet.</p>
            <button 
              className="btn btn--primary"
              onClick={() => setIsReviewModalOpen(true)}
            >
              Add First Review
            </button>
          </div>
        )}
      </div>

      {/* Action Recommendations */}
      <div className="recommendations-section">
        <h2>Action Recommendations</h2>
        <div className="recommendations-grid">
          <div className="recommendation-card urgent">
            <div className="rec-header">
              <i className="icon-alert-triangle"></i>
              <h4>Urgent Actions</h4>
            </div>
            <ul>
              {overallScore < 70 && (
                <li>Schedule immediate performance review meeting</li>
              )}
              {metrics.find(m => m.id === 'quality')?.score < 75 && (
                <li>Implement additional quality control measures</li>
              )}
              {metrics.find(m => m.id === 'delivery')?.score < 75 && (
                <li>Review and optimize delivery processes</li>
              )}
            </ul>
          </div>
          
          <div className="recommendation-card improvement">
            <div className="rec-header">
              <i className="icon-trending-up"></i>
              <h4>Improvement Opportunities</h4>
            </div>
            <ul>
              {metrics.find(m => m.id === 'cost')?.score < 80 && (
                <li>Negotiate better pricing terms</li>
              )}
              {metrics.find(m => m.id === 'service')?.score < 80 && (
                <li>Enhance customer service training</li>
              )}
              <li>Establish quarterly performance review cycle</li>
            </ul>
          </div>
          
          <div className="recommendation-card positive">
            <div className="rec-header">
              <i className="icon-award"></i>
              <h4>Positive Highlights</h4>
            </div>
            <ul>
              {overallScore >= 85 && (
                <li>Consider for preferred supplier program</li>
              )}
              {metrics.find(m => m.id === 'quality')?.score >= 90 && (
                <li>Recognize for exceptional quality standards</li>
              )}
              <li>Maintain regular communication and feedback</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Add Performance Review"
        size="large"
      >
        <form onSubmit={handleAddReview} className="review-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="reviewer">Reviewer Name *</label>
              <input
                type="text"
                id="reviewer"
                value={reviewData.reviewer}
                onChange={(e) => setReviewData(prev => ({ ...prev, reviewer: e.target.value }))}
                placeholder="Enter reviewer name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Review Date *</label>
              <input
                type="date"
                id="date"
                value={reviewData.date}
                onChange={(e) => setReviewData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={reviewData.category}
                onChange={(e) => setReviewData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="quality">Quality</option>
                <option value="delivery">Delivery</option>
                <option value="cost">Cost</option>
                <option value="service">Service</option>
                <option value="overall">Overall</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rating *</label>
              <div className="rating-input">
                {renderStarRating(reviewData.rating, handleRatingChange, true)}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comments">Comments *</label>
            <textarea
              id="comments"
              value={reviewData.comments}
              onChange={(e) => setReviewData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Provide detailed comments about the performance..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="strengths">Strengths</label>
            <textarea
              id="strengths"
              value={reviewData.strengths}
              onChange={(e) => setReviewData(prev => ({ ...prev, strengths: e.target.value }))}
              placeholder="What are the supplier's key strengths?"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="improvements">Areas for Improvement</label>
            <textarea
              id="improvements"
              value={reviewData.improvements}
              onChange={(e) => setReviewData(prev => ({ ...prev, improvements: e.target.value }))}
              placeholder="What areas need improvement?"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
            >
              Add Review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplierPerformance;