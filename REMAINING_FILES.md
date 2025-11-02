# Remaining Files to Implement

## Overview
This document lists all the remaining files that need to be created or completed to make the system fully functional according to the specification.

---

## 🔴 CRITICAL - Backend API Route Handlers (Missing)

### Backend Files Location: `/backend/routes/` or in `server.js`

#### 1. Requisitions API Handlers
**Files Needed:**
- `backend/routes/requisitions.js` OR add to `server.js`
- Handlers:
  - `handleCreateRequisition`
  - `handleGetRequisitions`
  - `handleGetRequisition`
  - `handleUpdateRequisition`
  - `handleDeleteRequisition`
  - `handleSubmitRequisition`
  - `handleApproveRequisition`
  - `handleRejectRequisition`
  - `handleConvertToRFQ`

#### 2. RFQ API Handlers
**Files Needed:**
- `backend/routes/rfqs.js` OR add to `server.js`
- Handlers:
  - `handleCreateRFQ`
  - `handleGetRFQs`
  - `handleGetRFQ`
  - `handleUpdateRFQ`
  - `handlePublishRFQ`
  - `handleCloseRFQ`
  - `handleGetRFQBids`
  - `handleEvaluateBids`
  - `handleAwardRFQ`

#### 3. Bidding API Handlers
**Files Needed:**
- `backend/routes/bids.js` OR add to `server.js`
- Handlers:
  - `handleCreateBid`
  - `handleGetBids`
  - `handleGetBid`
  - `handleUpdateBid`

#### 4. Purchase Orders API Handlers (Partially exists in frontend)
**Files Needed:**
- Backend handlers in `server.js` or `backend/routes/purchaseOrders.js`
- Handlers:
  - `handleCreatePurchaseOrder`
  - `handleGetPurchaseOrders`
  - `handleGetPurchaseOrder`
  - `handleUpdatePurchaseOrder`
  - `handleApprovePurchaseOrder`
  - `handleRejectPurchaseOrder`
  - `handleUpdatePOStatus`
  - `handleGetPOTracking`

#### 5. Inventory API Handlers (Partially exists in frontend)
**Files Needed:**
- Backend handlers in `server.js` or `backend/routes/inventory.js`
- Handlers:
  - `handleCreateProduct`
  - `handleGetProducts`
  - `handleGetProduct`
  - `handleUpdateProduct`
  - `handleDeleteProduct`
  - `handleCreateCategory`
  - `handleGetCategories`
  - `handleGetStockAlerts`
  - `handleStockAdjustment`
  - `handleGetStockLevels`

#### 6. Suppliers API Handlers (Partially exists in frontend)
**Files Needed:**
- Backend handlers in `server.js` or `backend/routes/suppliers.js`
- Handlers:
  - `handleSupplierRegister` (Public endpoint)
  - `handleGetSuppliers`
  - `handleGetSupplier`
  - `handleUpdateSupplier`
  - `handleApproveSupplier`
  - `handleSuspendSupplier`
  - `handleGetSupplierPerformance`
  - `handleRateSupplier`
  - `handleGetSupplierBids`

#### 7. Reports API Handlers
**Files Needed:**
- Backend handlers in `server.js` or `backend/routes/reports.js`
- Handlers:
  - `handleGetProcurementReports`
  - `handleGetInventoryReports`
  - `handleGetSupplierReports`

---

## 🟡 FRONTEND API Service Files (May Need Updates)

### Existing Files (Check if they connect to backend):
- ✅ `src/services/api/authAPI.js` - **Connected**
- ✅ `src/services/api/invitationAPI.js` - **Connected**
- ✅ `src/services/api/dashboardAPI.js` - **Connected**
- ⚠️ `src/services/api/purchaseOrdersAPI.js` - **Needs backend implementation**
- ⚠️ `src/services/api/inventoryAPI.js` - **Needs backend implementation**
- ⚠️ `src/services/api/suppliersAPI.js` - **Needs backend implementation**
- ⚠️ `src/services/api/biddingAPI.js` - **Needs backend implementation**
- ⚠️ `src/services/api/reportsAPI.js` - **Needs backend implementation**

### Missing Frontend API Service Files:
- ❌ `src/services/api/requisitionsAPI.js` - **NOT FOUND - NEEDS TO BE CREATED**
- ❌ `src/services/api/rfqAPI.js` - **NOT FOUND - NEEDS TO BE CREATED**

---

## 🟢 BACKEND UTILITY FILES (Helpful to Create)

#### 1. Helper Functions
**Files Needed:**
- `backend/utils/approvalWorkflow.js` - Approval workflow logic
- `backend/utils/budgetCheck.js` - Budget validation
- `backend/utils/notifications.js` - Notification sending
- `backend/utils/generators.js` - Number generators (PO#, REQ#, RFQ#, etc.)

#### 2. Middleware
**Files Needed:**
- `backend/middleware/auth.js` - Authentication middleware (currently inline)
- `backend/middleware/roleCheck.js` - Role-based access control
- `backend/middleware/validate.js` - Request validation

#### 3. Constants
**Files Needed:**
- `backend/utils/constants.js` - Backend constants (statuses, thresholds, etc.)

---

## 📋 SUMMARY - Files by Priority

### 🔴 HIGH PRIORITY (Critical for Core Workflow)

**Backend:**
1. Requisitions handlers (9 functions)
2. RFQ handlers (9 functions)
3. Bidding handlers (4 functions)
4. Purchase Orders handlers (8 functions)

**Frontend:**
1. `src/services/api/requisitionsAPI.js`
2. `src/services/api/rfqAPI.js`

### 🟡 MEDIUM PRIORITY (Complete Features)

**Backend:**
1. Inventory handlers (10 functions)
2. Suppliers handlers (10 functions)

**Backend Utilities:**
1. `backend/utils/approvalWorkflow.js`
2. `backend/utils/generators.js`

### 🟢 LOW PRIORITY (Enhancements)

**Backend:**
1. Reports handlers (3 functions)
2. Middleware refactoring
3. Additional utilities

---

## 📝 Implementation Order Recommendation

### Phase 1: Core Procurement Workflow
1. Create `src/services/api/requisitionsAPI.js`
2. Add Requisitions handlers to `backend/server.js`
3. Create `src/services/api/rfqAPI.js`
4. Add RFQ handlers to `backend/server.js`
5. Add Bidding handlers to `backend/server.js`
6. Add Purchase Order handlers to `backend/server.js`

### Phase 2: Supporting Features
7. Add Inventory handlers to `backend/server.js`
8. Add Supplier handlers to `backend/server.js`
9. Create `backend/utils/approvalWorkflow.js`
10. Create `backend/utils/generators.js`

### Phase 3: Polish
11. Add Reports handlers
12. Refactor middleware
13. Add validation utilities

---

## 🔍 Files That May Need Updates

### Frontend Pages (May need API connection fixes):
- `src/pages/Procurement/CreatePurchaseOrder/CreatePurchaseOrder.jsx`
- `src/pages/Procurement/PurchaseOrders/PurchaseOrders.jsx`
- `src/pages/Procurement/RFQ/RFQ.jsx`
- `src/pages/Inventory/InventoryManagement/InventoryManagement.jsx`
- `src/pages/Inventory/AddProduct/AddProduct.jsx`
- `src/pages/Suppliers/SupplierDirectory/SupplierDirectory.jsx`
- `src/pages/Suppliers/AddSupplier/AddSupplier.jsx`

### Components (May need API connection):
- `src/components/procurement/Requisition/RequisitionForm.jsx`
- `src/components/procurement/Requisition/RequisitionList.jsx`
- `src/components/procurement/RFQManagement/RFQForm.jsx`
- `src/components/procurement/RFQManagement/RFQList.jsx`

---

## 📊 Estimated File Count

- **Backend Route Handlers:** ~40-50 handler functions
- **Frontend API Services:** 2 new files + updates to 5 existing files
- **Backend Utilities:** 4-6 helper files
- **Total New Files:** ~12-15 files
- **Total Functions:** ~50+ functions

---

## ✅ Files That Already Exist and Work

- ✅ `backend/server.js` - Main server (has auth, invitations, dashboard)
- ✅ `src/services/api/authAPI.js` - Authentication API
- ✅ `src/services/api/invitationAPI.js` - Invitations API
- ✅ `src/services/api/dashboardAPI.js` - Dashboard API
- ✅ Frontend components for all modules (just need backend connection)

---

## 🎯 Next Steps

1. **Start with Requisitions** - Create frontend API service and backend handlers
2. **Add RFQ and Bidding** - Complete the procurement workflow
3. **Complete Purchase Orders** - Final step in procurement
4. **Add Inventory and Suppliers** - Supporting modules
5. **Connect all frontend pages** - Remove mock data, use real APIs

