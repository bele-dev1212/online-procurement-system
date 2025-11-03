// src/components/suppliers/SupplierPerformanceScore/SupplierPerformanceScore.jsx
import React from 'react';
import './SupplierPerformanceScore.css';

const SupplierPerformanceScore = ({ score, maxScore = 100 }) => {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = (percent) => {
    if (percent >= 80) return 'excellent';
    if (percent >= 60) return 'good';
    if (percent >= 40) return 'fair';
    return 'poor';
  };

  return (
    <div className={`performance-score ${getScoreColor(percentage)}`}>
      <div className="score-value">{score}</div>
      <div className="score-bar">
        <div 
          className="score-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SupplierPerformanceScore;
