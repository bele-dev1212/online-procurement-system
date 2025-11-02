import { useState } from 'react';

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  return { purchaseOrders, setPurchaseOrders };
};
