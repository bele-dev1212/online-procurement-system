// src/components/common/DatePicker/DatePicker.jsx
import React from 'react';
import './DatePicker.css';

const DatePicker = ({ value, onChange, label, ...props }) => {
  return (
    <div className="date-picker">
      {label && <label className="date-picker-label">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="date-picker-input"
        {...props}
      />
    </div>
  );
};

export default DatePicker;
