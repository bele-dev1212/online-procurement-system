# Backend API Structure - Complete Implementation Guide

## Overview
This document provides the complete backend API structure to support the full procurement workflow system.

## API Base URL
`/api`

## Authentication
All endpoints (except public ones) require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints Structure

### 1. Requisitions API
**Path:** `/api/requisitions`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/requisitions` | Create new requisition | User, Manager |
| GET | `/api/requisitions` | List requisitions (filtered by role/org) | All roles |
| GET | `/api/requisitions/:id` | Get requisition details | All roles |
| PUT | `/api/requisitions/:id` | Update requisition (draft only) | Creator |
| DELETE | `/api/requisitions/:id` | Delete requisition (draft only) | Creator, Admin |
| POST | `/api/requisitions/:id/submit` | Submit for approval | Creator |
| POST | `/api/requisitions/:id/approve` | Approve requisition | Approver |
| POST | `/api/requisitions/:id/reject` | Reject requisition | Approver |
| POST | `/api/requisitions/:id/convert-to-rfq` | Convert to RFQ | Procurement Manager |

### 2. RFQ (Request for Quotation) API
**Path:** `/api/rfqs`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/rfqs` | Create RFQ | Procurement Manager |
| GET | `/api/rfqs` | List RFQs | All roles |
| GET | `/api/rfqs/:id` | Get RFQ details | All roles |
| PUT | `/api/rfqs/:id` | Update RFQ (draft only) | Creator |
| POST | `/api/rfqs/:id/publish` | Publish RFQ to suppliers | Procurement Manager |
| POST | `/api/rfqs/:id/close` | Close RFQ | Procurement Manager |
| GET | `/api/rfqs/:id/bids` | Get bids for RFQ | Procurement Manager |
| POST | `/api/rfqs/:id/evaluate` | Evaluate bids | Procurement Manager |
| POST | `/api/rfqs/:id/award` | Award to supplier | Procurement Manager |

### 3. Bidding API
**Path:** `/api/bids`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/bids` | Submit bid | Supplier |
| GET | `/api/bids` | List bids (filtered by role) | All roles |
| GET | `/api/bids/:id` | Get bid details | Creator, Procurement Manager |
| PUT | `/api/bids/:id` | Update bid (before deadline) | Supplier |

### 4. Purchase Orders API
**Path:** `/api/purchase-orders`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/purchase-orders` | Create PO from requisition/bid | Procurement Manager |
| GET | `/api/purchase-orders` | List purchase orders | All roles |
| GET | `/api/purchase-orders/:id` | Get PO details | All roles |
| PUT | `/api/purchase-orders/:id` | Update PO | Procurement Manager |
| POST | `/api/purchase-orders/:id/approve` | Approve PO | Approver |
| POST | `/api/purchase-orders/:id/reject` | Reject PO | Approver |
| PUT | `/api/purchase-orders/:id/status` | Update PO status (ordered, received, etc.) | Procurement Manager |
| GET | `/api/purchase-orders/:id/tracking` | Get tracking info | All roles |

### 5. Inventory API
**Path:** `/api/inventory`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/inventory/products` | Add product | Inventory Manager |
| GET | `/api/inventory/products` | List products | All roles |
| GET | `/api/inventory/products/:id` | Get product details | All roles |
| PUT | `/api/inventory/products/:id` | Update product | Inventory Manager |
| DELETE | `/api/inventory/products/:id` | Delete product | Inventory Manager, Admin |
| POST | `/api/inventory/categories` | Create category | Inventory Manager |
| GET | `/api/inventory/categories` | List categories | All roles |
| GET | `/api/inventory/stock-alerts` | Get low stock alerts | Inventory Manager, Admin |
| POST | `/api/inventory/adjustments` | Stock adjustment | Inventory Manager |
| GET | `/api/inventory/stock-levels` | Get stock levels | All roles |

### 6. Suppliers API
**Path:** `/api/suppliers`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/suppliers/register` | Supplier self-registration | Public |
| GET | `/api/suppliers` | List suppliers | All roles |
| GET | `/api/suppliers/:id` | Get supplier details | All roles |
| PUT | `/api/suppliers/:id` | Update supplier | Supplier (own), Admin |
| POST | `/api/suppliers/:id/approve` | Approve supplier | Admin, Procurement Manager |
| POST | `/api/suppliers/:id/suspend` | Suspend supplier | Admin |
| GET | `/api/suppliers/:id/performance` | Get performance metrics | All roles |
| POST | `/api/suppliers/:id/rating` | Rate supplier | Procurement Manager |
| GET | `/api/suppliers/:id/bids` | Get supplier's bids | Supplier (own), Procurement Manager |

### 7. Dashboard API
**Path:** `/api/dashboard`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard` | Get dashboard data (role-based) | All roles |

### 8. Reports API
**Path:** `/api/reports`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reports/procurement` | Procurement reports | Manager, Admin |
| GET | `/api/reports/inventory` | Inventory reports | Inventory Manager, Admin |
| GET | `/api/reports/suppliers` | Supplier performance reports | Procurement Manager, Admin |

## Data Models

### Requisition
```javascript
{
  requisitionNumber: String (auto-generated),
  requestedBy: ObjectId (User),
  organization: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    unitPrice: Number,
    total: Number,
    description: String
  }],
  totalAmount: Number,
  department: String,
  justification: String,
  status: String (draft, submitted, under_review, approved, rejected, converted_to_po),
  approvalHistory: [{
    user: ObjectId,
    action: String,
    comments: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### RFQ
```javascript
{
  rfqNumber: String (auto-generated),
  createdBy: ObjectId (User),
  organization: ObjectId,
  requisition: ObjectId,
  title: String,
  description: String,
  items: [{
    product: ObjectId,
    quantity: Number,
    specifications: String
  }],
  deadline: Date,
  status: String (draft, published, open, under_evaluation, awarded, cancelled),
  invitedSuppliers: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Bid
```javascript
{
  bidNumber: String (auto-generated),
  rfq: ObjectId,
  supplier: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  totalAmount: Number,
  validity: Number (days),
  deliveryDate: Date,
  notes: String,
  status: String (submitted, under_evaluation, accepted, rejected),
  evaluation: {
    score: Number,
    evaluator: ObjectId,
    comments: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Purchase Order
```javascript
{
  poNumber: String (auto-generated),
  organization: ObjectId,
  requisition: ObjectId,
  rfq: ObjectId,
  bid: ObjectId,
  supplier: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  totalAmount: Number,
  status: String (draft, pending_approval, approved, ordered, received, cancelled),
  approvalHistory: [{
    user: ObjectId,
    action: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Product (Inventory)
```javascript
{
  sku: String (unique),
  name: String,
  category: ObjectId,
  description: String,
  unit: String,
  currentStock: Number,
  minStock: Number,
  maxStock: Number,
  unitPrice: Number,
  supplier: ObjectId,
  status: String (active, inactive),
  organization: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Supplier
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  address: String,
  categories: [ObjectId], // Product categories they supply
  status: String (pending, approved, suspended),
  performance: {
    rating: Number,
    onTimeDelivery: Number,
    qualityScore: Number
  },
  organization: ObjectId, // null for external suppliers
  createdAt: Date,
  updatedAt: Date
}
```

## Response Format

### Success Response
```javascript
{
  success: true,
  data: { ... },
  message: "Operation successful"
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description",
  error: { ... } // Optional detailed error
}
```

## Implementation Priority

1. **High Priority:**
   - Requisitions API
   - RFQ API
   - Bidding API
   - Purchase Orders API

2. **Medium Priority:**
   - Inventory API
   - Suppliers API
   - Dashboard API

3. **Lower Priority:**
   - Reports API
   - Advanced features

