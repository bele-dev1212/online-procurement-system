import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNotifications } from './NotificationContext'; // Fixed import path

export const ProcurementContext = createContext();


export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};

export const ProcurementProvider = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: {},
    searchTerm: '',
    category: ''
  });
  const [stats, setStats] = useState({
    totalPOs: 0,
    pendingPOs: 0,
    completedPOs: 0,
    totalSpend: 0,
    averageProcessingTime: 0
  });

  const { addNotification } = useNotifications();

  // Purchase Orders Management
  const fetchPurchaseOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulated API call - replace with actual API
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/purchase-orders?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setPurchaseOrders(data.data.purchaseOrders);
        return data.data.purchaseOrders;
      } else {
        throw new Error(data.message || 'Failed to fetch purchase orders');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch purchase orders';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createPurchaseOrder = useCallback(async (poData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poData),
      });
      const data = await response.json();
      
      if (data.success) {
        setPurchaseOrders(prev => [data.data, ...prev]);
        addNotification({
          type: 'success',
          title: 'Purchase Order Created',
          message: 'Purchase order has been created successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create purchase order');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create purchase order';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const updatePurchaseOrder = useCallback(async (poId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/purchase-orders/${poId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      
      if (data.success) {
        setPurchaseOrders(prev => prev.map(po => 
          po.id === poId ? { ...po, ...data.data } : po
        ));
        
        if (selectedPO && selectedPO.id === poId) {
          setSelectedPO(prev => ({ ...prev, ...data.data }));
        }
        
        addNotification({
          type: 'success',
          title: 'Purchase Order Updated',
          message: 'Purchase order has been updated successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update purchase order');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update purchase order';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedPO, addNotification]);

  const approvePurchaseOrder = useCallback(async (poId, approvalData = {}) => {
    return updatePurchaseOrder(poId, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      ...approvalData
    });
  }, [updatePurchaseOrder]);

  const rejectPurchaseOrder = useCallback(async (poId, rejectionData) => {
    return updatePurchaseOrder(poId, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectionData.reason,
      ...rejectionData
    });
  }, [updatePurchaseOrder]);

  // Requisitions Management
  const fetchRequisitions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/requisitions?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setRequisitions(data.data.requisitions);
        return data.data.requisitions;
      } else {
        throw new Error(data.message || 'Failed to fetch requisitions');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch requisitions';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createRequisition = useCallback(async (requisitionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requisitionData),
      });
      const data = await response.json();
      
      if (data.success) {
        setRequisitions(prev => [data.data, ...prev]);
        addNotification({
          type: 'success',
          title: 'Requisition Created',
          message: 'Requisition has been created successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create requisition');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create requisition';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // RFQ Management
  const fetchRFQs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/rfqs?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setRfqs(data.data.rfqs);
        return data.data.rfqs;
      } else {
        throw new Error(data.message || 'Failed to fetch RFQs');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch RFQs';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createRFQ = useCallback(async (rfqData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rfqData),
      });
      const data = await response.json();
      
      if (data.success) {
        setRfqs(prev => [data.data, ...prev]);
        addNotification({
          type: 'success',
          title: 'RFQ Created',
          message: 'RFQ has been created successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create RFQ');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create RFQ';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Statistics
  const fetchProcurementStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/procurement/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch procurement stats');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch procurement stats';
      setError(errorMessage);
      console.error('Failed to fetch procurement stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedPO(null);
    setSelectedRequisition(null);
    setSelectedRFQ(null);
  }, []);

  const value = {
    // State
    purchaseOrders,
    requisitions,
    rfqs,
    selectedPO,
    selectedRequisition,
    selectedRFQ,
    loading,
    error,
    filters,
    stats,

    // Purchase Order Actions
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    approvePurchaseOrder,
    rejectPurchaseOrder,

    // Requisition Actions
    fetchRequisitions,
    createRequisition,

    // RFQ Actions
    fetchRFQs,
    createRFQ,

    // Selection Actions
    setSelectedPO,
    setSelectedRequisition,
    setSelectedRFQ,

    // Utilities
    updateFilters,
    clearError,
    clearSelected,
    fetchProcurementStats
  };

  return (
    <ProcurementContext.Provider value={value}>
      {children}
    </ProcurementContext.Provider>
  );
};

export default ProcurementContext;