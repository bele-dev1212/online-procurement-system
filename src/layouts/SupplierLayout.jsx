// src/layouts/SupplierLayout.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import Sidebar from '../components/common/Sidebar/Sidebar';
import SupplierDashboard from '../pages/Suppliers/SupplierDashboard/SupplierDashboard';
import ProductCatalog from '../pages/Suppliers/ProductCatalog/ProductCatalog';
import RFQOpportunities from '../pages/Suppliers/RFQOpportunities/RFQOpportunities';
import BidManagement from '../pages/Suppliers/BidManagement/BidManagement';
import OrderFulfillment from '../pages/Suppliers/OrderFulfillment/OrderFulfillment';
import SupplierPerformance from '../pages/Suppliers/SupplierPerformance/SupplierPerformance';
import SupplierProfile from '../pages/Suppliers/SupplierProfile/SupplierProfile';
import './SupplierLayout.css';

const SupplierLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const supplierModules = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      path: '/supplier/dashboard', 
      icon: '📊',
      description: 'Business overview and analytics'
    },
    { 
      id: 'catalog', 
      name: 'Product Catalog', 
      path: '/supplier/catalog', 
      icon: '📚',
      description: 'Manage your products and services'
    },
    { 
      id: 'rfq-opportunities', 
      name: 'RFQ Opportunities', 
      path: '/supplier/rfq-opportunities', 
      icon: '🎯',
      description: 'Browse and bid on RFQs'
    },
    { 
      id: 'bids', 
      name: 'My Bids', 
      path: '/supplier/bids', 
      icon: '💼',
      description: 'Manage your submitted bids'
    },
    { 
      id: 'orders', 
      name: 'Orders', 
      path: '/supplier/orders', 
      icon: '📦',
      description: 'View and fulfill purchase orders'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      path: '/supplier/performance', 
      icon: '📈',
      description: 'Supplier ratings and analytics'
    },
    { 
      id: 'profile', 
      name: 'Profile', 
      path: '/supplier/profile', 
      icon: '👤',
      description: 'Company profile and settings'
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="supplier-layout">
      <Header 
        organizationType="supplier"
        onMenuToggle={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="layout-body">
        <Sidebar 
          modules={supplierModules}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          organizationType="supplier"
        />
        
        <main className={`layout-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="content-wrapper">
            <Routes>
              {/* Supplier-specific routes */}
              <Route path="dashboard" element={<SupplierDashboard />} />
              <Route path="catalog/*" element={<ProductCatalog />} />
              <Route path="rfq-opportunities/*" element={<RFQOpportunities />} />
              <Route path="bids/*" element={<BidManagement />} />
              <Route path="orders/*" element={<OrderFulfillment />} />
              <Route path="performance/*" element={<SupplierPerformance />} />
              <Route path="profile/*" element={<SupplierProfile />} />
              
              {/* Default redirect */}
              <Route path="" element={<SupplierDashboard />} />
              <Route path="/" element={<SupplierDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;