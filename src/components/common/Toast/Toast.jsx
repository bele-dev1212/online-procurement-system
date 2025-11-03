// src/components/common/Toast/Toast.jsx
import React from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, show = false }) => {
  if (!show) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {onClose && (
          <button className="toast-close" onClick={onClose}>×</button>
        )}
      </div>
    </div>
  );
};

export default Toast;