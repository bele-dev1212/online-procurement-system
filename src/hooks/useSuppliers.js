import { useState } from 'react';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  return { suppliers, setSuppliers };
};
