// src/pages/Dashboard/SupplierDashboard/SupplierDashboard.jsx
import React from 'react';

const SupplierDashboard = () => {
  return (
    <div className="supplier-dashboard">
      <h1>Supplier Dashboard</h1>
      <p>Welcome to the Supplier Management Dashboard</p>
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Suppliers</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Active Suppliers</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Pending Approvals</h3>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
