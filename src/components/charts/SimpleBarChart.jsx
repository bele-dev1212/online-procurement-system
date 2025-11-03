// src/components/charts/SimpleBarChart.jsx
import React from 'react';
import './SimpleBarChart.css';

const SimpleBarChart = ({ data, timeRange, title, type = 'default' }) => {
  if (!data || !data.length) {
    return (
      <div className="chart-placeholder">
        <div className="placeholder-icon">📊</div>
        <h4>No Data Available</h4>
        <p>Chart data will appear here when available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value || item.amount || 0));
  
  return (
    <div className={`simple-bar-chart ${type}`}>
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="bar-container">
            <div 
              className="bar"
              style={{ height: `${((item.value || item.amount || 0) / maxValue) * 100}%` }}
              title={`${item.label || item.period}: ${item.value || item.amount}`}
            ></div>
            <span className="bar-label">{item.label || item.period}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span>{title} ({timeRange})</span>
      </div>
    </div>
  );
};

export default SimpleBarChart;
