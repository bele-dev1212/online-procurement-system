import { useState, useContext, useCallback } from 'react';
import { InventoryContext } from '../contexts/InventoryContext';
import { inventoryAPI } from '../services/api/inventoryAPI';
import { useNotifications } from './useNotifications';

export const useInventory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { 
    inventory, 
    setInventory,
    selectedProduct,
    setSelectedProduct
  } = useContext(InventoryContext);

  const { addNotification } = useNotifications();

  const fetchInventory = useCallback(async (filters = {}) => {
    if (inventory.length > 0 && !filters.search && !filters.category) return;
    
    setLoading(true);
    setError(null);
    try {
      const inventoryData = await inventoryAPI.getInventory(filters);
      setInventory(inventoryData);
      return inventoryData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load inventory.';
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
  }, [inventory.length, setInventory, addNotification]);

  const getProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const product = await inventoryAPI.getProduct(productId);
      setSelectedProduct(product);
      return product;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load product details.';
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
  }, [setSelectedProduct, addNotification]);

  const addProduct = async (productData) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await inventoryAPI.createProduct(productData);
      setInventory(prev => [newProduct, ...prev]);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Product added successfully!'
      });
      return { success: true, product: newProduct };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add product.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, productData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await inventoryAPI.updateProduct(productId, productData);
      setInventory(prev => prev.map(product => 
        product.id === productId ? updatedProduct : product
      ));
      
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(updatedProduct);
      }
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Product updated successfully!'
      });
      return updatedProduct;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update product.';
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
  };

  const deleteProduct = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      await inventoryAPI.deleteProduct(productId);
      setInventory(prev => prev.filter(product => product.id !== productId));
      
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(null);
      }
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Product deleted successfully!'
      });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete product.';
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
  };

  const updateStock = async (productId, quantity, action = 'add', reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await inventoryAPI.updateStock(productId, quantity, action, reason);
      setInventory(prev => prev.map(product => 
        product.id === productId ? updatedProduct : product
      ));
      
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(updatedProduct);
      }
      
      addNotification({
        type: 'success',
        title: 'Stock Updated',
        message: `Stock ${action === 'add' ? 'added' : 'removed'} successfully!`
      });
      return updatedProduct;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update stock.';
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
  };

  const getLowStockItems = useCallback(() => {
    return inventory.filter(product => 
      product.quantity <= product.minStockLevel
    );
  }, [inventory]);

  const getProductsByCategory = useCallback((category) => {
    return inventory.filter(product => product.category === category);
  }, [inventory]);

  const searchProducts = async (searchTerm, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const results = await inventoryAPI.searchProducts(searchTerm, filters);
      return results;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search products.';
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
  };

  const getInventoryStatistics = useCallback(() => {
    const stats = {
      totalProducts: inventory.length,
      lowStockItems: getLowStockItems().length,
      outOfStock: inventory.filter(product => product.quantity === 0).length,
      totalValue: inventory.reduce((sum, product) => sum + (product.price * product.quantity || 0), 0)
    };
    
    return stats;
  }, [inventory, getLowStockItems]);

  const clearSelectedProduct = useCallback(() => {
    setSelectedProduct(null);
  }, [setSelectedProduct]);

  return {
    // State
    loading,
    error,
    inventory,
    selectedProduct,

    // Product actions
    fetchInventory,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,

    // Stock management
    updateStock,

    // Inventory data
    getLowStockItems,
    getProductsByCategory,
    getInventoryStatistics,

    // Search
    searchProducts,

    // Utility methods
    clearSelectedProduct,
    clearError: () => setError(null)
  };
};