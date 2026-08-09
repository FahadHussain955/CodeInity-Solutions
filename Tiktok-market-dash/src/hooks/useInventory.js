import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInventoryAnalytics,
  fetchInventoryDashboard,
  fetchInventoryList,
  restockInventory,
  setInventoryFilters,
  setInventoryPage,
  updateInventoryStock,
} from '@/features/inventory/inventorySlice';

export const useInventory = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.inventory);

  return {
    ...state,
    loadList: useCallback(() => dispatch(fetchInventoryList()), [dispatch]),
    loadAnalytics: useCallback(() => dispatch(fetchInventoryAnalytics()), [dispatch]),
    loadDashboard: useCallback(() => dispatch(fetchInventoryDashboard()), [dispatch]),
    setFilters: useCallback((filters) => dispatch(setInventoryFilters(filters)), [dispatch]),
    setPage: useCallback((page) => dispatch(setInventoryPage(page)), [dispatch]),
    restock: useCallback((payload) => dispatch(restockInventory(payload)), [dispatch]),
    updateStock: useCallback((payload) => dispatch(updateInventoryStock(payload)), [dispatch]),
  };
};

export default useInventory;
