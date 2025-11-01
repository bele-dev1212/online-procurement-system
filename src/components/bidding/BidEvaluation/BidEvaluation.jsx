

import React, { useState, useEffect } from 'react';
import './BidEvaluation.css';

const BidEvaluation = ({ bidId, onEvaluationComplete }) => {
  const [evaluation, setEvaluation] = useState({
    bidId: '',
    evaluator: '',
    evaluationDate: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    scores: {
      technical: 0,
      commercial: 0,
      financial: 0,
      compliance: 0,
      experience: 0
    },
    weightedScores: {
      technical: 0,
      commercial: 0,
      financial: 0,
      compliance: 0,
      experience: 0
    },
    criteria: {
      technical: {
        weight: 30,
        comments: '',
        subCriteria: {
          quality: { score: 0, max: 10, comment: '' },
          specifications: { score: 0, max: 10, comment: '' },
          methodology: { score: 0, max: 10, comment: '' }
        }
      },
      commercial: {
        weight: 25,
        comments: '',
        subCriteria: {
          price: { score: 0, max: 10, comment: '' },
          payment_terms: { score: 0, max: 8, comment: '' },
          delivery: { score: 0, max: 7, comment: '' }
        }
      },
      financial: {
        weight: 20,
        comments: '',
        subCriteria: {
          stability: { score: 0, max: 10, comment: '' },
          references: { score: 0, max: 6, comment: '' },
          insurance: { score: 0, max: 4, comment: '' }
        }
      },
      compliance: {
        weight: 15,
        comments: '',
        subCriteria: {
          documentation: { score: 0, max: 8, comment: '' },
          regulations: { score: 0, max: 7, comment: '' }
        }
      },
      experience: {
        weight: 10,
        comments: '',
        subCriteria: {
          past_performance: { score: 0, max: 6, comment: '' },
          similar_projects: { score: 0, max: 4, comment: '' }
        }
      }
    },
    overallScore: 0,
    recommendation: '',
    justification: '',
    riskAssessment: 'low',
    strengths: [],
    weaknesses: [],
    improvements: []
  });

  const [bid, setBid] = useState(null);
  const [comparisonBids, setComparisonBids] = useState([]);
  const [activeTab, setActiveTab] = useState('scoring');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mock data - replace with actual API calls
  const mockBid = {
    id: 'BID-2024-001',
    rfqNumber: 'RFQ-2024-015',
    rfqTitle: 'Laptop Procurement Q1 2024',
    supplier: {
      id: 'SUPP-001',
      name: 'TechCorp Inc.',
      rating: 4.8,
      category: 'Electronics',
      yearsInBusiness: 12,
      financialRating: 'A+'
    },
    amount: 125000,
    currency: 'USD',
    submissionDate: '2024-01-15',
    validityDate: '2024-02-15',
    status: 'under_review',
    items: [
      {
        name: 'Dell XPS 13',
        quantity: 50,
        unitPrice: 1200,
        total: 60000,
        specifications: 'Intel i7, 16GB RAM, 512GB SSD'
      },
      {
        name: 'Dell XPS 15',
        quantity: 25,
        unitPrice: 1800,
        total: 45000,
        specifications: 'Intel i9, 32GB RAM, 1TB SSD'
      },
      {
        name: 'Extended Warranty',
        quantity: 75,
        unitPrice: 200,
        total: 15000,
        specifications: '3-year on-site support'
      }
    ],
    documents: [
      { name: 'Technical_Specifications.pdf', type: 'technical' },
      { name: 'Commercial_Offer.pdf', type: 'commercial' },
      { name: 'Company_Profile.pdf', type: 'company' },
      { name: 'Financial_Statements.pdf', type: 'financial' }
    ],
    notes: 'Includes extended warranty and on-site support. Bulk discount applied.'
  };

  const mockComparisonBids = [
    {
      id: 'BID-2024-003',
      supplier: { name: 'CompuGlobal Ltd', rating: 4.2 },
      amount: 118500,
      overallScore: 85,
      status: 'submitted'
    },
    {
      id: 'BID-2024-007',
      supplier: { name: 'IT Solutions Co', rating: 4.5 },
      amount: 127800,
      overallScore: 88,
      status: 'submitted'
    }
  ];

  useEffect(() => {
    loadBidData();
  }, [bidId, loadBidData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadBidData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      // const bidResponse = await biddingAPI.getBid(bidId);
      // const comparisonResponse = await biddingAPI.getComparisonBids(bidId);
      
      setTimeout(() => {
        setBid(mockBid);
        setComparisonBids(mockComparisonBids);
        setEvaluation(prev => ({
          ...prev,
          bidId: bidId || mockBid.id
        }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading bid data:', error);
      setLoading(false);
    }
  };

  const calculateCategoryScore = (category) => {
    const subScores = Object.values(evaluation.criteria[category].subCriteria);
    const totalMax = subScores.reduce((sum, sub) => sum + sub.max, 0);
    const totalScore = subScores.reduce((sum, sub) => sum + sub.score, 0);
    return totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
  };

  const calculateWeightedScore = (category) => {
    const score = calculateCategoryScore(category);
    const weight = evaluation.criteria[category].weight;
    return (score * weight) / 100;
  };

  const calculateOverallScore = () => {
    const totalWeightedScore = Object.keys(evaluation.criteria).reduce((sum, category) => {
      return sum + calculateWeightedScore(category);
    }, 0);
    
    return Math.round(totalWeightedScore * 100) / 100;
  };

  const updateSubCriteriaScore = (category, subCriteria, score) => {
    const maxScore = evaluation.criteria[category].subCriteria[subCriteria].max;
    const normalizedScore = Math.min(Math.max(score, 0), maxScore);

    setEvaluation(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [category]: {
          ...prev.criteria[category],
          subCriteria: {
            ...prev.criteria[category].subCriteria,
            [subCriteria]: {
              ...prev.criteria[category].subCriteria[subCriteria],
              score: normalizedScore
            }
          }
        }
      }
    }));
  };

  const updateSubCriteriaComment = (category, subCriteria, comment) => {
    setEvaluation(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [category]: {
          ...prev.criteria[category],
          subCriteria: {
            ...prev.criteria[category].subCriteria,
            [subCriteria]: {
              ...prev.criteria[category].subCriteria[subCriteria],
              comment: comment
            }
          }
        }
      }
    }));
  };

  const updateCategoryComment = (category, comment) => {
    setEvaluation(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [category]: {
          ...prev.criteria[category],
          comments: comment
        }
      }
    }));
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getOverallRating = (score) => {
    if (score >= 90) return { label: 'Excellent', color: '#10b981', icon: '🏆' };
    if (score >= 80) return { label: 'Very Good', color: '#22c55e', icon: '⭐' };
    if (score >= 70) return { label: 'Good', color: '#f59e0b', icon: '👍' };
    if (score >= 60) return { label: 'Fair', color: '#f97316', icon: '⚠️' };
    return { label: 'Poor', color: '#ef4444', icon: '❌' };
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Low', color: '#10b981', description: 'Minimal risk' };
    if (score >= 70) return { level: 'Medium-Low', color: '#22c55e', description: 'Acceptable risk' };
    if (score >= 60) return { level: 'Medium', color: '#f59e0b', description: 'Moderate risk' };
    if (score >= 50) return { level: 'High', color: '#f97316', description: 'Significant risk' };
    return { level: 'Very High', color: '#ef4444', description: 'Unacceptable risk' };
  };

  const addStrength = () => {
    setEvaluation(prev => ({
      ...prev,
      strengths: [...prev.strengths, '']
    }));
  };

  const updateStrength = (index, value) => {
    const updatedStrengths = [...evaluation.strengths];
    updatedStrengths[index] = value;
    setEvaluation(prev => ({
      ...prev,
      strengths: updatedStrengths
    }));
  };

  const removeStrength = (index) => {
    const updatedStrengths = evaluation.strengths.filter((_, i) => i !== index);
    setEvaluation(prev => ({
      ...prev,
      strengths: updatedStrengths
    }));
  };

  const addWeakness = () => {
    setEvaluation(prev => ({
      ...prev,
      weaknesses: [...prev.weaknesses, '']
    }));
  };

  const updateWeakness = (index, value) => {
    const updatedWeaknesses = [...evaluation.weaknesses];
    updatedWeaknesses[index] = value;
    setEvaluation(prev => ({
      ...prev,
      weaknesses: updatedWeaknesses
    }));
  };

  const removeWeakness = (index) => {
    const updatedWeaknesses = evaluation.weaknesses.filter((_, i) => i !== index);
    setEvaluation(prev => ({
      ...prev,
      weaknesses: updatedWeaknesses
    }));
  };

  const addImprovement = () => {
    setEvaluation(prev => ({
      ...prev,
      improvements: [...prev.improvements, '']
    }));
  };

  const updateImprovement = (index, value) => {
    const updatedImprovements = [...evaluation.improvements];
    updatedImprovements[index] = value;
    setEvaluation(prev => ({
      ...prev,
      improvements: updatedImprovements
    }));
  };

  const removeImprovement = (index) => {
    const updatedImprovements = evaluation.improvements.filter((_, i) => i !== index);
    setEvaluation(prev => ({
      ...prev,
      improvements: updatedImprovements
    }));
  };

  const handleSaveEvaluation = async (status = 'in_progress') => {
    setSaving(true);
    try {
      const evaluationData = {
        ...evaluation,
        status,
        overallScore: calculateOverallScore(),
        lastUpdated: new Date().toISOString()
      };

      // Calculate weighted scores
      Object.keys(evaluationData.criteria).forEach(category => {
        evaluationData.weightedScores[category] = calculateWeightedScore(category);
      });

      // In real implementation:
      // await biddingAPI.saveEvaluation(evaluationData);

      console.log('Evaluation saved:', evaluationData);
      
      setTimeout(() => {
        setSaving(false);
        if (status === 'completed' && onEvaluationComplete) {
          onEvaluationComplete(evaluationData);
        }
        alert(`Evaluation ${status === 'completed' ? 'completed' : 'saved'} successfully!`);
      }, 1000);

    } catch (error) {
      console.error('Error saving evaluation:', error);
      setSaving(false);
      alert('Error saving evaluation. Please try again.');
    }
  };

  const generateReport = () => {
    const reportData = {
      bid: bid,
      evaluation: evaluation,
      overallScore: calculateOverallScore(),
      rating: getOverallRating(calculateOverallScore()),
      risk: getRiskLevel(calculateOverallScore()),
      generatedAt: new Date().toLocaleString()
    };

    console.log('Report generated:', reportData);
    alert('Evaluation report generated! Check console for details.');
    
    // In real implementation, this would generate a PDF or open a print dialog
  };

  const overallScore = calculateOverallScore();
  const overallRating = getOverallRating(overallScore);
  const riskAssessment = getRiskLevel(overallScore);

  if (loading) {
    return (
      <div className="bid-evaluation-loading">
        <div className="loading-spinner"></div>
        <p>Loading bid evaluation data...</p>
      </div>
    );
  }

  return (
    <div className="bid-evaluation">
      {/* Header */}
      <div className="evaluation-header">
        <div className="header-content">
          <h1>Bid Evaluation</h1>
          <div className="bid-info">
            <div className="bid-main">
              <span className="bid-id">{bid.id}</span>
              <span className="bid-title">{bid.rfqTitle}</span>
            </div>
            <div className="supplier-info">
              <strong>{bid.supplier.name}</strong>
              <span>⭐ {bid.supplier.rating} • {bid.supplier.financialRating} Rating</span>
            </div>
            <div className="bid-amount">
              ${bid.amount.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={generateReport}
          >
            📊 Generate Report
          </button>
          <button 
            className="btn-primary"
            onClick={() => handleSaveEvaluation('completed')}
            disabled={saving}
          >
            {saving ? 'Saving...' : '✅ Complete Evaluation'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="evaluation-tabs">
        <button 
          className={`tab-btn ${activeTab === 'scoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('scoring')}
        >
          📝 Scoring Matrix
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          ⚖️ Bid Comparison
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          🔍 Detailed Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📋 Evaluation Summary
        </button>
      </div>

      <div className="evaluation-content">
        {/* Scoring Matrix Tab */}
        {activeTab === 'scoring' && (
          <div className="tab-content">
            <div className="scoring-matrix">
              {Object.entries(evaluation.criteria).map(([category, data]) => {
                const categoryScore = calculateCategoryScore(category);
                const weightedScore = calculateWeightedScore(category);
                
                return (
                  <div key={category} className="criteria-card">
                    <div className="criteria-header">
                      <h3>{category.charAt(0).toUpperCase() + category.slice(1)} Evaluation</h3>
                      <div className="criteria-weight">
                        Weight: {data.weight}%
                      </div>
                    </div>
                    
                    <div className="criteria-scores">
                      <div className="score-summary">
                        <div className="score-item">
                          <label>Category Score:</label>
                          <span 
                            className="score-value"
                            style={{ color: getScoreColor(categoryScore, 100) }}
                          >
                            {categoryScore.toFixed(1)}%
                          </span>
                        </div>
                        <div className="score-item">
                          <label>Weighted Score:</label>
                          <span className="score-value">{weightedScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="sub-criteria">
                      {Object.entries(data.subCriteria).map(([subKey, subData]) => (
                        <div key={subKey} className="sub-criteria-item">
                          <div className="sub-criteria-info">
                            <label className="sub-criteria-label">
                              {subKey.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </label>
                            <span className="max-score">Max: {subData.max}</span>
                          </div>
                          
                          <div className="sub-criteria-controls">
                            <input
                              type="number"
                              min="0"
                              max={subData.max}
                              value={subData.score}
                              onChange={(e) => updateSubCriteriaScore(category, subKey, parseInt(e.target.value) || 0)}
                              className="score-input"
                              style={{ 
                                borderColor: getScoreColor(subData.score, subData.max) 
                              }}
                            />
                            <textarea
                              placeholder="Add comments..."
                              value={subData.comment}
                              onChange={(e) => updateSubCriteriaComment(category, subKey, e.target.value)}
                              className="comment-input"
                              rows="2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="category-comment">
                      <label>Overall {category} Comments:</label>
                      <textarea
                        value={data.comments}
                        onChange={(e) => updateCategoryComment(category, e.target.value)}
                        placeholder={`Enter overall comments for ${category} evaluation...`}
                        rows="3"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="scoring-summary">
              <div className="overall-score-card">
                <h3>Overall Evaluation Score</h3>
                <div 
                  className="score-circle"
                  style={{ 
                    '--score-color': overallRating.color,
                    '--score-percentage': `${overallScore}%`
                  }}
                >
                  <div className="score-number">{overallScore.toFixed(1)}</div>
                  <div className="score-label">/ 100</div>
                </div>
                <div className="rating-info">
                  <span className="rating-icon">{overallRating.icon}</span>
                  <span 
                    className="rating-label"
                    style={{ color: overallRating.color }}
                  >
                    {overallRating.label}
                  </span>
                </div>
                <div className="risk-assessment">
                  <strong>Risk Level:</strong>
                  <span 
                    className="risk-level"
                    style={{ color: riskAssessment.color }}
                  >
                    {riskAssessment.level}
                  </span>
                  <small>{riskAssessment.description}</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bid Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="tab-content">
            <div className="comparison-header">
              <h2>Bid Comparison</h2>
              <p>Compare this bid with other submitted bids for the same RFQ</p>
            </div>

            <div className="comparison-grid">
              <div className="comparison-card current-bid">
                <div className="card-header">
                  <h3>Current Bid</h3>
                  <div className="bid-status">Under Evaluation</div>
                </div>
                <div className="bid-details">
                  <div className="detail-item">
                    <label>Supplier:</label>
                    <span>{bid.supplier.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Amount:</label>
                    <span className="amount">${bid.amount.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Rating:</label>
                    <span>⭐ {bid.supplier.rating}</span>
                  </div>
                  <div className="detail-item">
                    <label>Financial Rating:</label>
                    <span>{bid.supplier.financialRating}</span>
                  </div>
                </div>
                <div className="score-display">
                  <div className="current-score">
                    <strong>Evaluation Score:</strong>
                    <span 
                      className="score-value"
                      style={{ color: overallRating.color }}
                    >
                      {overallScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {comparisonBids.map(comparisonBid => (
                <div key={comparisonBid.id} className="comparison-card">
                  <div className="card-header">
                    <h3>{comparisonBid.supplier.name}</h3>
                    <div className={`bid-status ${comparisonBid.status}`}>
                      {comparisonBid.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="bid-details">
                    <div className="detail-item">
                      <label>Amount:</label>
                      <span className="amount">${comparisonBid.amount.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <label>Rating:</label>
                      <span>⭐ {comparisonBid.supplier.rating}</span>
                    </div>
                    <div className="detail-item">
                      <label>Score:</label>
                      <span className="score-value">{comparisonBid.overallScore}</span>
                    </div>
                    <div className="detail-item">
                      <label>Price Difference:</label>
                      <span 
                        className={
                          comparisonBid.amount < bid.amount ? 'positive' : 'negative'
                        }
                      >
                        {comparisonBid.amount < bid.amount ? '▼' : '▲'} 
                        ${Math.abs(comparisonBid.amount - bid.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="comparison-chart">
              <h3>Score Comparison</h3>
              <div className="chart-bars">
                <div className="chart-bar current">
                  <div 
                    className="bar-fill"
                    style={{ height: `${overallScore}%` }}
                  ></div>
                  <div className="bar-label">
                    <span>Current</span>
                    <strong>{overallScore}</strong>
                  </div>
                </div>
                {comparisonBids.map((bid, index) => (
                  <div key={bid.id} className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${bid.overallScore}%` }}
                    ></div>
                    <div className="bar-label">
                      <span>Bid {index + 1}</span>
                      <strong>{bid.overallScore}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="tab-content">
            <div className="analysis-grid">
              <div className="analysis-section">
                <h3>Strengths</h3>
                <div className="items-list">
                  {evaluation.strengths.map((strength, index) => (
                    <div key={index} className="list-item">
                      <textarea
                        value={strength}
                        onChange={(e) => updateStrength(index, e.target.value)}
                        placeholder="Describe a strength..."
                        rows="2"
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeStrength(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-add"
                    onClick={addStrength}
                  >
                    + Add Strength
                  </button>
                </div>
              </div>

              <div className="analysis-section">
                <h3>Weaknesses</h3>
                <div className="items-list">
                  {evaluation.weaknesses.map((weakness, index) => (
                    <div key={index} className="list-item">
                      <textarea
                        value={weakness}
                        onChange={(e) => updateWeakness(index, e.target.value)}
                        placeholder="Describe a weakness..."
                        rows="2"
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeWeakness(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-add"
                    onClick={addWeakness}
                  >
                    + Add Weakness
                  </button>
                </div>
              </div>

              <div className="analysis-section">
                <h3>Improvement Areas</h3>
                <div className="items-list">
                  {evaluation.improvements.map((improvement, index) => (
                    <div key={index} className="list-item">
                      <textarea
                        value={improvement}
                        onChange={(e) => updateImprovement(index, e.target.value)}
                        placeholder="Suggest an improvement..."
                        rows="2"
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeImprovement(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-add"
                    onClick={addImprovement}
                  >
                    + Add Improvement
                  </button>
                </div>
              </div>

              <div className="analysis-section full-width">
                <h3>Final Recommendation</h3>
                <div className="recommendation-form">
                  <div className="form-group">
                    <label>Recommendation:</label>
                    <select
                      value={evaluation.recommendation}
                      onChange={(e) => setEvaluation(prev => ({
                        ...prev,
                        recommendation: e.target.value
                      }))}
                    >
                      <option value="">Select Recommendation</option>
                      <option value="award">Award Contract</option>
                      <option value="negotiate">Negotiate & Award</option>
                      <option value="clarify">Seek Clarification</option>
                      <option value="reject">Reject Bid</option>
                      <option value="reserve">Place on Reserve List</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Justification:</label>
                    <textarea
                      value={evaluation.justification}
                      onChange={(e) => setEvaluation(prev => ({
                        ...prev,
                        justification: e.target.value
                      }))}
                      placeholder="Provide detailed justification for your recommendation..."
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>Risk Assessment:</label>
                    <select
                      value={evaluation.riskAssessment}
                      onChange={(e) => setEvaluation(prev => ({
                        ...prev,
                        riskAssessment: e.target.value
                      }))}
                    >
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                      <option value="very_high">Very High Risk</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Summary Tab */}
        {activeTab === 'summary' && (
          <div className="tab-content">
            <div className="summary-header">
              <h2>Evaluation Summary</h2>
              <p>Complete overview of the bid evaluation</p>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <h3>Score Breakdown</h3>
                <div className="score-breakdown">
                  {Object.entries(evaluation.criteria).map(([category, data]) => {
                    const categoryScore = calculateCategoryScore(category);
                    const weightedScore = calculateWeightedScore(category);
                    
                    return (
                      <div key={category} className="breakdown-item">
                        <div className="breakdown-header">
                          <span className="category-name">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </span>
                          <span className="category-weight">{data.weight}%</span>
                        </div>
                        <div className="breakdown-scores">
                          <span className="category-score">{categoryScore.toFixed(1)}%</span>
                          <span className="weighted-score">{weightedScore.toFixed(1)}</span>
                        </div>
                        <div className="score-bar">
                          <div 
                            className="score-fill"
                            style={{ 
                              width: `${categoryScore}%`,
                              backgroundColor: getScoreColor(categoryScore, 100)
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="summary-card">
                <h3>Final Assessment</h3>
                <div className="assessment-details">
                  <div className="assessment-item">
                    <label>Overall Score:</label>
                    <span 
                      className="score-value"
                      style={{ color: overallRating.color }}
                    >
                      {overallScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="assessment-item">
                    <label>Rating:</label>
                    <span 
                      className="rating"
                      style={{ color: overallRating.color }}
                    >
                      {overallRating.icon} {overallRating.label}
                    </span>
                  </div>
                  <div className="assessment-item">
                    <label>Risk Level:</label>
                    <span 
                      className="risk-level"
                      style={{ color: riskAssessment.color }}
                    >
                      {riskAssessment.level}
                    </span>
                  </div>
                  <div className="assessment-item">
                    <label>Recommendation:</label>
                    <span className="recommendation">
                      {evaluation.recommendation ? 
                        evaluation.recommendation.charAt(0).toUpperCase() + 
                        evaluation.recommendation.slice(1).replace('_', ' ') 
                        : 'Not specified'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-card full-width">
                <h3>Evaluation Details</h3>
                <div className="evaluation-details">
                  <div className="detail-section">
                    <h4>Key Strengths</h4>
                    {evaluation.strengths.length > 0 ? (
                      <ul>
                        {evaluation.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No strengths identified</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Areas for Improvement</h4>
                    {evaluation.improvements.length > 0 ? (
                      <ul>
                        {evaluation.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No improvements suggested</p>
                    )}
                  </div>

                  {evaluation.justification && (
                    <div className="detail-section">
                      <h4>Justification</h4>
                      <p>{evaluation.justification}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="evaluation-actions">
        <button 
          className="btn-save-draft"
          onClick={() => handleSaveEvaluation('in_progress')}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Draft'}
        </button>
        
        <div className="evaluation-progress">
          <div className="progress-info">
            <strong>Evaluation Status:</strong>
            <span className={`status ${evaluation.status}`}>
              {evaluation.status.replace('_', ' ')}
            </span>
          </div>
          <div className="progress-info">
            <strong>Overall Score:</strong>
            <span>{overallScore.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidEvaluation;