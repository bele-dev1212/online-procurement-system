import { useState } from 'react';

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  return { inventory, setInventory };
};
