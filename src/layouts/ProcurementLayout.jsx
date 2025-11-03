// src/layouts/ProcurementLayout.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import Header from '../components/common/Header/Header';
import Sidebar from '../components/common/Sidebar/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

// Procurement Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import SupplierDirectory from '../pages/Suppliers/SupplierDirectory/SupplierDirectory';
import SupplierDetail from '../pages/Suppliers/SupplierDetail/SupplierDetail';
import AddSupplier from '../pages/Suppliers/AddSupplier/AddSupplier';
import RFQManagement from '../pages/Procurement/RFQ/RFQ';
import RFQDetail from '../components/procurement/RFQManagement/RFQDetail';
import RFQForm from '../components/procurement/RFQManagement/RFQForm';
import PurchaseOrders from '../pages/Procurement/PurchaseOrders/PurchaseOrders';
import PurchaseOrderDetail from '../components/procurement/PurchaseOrderDetail/PurchaseOrderDetail';
import CreatePurchaseOrder from '../pages/Procurement/CreatePurchaseOrder/CreatePurchaseOrder';
import ViewPurchaseOrder from '../pages/Procurement/ViewPurchaseOrder/ViewPurchaseOrder';
import InventoryManagement from '../pages/Inventory/InventoryManagement/InventoryManagement';
import AddProduct from '../pages/Inventory/AddProduct/AddProduct';
import Categories from '../pages/Inventory/Categories/Categories';
import BiddingManagement from '../pages/Bidding/BidManagement/BidManagement';
import BidEvaluation from '../components/bidding/BidEvaluation/BidEvaluation';
import ProcurementReports from '../pages/Reports/ProcurementReports/ProcurementReports';
import AnalyticsDashboard from '../pages/Reports/AnalyticsDashboard/AnalyticsDashboard';
import RequisitionList from '../components/procurement/Requisition/RequisitionList';
import RequisitionForm from '../components/procurement/Requisition/RequisitionForm';

import './ProcurementLayout.css';

const ProcurementLayout = () => {
  const { user } = useAuth();
  const { organizationType, currentOrganization } = useOrganization();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Procurement-specific modules
  const procurementModules = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      path: '/procurement/dashboard', 
      icon: '📊',
      description: 'Overview and analytics'
    },
    { 
      id: 'requisitions', 
      name: 'Requisitions', 
      path: '/procurement/requisitions', 
      icon: '📝',
      description: 'Purchase requests'
    },
    { 
      id: 'rfqs', 
      name: 'RFQ Management', 
      path: '/procurement/rfqs', 
      icon: '📋',
      description: 'Request for Quotations'
    },
    { 
      id: 'bidding', 
      name: 'Bidding', 
      path: '/procurement/bidding', 
      icon: '🎯',
      description: 'Bid evaluation'
    },
    { 
      id: 'purchase-orders', 
      name: 'Purchase Orders', 
      path: '/procurement/purchase-orders', 
      icon: '📄',
      description: 'Order management'
    },
    { 
      id: 'suppliers', 
      name: 'Suppliers', 
      path: '/procurement/suppliers', 
      icon: '🏢',
      description: 'Supplier directory'
    },
    { 
      id: 'inventory', 
      name: 'Inventory', 
      path: '/procurement/inventory', 
      icon: '📦',
      description: 'Stock management'
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      path: '/procurement/reports', 
      icon: '📈',
      description: 'Analytics & insights'
    }
  ];

  // Check if user should be in procurement layout
  useEffect(() => {
    if (user && organizationType !== 'procurement' && user.role !== 'super_admin') {
      console.warn('User organization type mismatch:', { 
        userOrgType: organizationType, 
        required: 'procurement',
        userRole: user.role 
      });
    }
  }, [user, organizationType]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path) => {
    setLoading(true);
    // Simulate loading for route changes
    setTimeout(() => setLoading(false), 300);
  };

  if (loading) {
    return <LoadingSpinner message="Loading procurement portal..." />;
  }

  return (
    <div className="procurement-layout">
      {/* Header */}
      <Header 
        organizationType="procurement"
        organizationName={currentOrganization?.name || 'Procurement Organization'}
        user={user}
        onMenuToggle={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="layout-body">
        {/* Sidebar */}
        <Sidebar 
          modules={procurementModules}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          organizationType="procurement"
          onNavigation={handleNavigation}
        />
        
        {/* Main Content */}
        <main className={`layout-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="content-wrapper">
            {/* Breadcrumb or context header can go here */}
            <div className="page-context">
              <div className="context-info">
                <h1 className="page-title">
                  {getPageTitle(location.pathname)}
                </h1>
                <p className="page-description">
                  {getPageDescription(location.pathname)}
                </p>
              </div>
              <div className="context-actions">
                {/* Dynamic action buttons based on page */}
                {renderContextActions(location.pathname)}
              </div>
            </div>

            {/* Page Content */}
            <div className="page-content">
              <Routes>
                {/* Dashboard */}
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Requisitions */}
                <Route path="requisitions" element={<RequisitionList />} />
                <Route path="requisitions/create" element={<RequisitionForm />} />
                <Route path="requisitions/:id" element={<RequisitionForm />} />
                
                {/* RFQ Management */}
                <Route path="rfqs" element={<RFQManagement />} />
                <Route path="rfqs/create" element={<RFQForm />} />
                <Route path="rfqs/:id" element={<RFQDetail />} />
                <Route path="rfqs/:id/edit" element={<RFQForm />} />
                
                {/* Bidding */}
                <Route path="bidding" element={<BiddingManagement />} />
                <Route path="bidding/:rfqId/bids" element={<BidEvaluation />} />
                <Route path="bidding/:rfqId/bids/:bidId" element={<BidEvaluation />} />
                
                {/* Purchase Orders */}
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="purchase-orders/create" element={<CreatePurchaseOrder />} />
                <Route path="purchase-orders/:id" element={<ViewPurchaseOrder />} />
                <Route path="purchase-orders/:id/edit" element={<CreatePurchaseOrder />} />
                
                {/* Suppliers */}
                <Route path="suppliers" element={<SupplierDirectory />} />
                <Route path="suppliers/add" element={<AddSupplier />} />
                <Route path="suppliers/:id" element={<SupplierDetail />} />
                <Route path="suppliers/:id/edit" element={<AddSupplier />} />
                
                {/* Inventory */}
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="inventory/add" element={<AddProduct />} />
                <Route path="inventory/categories" element={<Categories />} />
                <Route path="inventory/:id" element={<AddProduct />} />
                
                {/* Reports */}
                <Route path="reports" element={<ProcurementReports />} />
                <Route path="reports/analytics" element={<AnalyticsDashboard />} />
                <Route path="reports/procurement" element={<ProcurementReports />} />
                
                {/* Default redirect */}
                <Route path="" element={<Dashboard />} />
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>

      {/* Global loading indicator */}
      {loading && (
        <div className="global-loading">
          <LoadingSpinner size="small" />
        </div>
      )}
    </div>
  );
};

// Helper function to get page title based on route
const getPageTitle = (pathname) => {
  const routes = {
    '/procurement/dashboard': 'Dashboard',
    '/procurement/requisitions': 'Purchase Requisitions',
    '/procurement/requisitions/create': 'Create Requisition',
    '/procurement/rfqs': 'RFQ Management',
    '/procurement/rfqs/create': 'Create RFQ',
    '/procurement/bidding': 'Bid Management',
    '/procurement/purchase-orders': 'Purchase Orders',
    '/procurement/purchase-orders/create': 'Create Purchase Order',
    '/procurement/suppliers': 'Supplier Directory',
    '/procurement/suppliers/add': 'Add Supplier',
    '/procurement/inventory': 'Inventory Management',
    '/procurement/inventory/add': 'Add Product',
    '/procurement/inventory/categories': 'Categories',
    '/procurement/reports': 'Reports & Analytics',
    '/procurement/reports/analytics': 'Analytics Dashboard',
    '/procurement/reports/procurement': 'Procurement Reports'
  };

  // Handle dynamic routes (like /suppliers/:id)
  if (pathname.match(/\/procurement\/suppliers\/[^/]+$/)) {
    return 'Supplier Details';
  }
  if (pathname.match(/\/procurement\/rfqs\/[^/]+$/)) {
    return 'RFQ Details';
  }
  if (pathname.match(/\/procurement\/purchase-orders\/[^/]+$/)) {
    return 'Purchase Order Details';
  }
  if (pathname.match(/\/procurement\/inventory\/[^/]+$/)) {
    return 'Product Details';
  }

  return routes[pathname] || 'Procurement Portal';
};

// Helper function to get page description
const getPageDescription = (pathname) => {
  const descriptions = {
    '/procurement/dashboard': 'Overview of your procurement activities and performance',
    '/procurement/requisitions': 'Manage and track purchase requisitions',
    '/procurement/requisitions/create': 'Create a new purchase requisition',
    '/procurement/rfqs': 'Create and manage Requests for Quotation',
    '/procurement/rfqs/create': 'Create a new RFQ to send to suppliers',
    '/procurement/bidding': 'Evaluate and manage supplier bids',
    '/procurement/purchase-orders': 'View and manage purchase orders',
    '/procurement/purchase-orders/create': 'Create a new purchase order',
    '/procurement/suppliers': 'Browse and manage your supplier network',
    '/procurement/suppliers/add': 'Add a new supplier to your directory',
    '/procurement/inventory': 'Manage your product inventory and stock levels',
    '/procurement/inventory/add': 'Add a new product to inventory',
    '/procurement/inventory/categories': 'Manage product categories',
    '/procurement/reports': 'Analytics and insights for procurement activities',
    '/procurement/reports/analytics': 'Detailed analytics and performance metrics',
    '/procurement/reports/procurement': 'Procurement-specific reports and analysis'
  };

  return descriptions[pathname] || 'Manage your procurement operations';
};

// Helper function to render context-specific actions
const renderContextActions = (pathname) => {
  const actions = {
    '/procurement/dashboard': (
      <>
        <button className="btn-primary">Quick RFQ</button>
        <button className="btn-secondary">Generate Report</button>
      </>
    ),
    '/procurement/requisitions': (
      <a href="/procurement/requisitions/create" className="btn-primary">
        Create Requisition
      </a>
    ),
    '/procurement/rfqs': (
      <a href="/procurement/rfqs/create" className="btn-primary">
        Create RFQ
      </a>
    ),
    '/procurement/suppliers': (
      <a href="/procurement/suppliers/add" className="btn-primary">
        Add Supplier
      </a>
    ),
    '/procurement/inventory': (
      <a href="/procurement/inventory/add" className="btn-primary">
        Add Product
      </a>
    ),
    '/procurement/purchase-orders': (
      <a href="/procurement/purchase-orders/create" className="btn-primary">
        Create PO
      </a>
    )
  };

  return actions[pathname] || null;
};

export default ProcurementLayout;