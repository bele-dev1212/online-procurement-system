import { useState, useContext, useCallback } from 'react';
import ProcurementContext from '../contexts/ProcurementContext';
import { purchaseOrdersAPI } from '../services/api/purchaseOrdersAPI';
import { useNotifications } from './useNotifications';

export const useProcurement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { 
    purchaseOrders, 
    setPurchaseOrders,
    selectedOrder,
    setSelectedOrder
  } = useContext(ProcurementContext);

  const { addNotification } = useNotifications();

  const fetchPurchaseOrders = useCallback(async (filters = {}) => {
    if (purchaseOrders.length > 0 && !filters.search && !filters.status) return;
    
    setLoading(true);
    setError(null);
    try {
      const orders = await purchaseOrdersAPI.getPurchaseOrders(filters);
      setPurchaseOrders(orders);
      return orders;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load purchase orders.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [purchaseOrders.length, setPurchaseOrders, addNotification]);

  const getPurchaseOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const order = await purchaseOrdersAPI.getPurchaseOrder(orderId);
      setSelectedOrder(order);
      return order;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load purchase order details.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSelectedOrder, addNotification]);

  const createPurchaseOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await purchaseOrdersAPI.createPurchaseOrder(orderData);
      setPurchaseOrders(prev => [newOrder, ...prev]);
      addNotification('Purchase order created successfully!', 'success');
      return newOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create purchase order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseOrder = async (orderId, orderData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await purchaseOrdersAPI.updatePurchaseOrder(orderId, orderData);
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      addNotification('Purchase order updated successfully!', 'success');
      return updatedOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update purchase order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePurchaseOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      await purchaseOrdersAPI.deletePurchaseOrder(orderId);
      setPurchaseOrders(prev => prev.filter(order => order.id !== orderId));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      
      addNotification('Purchase order deleted successfully!', 'success');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete purchase order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await purchaseOrdersAPI.updateOrderStatus(orderId, status, notes);
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      addNotification(`Order status updated to ${status}!`, 'success');
      return updatedOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approvePurchaseOrder = async (orderId, approvalData) => {
    setLoading(true);
    setError(null);
    try {
      const approvedOrder = await purchaseOrdersAPI.approvePurchaseOrder(orderId, approvalData);
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? approvedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(approvedOrder);
      }
      
      addNotification('Purchase order approved successfully!', 'success');
      return approvedOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to approve purchase order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectPurchaseOrder = async (orderId, rejectionData) => {
    setLoading(true);
    setError(null);
    try {
      const rejectedOrder = await purchaseOrdersAPI.rejectPurchaseOrder(orderId, rejectionData);
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? rejectedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(rejectedOrder);
      }
      
      addNotification('Purchase order rejected.', 'warning');
      return rejectedOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reject purchase order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = async (orderId, itemData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await purchaseOrdersAPI.addOrderItem(orderId, itemData);
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      addNotification('Item added to purchase order!', 'success');
      return updatedOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderItem = async (orderId, itemId, itemData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await purchaseOrdersAPI.updateOrderItem(orderId, itemId, itemData);
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      addNotification('Order item updated successfully!', 'success');
      return updatedOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update order item.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeOrderItem = async (orderId, itemId) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await purchaseOrdersAPI.removeOrderItem(orderId, itemId);
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      addNotification('Item removed from purchase order.', 'success');
      return updatedOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item from order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderHistory = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const history = await purchaseOrdersAPI.getOrderHistory(orderId);
      return history;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load order history.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const duplicatePurchaseOrder = async (orderId, newData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await purchaseOrdersAPI.duplicatePurchaseOrder(orderId, newData);
      setPurchaseOrders(prev => [newOrder, ...prev]);
      addNotification('Purchase order duplicated successfully!', 'success');
      return newOrder;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to duplicate purchase order.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchPurchaseOrders = async (searchTerm, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const results = await purchaseOrdersAPI.searchPurchaseOrders(searchTerm, filters);
      return results;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search purchase orders.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseOrderStats = useCallback(async (filters = {}) => {
    try {
      const stats = await purchaseOrdersAPI.getPurchaseOrderStats(filters);
      return stats;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load purchase order statistics.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getPendingApprovals = useCallback(async () => {
    try {
      const pendingOrders = await purchaseOrdersAPI.getPendingApprovals();
      return pendingOrders;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load pending approvals.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
  }, [setSelectedOrder]);

  const getFilteredOrders = useCallback((filters = {}) => {
    let filtered = [...purchaseOrders];

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= new Date(filters.startDate) && orderDate <= new Date(filters.endDate);
      });
    }

    // Supplier filter
    if (filters.supplier) {
      filtered = filtered.filter(order => 
        order.supplier?.id === filters.supplier || 
        order.supplier?.name?.toLowerCase().includes(filters.supplier.toLowerCase())
      );
    }

    // Search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm) ||
        order.supplier?.name?.toLowerCase().includes(searchTerm) ||
        order.description?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [purchaseOrders]);

  return {
    // State
    loading,
    error,
    purchaseOrders,
    selectedOrder,

    // Order actions
    fetchPurchaseOrders,
    getPurchaseOrder,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    duplicatePurchaseOrder,

    // Order management
    updateOrderStatus,
    approvePurchaseOrder,
    rejectPurchaseOrder,

    // Order items
    addOrderItem,
    updateOrderItem,
    removeOrderItem,

    // Order data
    getOrderHistory,
    getPurchaseOrderStats,
    getPendingApprovals,

    // Search and filters
    searchPurchaseOrders,
    getFilteredOrders,

    // Utility
    clearSelectedOrder,
    clearError: () => setError(null)
  };
};