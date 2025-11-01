import { useState, useContext, useCallback } from 'react';
import SupplierContext from '../contexts/SupplierContext';
import { suppliersAPI } from '../services/api/suppliersAPI';
import { useNotifications } from './useNotifications';

export const useSuppliers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { 
    suppliers, 
    setSuppliers,
    selectedSupplier,
    setSelectedSupplier
  } = useContext(SupplierContext);

  const { addNotification } = useNotifications();

  const fetchSuppliers = useCallback(async (filters = {}) => {
    if (suppliers.length > 0 && !filters.search && !filters.category) return;
    
    setLoading(true);
    setError(null);
    try {
      const suppliersData = await suppliersAPI.getSuppliers(filters);
      setSuppliers(suppliersData);
      return suppliersData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load suppliers.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [suppliers.length, setSuppliers, addNotification]);

  const getSupplier = useCallback(async (supplierId) => {
    setLoading(true);
    setError(null);
    try {
      const supplier = await suppliersAPI.getSupplier(supplierId);
      setSelectedSupplier(supplier);
      return supplier;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load supplier details.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSelectedSupplier, addNotification]);

  const createSupplier = async (supplierData) => {
    setLoading(true);
    setError(null);
    try {
      const newSupplier = await suppliersAPI.createSupplier(supplierData);
      setSuppliers(prev => [newSupplier, ...prev]);
      addNotification('Supplier created successfully!', 'success');
      return newSupplier;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create supplier.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (supplierId, supplierData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSupplier = await suppliersAPI.updateSupplier(supplierId, supplierData);
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId ? updatedSupplier : supplier
      ));
      
      if (selectedSupplier && selectedSupplier.id === supplierId) {
        setSelectedSupplier(updatedSupplier);
      }
      
      addNotification('Supplier updated successfully!', 'success');
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update supplier.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (supplierId) => {
    setLoading(true);
    setError(null);
    try {
      await suppliersAPI.deleteSupplier(supplierId);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
      
      if (selectedSupplier && selectedSupplier.id === supplierId) {
        setSelectedSupplier(null);
      }
      
      addNotification('Supplier deleted successfully!', 'success');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete supplier.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplierStatus = async (supplierId, status) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSupplier = await suppliersAPI.updateSupplierStatus(supplierId, status);
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId ? updatedSupplier : supplier
      ));
      
      if (selectedSupplier && selectedSupplier.id === supplierId) {
        setSelectedSupplier(updatedSupplier);
      }
      
      addNotification(`Supplier status updated to ${status}!`, 'success');
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update supplier status.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSupplierPerformance = async (supplierId, period = 'last_30_days') => {
    setLoading(true);
    setError(null);
    try {
      const performance = await suppliersAPI.getSupplierPerformance(supplierId, period);
      return performance;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load supplier performance.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSupplierOrders = async (supplierId, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const orders = await suppliersAPI.getSupplierOrders(supplierId, filters);
      return orders;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load supplier orders.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadSupplierDocument = async (supplierId, documentData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('document', documentData.file);
      formData.append('type', documentData.type);
      formData.append('name', documentData.name);
      
      const document = await suppliersAPI.uploadSupplierDocument(supplierId, formData);
      addNotification('Document uploaded successfully!', 'success');
      return document;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to upload document.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplierDocument = async (supplierId, documentId) => {
    setLoading(true);
    setError(null);
    try {
      await suppliersAPI.deleteSupplierDocument(supplierId, documentId);
      addNotification('Document deleted successfully!', 'success');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete document.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchSuppliers = async (searchTerm, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const results = await suppliersAPI.searchSuppliers(searchTerm, filters);
      return results;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search suppliers.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSupplierCategories = useCallback(async () => {
    try {
      const categories = await suppliersAPI.getSupplierCategories();
      return categories;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load supplier categories.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSupplierStats = useCallback(async () => {
    try {
      const stats = await suppliersAPI.getSupplierStats();
      return stats;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load supplier statistics.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearSelectedSupplier = useCallback(() => {
    setSelectedSupplier(null);
  }, [setSelectedSupplier]);

  return {
    // State
    loading,
    error,
    suppliers,
    selectedSupplier,

    // Supplier actions
    fetchSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    updateSupplierStatus,

    // Supplier data
    getSupplierPerformance,
    getSupplierOrders,
    getSupplierCategories,
    getSupplierStats,

    // Documents
    uploadSupplierDocument,
    deleteSupplierDocument,

    // Search
    searchSuppliers,

    // Utility
    clearSelectedSupplier,
    clearError: () => setError(null)
  };
};