import { useState } from 'react';

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  return { purchaseOrders, setPurchaseOrders };
};
export const useProcurement = () => {
  const { purchaseOrders, loading, error } = usePurchaseOrders();
  
  return {
    procurementData: purchaseOrders,
    loading,
    error
  };
};