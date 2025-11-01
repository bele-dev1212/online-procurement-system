import { useState, useEffect, useCallback } from 'react';
import { biddingAPI } from '../services/api/biddingAPI';
import { useNotifications } from './useNotifications';
import { useAuth } from './useAuth';

export const useBidding = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateRange: {},
    searchTerm: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { addNotification } = useNotifications();
  const { user } = useAuth();

  // Fetch all bids with pagination and filtering
  const fetchBids = useCallback(async (page = 1, limit = 10, filterParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit,
        ...filterParams,
        ...filters
      };

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || (typeof params[key] === 'object' && Object.keys(params[key]).length === 0)) {
          delete params[key];
        }
      });

      const response = await biddingAPI.getAllBids(params);
      
      if (response.success) {
        setBids(response.data.bids || []);
        setPagination({
          page: response.data.currentPage || page,
          limit: response.data.limit || limit,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        });
        
        // Only show success notification if we're not doing background refresh
        if (page === 1 && !filterParams.silent) {
          addNotification({
            type: 'success',
            title: 'Bids Loaded',
            message: `Successfully loaded ${response.data.bids?.length || 0} bids`
          });
        }
      } else {
        throw new Error(response.message || 'Failed to fetch bids');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch bids';
      setError(errorMessage);
      if (!filterParams.silent) {
        addNotification({
          type: 'error',
          title: 'Error Loading Bids',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  }, [filters, addNotification]);

  // Fetch single bid by ID
  const fetchBidById = useCallback(async (bidId) => {
    if (!bidId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.getBidById(bidId);
      
      if (response.success) {
        setSelectedBid(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch bid');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch bid';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Loading Bid',
        message: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Create new bid
  const createBid = useCallback(async (bidData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.createBid(bidData);
      
      if (response.success) {
        setBids(prev => [response.data, ...prev]);
        // Update pagination total
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        
        addNotification({
          type: 'success',
          title: 'Bid Created',
          message: 'Bid has been created successfully'
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create bid');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create bid';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Creating Bid',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Update existing bid
  const updateBid = useCallback(async (bidId, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.updateBid(bidId, updateData);
      
      if (response.success) {
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? { ...bid, ...response.data } : bid
        ));
        
        if (selectedBid && selectedBid.id === bidId) {
          setSelectedBid(prev => ({ ...prev, ...response.data }));
        }
        
        addNotification({
          type: 'success',
          title: 'Bid Updated',
          message: 'Bid has been updated successfully'
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update bid');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update bid';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Updating Bid',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBid, addNotification]);

  // Submit bid for approval
  const submitBidForApproval = useCallback(async (bidId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.submitForApproval(bidId);
      
      if (response.success) {
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? { ...bid, status: 'under_review', submittedAt: new Date().toISOString() } : bid
        ));
        
        if (selectedBid && selectedBid.id === bidId) {
          setSelectedBid(prev => ({ ...prev, status: 'under_review', submittedAt: new Date().toISOString() }));
        }
        
        addNotification({
          type: 'success',
          title: 'Bid Submitted',
          message: 'Bid has been submitted for approval'
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit bid for approval');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit bid';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Submitting Bid',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBid, addNotification]);

  // Approve bid
  const approveBid = useCallback(async (bidId, approvalData = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.approveBid(bidId, approvalData);
      
      if (response.success) {
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? { ...bid, status: 'approved', approvedAt: new Date().toISOString(), ...response.data } : bid
        ));
        
        if (selectedBid && selectedBid.id === bidId) {
          setSelectedBid(prev => ({ ...prev, status: 'approved', approvedAt: new Date().toISOString(), ...response.data }));
        }
        
        addNotification({
          type: 'success',
          title: 'Bid Approved',
          message: 'Bid has been approved successfully'
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to approve bid');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve bid';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Approving Bid',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBid, addNotification]);

  // Reject bid
  const rejectBid = useCallback(async (bidId, rejectionData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.rejectBid(bidId, rejectionData);
      
      if (response.success) {
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? { ...bid, status: 'rejected', rejectedAt: new Date().toISOString(), ...response.data } : bid
        ));
        
        if (selectedBid && selectedBid.id === bidId) {
          setSelectedBid(prev => ({ ...prev, status: 'rejected', rejectedAt: new Date().toISOString(), ...response.data }));
        }
        
        addNotification({
          type: 'warning',
          title: 'Bid Rejected',
          message: rejectionData.reason ? `Bid has been rejected: ${rejectionData.reason}` : 'Bid has been rejected'
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to reject bid');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject bid';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Rejecting Bid',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBid, addNotification]);

  // Delete bid
  const deleteBid = useCallback(async (bidId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.deleteBid(bidId);
      
      if (response.success) {
        setBids(prev => prev.filter(bid => bid.id !== bidId));
        // Update pagination total
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        
        if (selectedBid && selectedBid.id === bidId) {
          setSelectedBid(null);
        }
        
        addNotification({
          type: 'success',
          title: 'Bid Deleted',
          message: 'Bid has been deleted successfully'
        });
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete bid');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete bid';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Deleting Bid',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBid, addNotification]);

  // Add bid response (for suppliers)
  const addBidResponse = useCallback(async (bidId, responseData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await biddingAPI.addBidResponse(bidId, responseData);
      
      if (response.success) {
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? { 
            ...bid, 
            responses: [...(bid.responses || []), response.data],
            responseCount: (bid.responseCount || 0) + 1
          } : bid
        ));
        
        if (selectedBid && selectedBid.id === bidId) {
          setSelectedBid(prev => ({
            ...prev,
            responses: [...(prev.responses || []), response.data],
            responseCount: (prev.responseCount || 0) + 1
          }));
        }
        
        addNotification({
          type: 'success',
          title: 'Response Added',
          message: 'Your response has been submitted successfully'
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add bid response');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add response';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error Adding Response',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBid, addNotification]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      type: '',
      dateRange: {},
      searchTerm: ''
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear selected bid
  const clearSelectedBid = useCallback(() => {
    setSelectedBid(null);
  }, []);

  // Get bids statistics
  const getBidStats = useCallback(async () => {
    try {
      const response = await biddingAPI.getBidStats();
      return response.success ? response.data : null;
    } catch (err) {
      console.error('Failed to fetch bid stats:', err);
      return null;
    }
  }, []);

  // Check if user can perform actions on bid
  const canEditBid = useCallback((bid) => {
    if (!user || !bid) return false;
    
    return user.role === 'admin' || 
           (user.role === 'procurement_manager' && bid.status === 'draft') ||
           bid.createdBy === user.id;
  }, [user]);

  const canDeleteBid = useCallback((bid) => {
    if (!user || !bid) return false;
    
    return user.role === 'admin' || 
           (user.role === 'procurement_manager' && ['draft', 'cancelled'].includes(bid.status)) ||
           (bid.createdBy === user.id && bid.status === 'draft');
  }, [user]);

  const canApproveBid = useCallback((bid) => {
    if (!user || !bid) return false;
    
    return (user.role === 'admin' || user.role === 'procurement_manager') && 
           bid.status === 'under_review';
  }, [user]);

  // Load bids on component mount or filter change
  useEffect(() => {
    fetchBids(pagination.page, pagination.limit);
  }, [fetchBids, pagination.page, pagination.limit]);

  // Refresh bids when filters change
  useEffect(() => {
    if (pagination.page === 1) {
      fetchBids(1, pagination.limit, { silent: true });
    } else {
      // Reset to first page when filters change
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [filters, fetchBids, pagination.limit,pagination.page]);

  return {
    // State
    bids,
    selectedBid,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    fetchBids,
    fetchBidById,
    createBid,
    updateBid,
    deleteBid,
    submitBidForApproval,
    approveBid,
    rejectBid,
    addBidResponse,
    
    // Selection
    setSelectedBid,
    
    // Filtering
    updateFilters,
    clearFilters,
    
    // Utilities
    clearError,
    clearSelectedBid,
    getBidStats,
    canEditBid,
    canDeleteBid,
    canApproveBid,
    
    // Pagination
    setPagination: (newPagination) => setPagination(prev => ({ ...prev, ...newPagination }))
  };
};

export default useBidding;