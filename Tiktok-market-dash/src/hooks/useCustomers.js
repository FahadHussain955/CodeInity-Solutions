import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCustomer,
  fetchCustomerAnalytics,
  fetchCustomerById,
  fetchCustomerPurchaseHistory,
  fetchCustomersDashboard,
  fetchCustomersList,
  setCustomerFilters,
  setCustomerPage,
} from '@/features/customers/customersSlice';

export const useCustomers = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.customers);

  return {
    ...state,
    loadList: useCallback(() => dispatch(fetchCustomersList()), [dispatch]),
    loadAnalytics: useCallback(() => dispatch(fetchCustomerAnalytics()), [dispatch]),
    loadDashboard: useCallback(() => dispatch(fetchCustomersDashboard()), [dispatch]),
    loadById: useCallback((id) => dispatch(fetchCustomerById(id)), [dispatch]),
    loadPurchaseHistory: useCallback(
      (payload) => dispatch(fetchCustomerPurchaseHistory(payload)),
      [dispatch]
    ),
    setFilters: useCallback((filters) => dispatch(setCustomerFilters(filters)), [dispatch]),
    setPage: useCallback((page) => dispatch(setCustomerPage(page)), [dispatch]),
    create: useCallback((payload) => dispatch(createCustomer(payload)), [dispatch]),
  };
};

export default useCustomers;
