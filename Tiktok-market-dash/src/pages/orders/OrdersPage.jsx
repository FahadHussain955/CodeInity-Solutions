import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE } from '@/components/ui/Pagination';
import FilterTabs from '@/components/ui/FilterTabs';
import NoShopGate from '@/components/ui/NoShopGate';
import {
  clearOrderNotice,
  fetchOrdersList,
  setOrderFilters,
  setOrderPage,
} from '@/features/orders/ordersSlice';

const OrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, counts, filters, pagination, status, error, notice } = useSelector(
    (state) => state.orders
  );
  const selectedShopId = useSelector((state) => state.integrations?.selectedShopId);

  useEffect(() => {
    dispatch(fetchOrdersList());
  }, [dispatch, filters.search, filters.filter, pagination.page, selectedShopId]);

  useEffect(() => {
    if (!notice && !error) return undefined;
    const t = window.setTimeout(() => dispatch(clearOrderNotice()), 3500);
    return () => window.clearTimeout(t);
  }, [notice, error, dispatch]);

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'processing', label: 'Processing', count: counts.processing },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'delivered', label: 'Delivered', count: counts.delivered },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const stats = [
    {
      label: 'Total Orders',
      value: String(counts.all),
      icon: 'shopping_cart',
      color: 'bg-primary-container text-on-primary-container',
    },
    {
      label: 'Processing',
      value: String(counts.processing),
      icon: 'autorenew',
      color: 'bg-info-bg text-info',
    },
    {
      label: 'Pending',
      value: String(counts.pending),
      icon: 'schedule',
      color: 'bg-warning-bg text-warning',
    },
    {
      label: 'Delivered',
      value: String(counts.delivered),
      icon: 'check_circle',
      color: 'bg-success-bg text-success',
    },
  ];

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">Store</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Orders</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Orders</h2>
        </div>
      </div>

      <NoShopGate description="Connect your TikTok Shop to start managing orders.">
      <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
      </div>

      {(notice || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-body-sm ${
            error
              ? 'border-error/30 bg-error-container text-on-error-container'
              : 'border-success-border bg-success-bg text-success'
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="glass-panel rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
              <p className="text-headline-md font-bold text-on-background mt-0.5">
                {status === 'loading' && !counts.all ? '…' : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="table-toolbar">
        <FilterTabs
          tabs={tabs}
          value={filters.filter}
          onChange={(key) => dispatch(setOrderFilters({ filter: key }))}
        />
        <div className="relative w-full lg:w-64 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">
            search
          </span>
          <input
            value={filters.search}
            onChange={(e) => dispatch(setOrderFilters({ search: e.target.value }))}
            className="toolbar-control w-full bg-surface border border-outline-variant/50 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            placeholder="Search orders or customers..."
            aria-label="Search orders"
          />
        </div>
      </div>

      <div className="glass-panel rounded-xl flex flex-col shadow-sm overflow-hidden">
        <div className="table-scroll no-h-scroll">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[11%]">
                  Order ID
                </th>
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[16%]">
                  Customer
                </th>
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[18%]">
                  Product
                </th>
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[7%] text-center">
                  Items
                </th>
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[10%]">
                  Amount
                </th>
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[12%] hidden md:table-cell">
                  Payment
                </th>
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[10%]">
                  Date
                </th>
                <th className="py-3 px-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[12%]">
                  Status
                </th>
                <th className="py-3 px-2 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold w-[4%]" />
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {status === 'loading' && !items.length && (
                <tr>
                  <td colSpan={9} className="py-10 px-3 text-center text-on-surface-variant">
                    Loading orders…
                  </td>
                </tr>
              )}
              {status === 'succeeded' && !items.length && (
                <tr>
                  <td colSpan={9} className="py-10 px-3 text-center text-on-surface-variant">
                    No orders found.
                  </td>
                </tr>
              )}
              {items.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  className="table-row-hover transition-all duration-200 cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono font-medium text-primary truncate">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="min-w-0">
                      <p className="font-medium text-on-surface truncate">{order.customer}</p>
                      <p className="text-outline text-[11px] truncate">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant truncate">{order.product}</td>
                  <td className="py-3 px-3 text-on-surface-variant text-center">{order.items}</td>
                  <td className="py-3 px-3 font-mono font-medium text-on-surface truncate">
                    {order.amount}
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant truncate hidden md:table-cell">
                    {order.payment}
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant truncate">{order.date}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant/50"
                      aria-label={`More actions for ${order.orderNumber}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          current={pagination.page}
          total={pagination.total}
          pageSize={pagination.limit || PAGE_SIZE}
          onPageChange={(page) => dispatch(setOrderPage(page))}
        />
      </div>
      </NoShopGate>
    </div>
  );
};

export default OrdersPage;
