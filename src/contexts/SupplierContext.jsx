import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNotifications } from './NotificationContext'; // Fixed import path

export const SupplierContext = createContext();


export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    searchTerm: '',
    rating: ''
  });
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    pendingSuppliers: 0,
    suspendedSuppliers: 0
  });

  const { addNotification } = useNotifications();

  // Suppliers Management
  const fetchSuppliers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/suppliers?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(data.data.suppliers);
        return data.data.suppliers;
      } else {
        throw new Error(data.message || 'Failed to fetch suppliers');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch suppliers';
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

  const fetchSupplierById = useCallback(async (supplierId) => {
    if (!supplierId) return null;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedSupplier(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch supplier');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch supplier';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createSupplier = useCallback(async (supplierData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(prev => [data.data, ...prev]);
        addNotification({
          type: 'success',
          title: 'Supplier Created',
          message: 'Supplier has been created successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create supplier');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create supplier';
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

  const updateSupplier = useCallback(async (supplierId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === supplierId ? { ...supplier, ...data.data } : supplier
        ));
        
        if (selectedSupplier && selectedSupplier.id === supplierId) {
          setSelectedSupplier(prev => ({ ...prev, ...data.data }));
        }
        
        addNotification({
          type: 'success',
          title: 'Supplier Updated',
          message: 'Supplier has been updated successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update supplier');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update supplier';
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
  }, [selectedSupplier, addNotification]);

  const deleteSupplier = useCallback(async (supplierId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
        
        if (selectedSupplier && selectedSupplier.id === supplierId) {
          setSelectedSupplier(null);
        }
        
        addNotification({
          type: 'success',
          title: 'Supplier Deleted',
          message: 'Supplier has been deleted successfully'
        });
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete supplier');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete supplier';
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
  }, [selectedSupplier, addNotification]);

  const approveSupplier = useCallback(async (supplierId) => {
    return updateSupplier(supplierId, {
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
  }, [updateSupplier]);

  const suspendSupplier = useCallback(async (supplierId, reason) => {
    return updateSupplier(supplierId, {
      status: 'suspended',
      suspendedAt: new Date().toISOString(),
      suspensionReason: reason
    });
  }, [updateSupplier]);

  const activateSupplier = useCallback(async (supplierId) => {
    return updateSupplier(supplierId, {
      status: 'active',
      activatedAt: new Date().toISOString(),
      suspensionReason: null
    });
  }, [updateSupplier]);

  // Supplier Performance
  const fetchSupplierPerformance = useCallback(async (supplierId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = supplierId 
        ? `/api/suppliers/${supplierId}/performance`
        : '/api/suppliers/performance';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        if (supplierId) {
          setSupplierPerformance(data.data);
        } else {
          setSupplierPerformance(data.data.performance);
        }
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch supplier performance');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch supplier performance';
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

  const updateSupplierRating = useCallback(async (supplierId, ratingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/suppliers/${supplierId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });
      const data = await response.json();
      
      if (data.success) {
        // Update supplier in list
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === supplierId ? { ...supplier, rating: data.data.rating } : supplier
        ));
        
        // Update selected supplier if applicable
        if (selectedSupplier && selectedSupplier.id === supplierId) {
          setSelectedSupplier(prev => ({ ...prev, rating: data.data.rating }));
        }
        
        addNotification({
          type: 'success',
          title: 'Rating Updated',
          message: 'Supplier rating has been updated successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update supplier rating');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update supplier rating';
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
  }, [selectedSupplier, addNotification]);

  // Categories Management
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/supplier-categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories);
        return data.data.categories;
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/supplier-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      
      if (data.success) {
        setCategories(prev => [data.data, ...prev]);
        addNotification({
          type: 'success',
          title: 'Category Created',
          message: 'Category has been created successfully'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create category');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create category';
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
  const fetchSupplierStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/suppliers/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch supplier stats');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch supplier stats';
      setError(errorMessage);
      console.error('Failed to fetch supplier stats:', err);
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

  const clearSelectedSupplier = useCallback(() => {
    setSelectedSupplier(null);
  }, []);

  const searchSuppliers = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return fetchSuppliers();
    }
    
    return fetchSuppliers({ search: searchTerm });
  }, [fetchSuppliers]);

  const value = {
    // State
    suppliers,
    selectedSupplier,
    supplierPerformance,
    loading,
    error,
    filters,
    categories,
    stats,

    // Supplier Actions
    fetchSuppliers,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    approveSupplier,
    suspendSupplier,
    activateSupplier,

    // Performance Actions
    fetchSupplierPerformance,
    updateSupplierRating,

    // Category Actions
    fetchCategories,
    createCategory,

    // Selection Actions
    setSelectedSupplier,

    // Utilities
    updateFilters,
    clearError,
    clearSelectedSupplier,
    searchSuppliers,
    fetchSupplierStats
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
};

export default SupplierContext;