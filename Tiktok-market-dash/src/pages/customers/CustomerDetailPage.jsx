import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE } from '@/components/ui/Pagination';
import {
  clearSelectedCustomer,
  fetchCustomerById,
  fetchCustomerPurchaseHistory,
  setHistoryPage,
} from '@/features/customers/customersSlice';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    selected: customer,
    purchaseHistory,
    purchaseSummary,
    historyPagination,
    detailStatus,
    error,
  } = useSelector((state) => state.customers);

  useEffect(() => {
    if (!id) return undefined;
    dispatch(fetchCustomerById(id));
    dispatch(fetchCustomerPurchaseHistory({ id, page: 1 }));
    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [id, dispatch]);

  const onHistoryPageChange = (page) => {
    dispatch(setHistoryPage(page));
    dispatch(fetchCustomerPurchaseHistory({ id, page }));
  };

  if (detailStatus === 'loading' && !customer) {
    return (
      <div className="py-16 text-center text-on-surface-variant text-body-sm">Loading customer…</div>
    );
  }

  if (!customer) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-on-surface-variant text-body-sm">{error || 'Customer not found.'}</p>
        <button type="button" onClick={() => navigate(ROUTES.CUSTOMERS)} className="text-primary text-body-sm">
          Back to customers
        </button>
      </div>
    );
  }

  const detailStats = [
    { label: 'Total Orders', value: customer.orders, icon: 'shopping_cart' },
    { label: 'Total Spent', value: customer.spent, icon: 'payments' },
    {
      label: 'Avg. Order',
      value: purchaseSummary?.averageOrderValueFormatted || customer.averageOrderValueFormatted || '—',
      icon: 'trending_up',
    },
    {
      label: 'Last Order',
      value: purchaseSummary?.lastPurchaseRelative || customer.lastOrderLabel || '—',
      icon: 'schedule',
    },
  ];

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button onClick={() => navigate(ROUTES.CUSTOMERS)} className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors">
              Customers
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">{customer.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-display-lg-mobile text-on-background">{customer.name}</h2>
            <StatusBadge status={customer.status} />
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Customer since {customer.joined} · {customer.orders} orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`mailto:${customer.email}`}
            className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            Send Email
          </a>
          <button className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {detailStats.map(({ label, value, icon }) => (
              <div key={label} className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{icon}</span>
                  <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
                </div>
                <p className="text-headline-md font-bold text-on-background">{value}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20">
              <h3 className="text-headline-md text-on-background">Order History</h3>
            </div>
            <div className="table-scroll">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                    {['Order ID', 'Product', 'Amount', 'Date', 'Status'].map((h) => (
                      <th key={h} className="py-3 px-6 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-body-sm divide-y divide-outline-variant/10">
                  {purchaseHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant">No orders yet.</td>
                    </tr>
                  )}
                  {purchaseHistory.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                      className="table-row-hover transition-all duration-200 cursor-pointer"
                    >
                      <td className="py-3 px-6 font-mono font-medium text-primary">{order.orderNumber || order.id}</td>
                      <td className="py-3 px-6 text-on-surface-variant max-w-[200px] truncate">{order.product}</td>
                      <td className="py-3 px-6 font-mono font-medium text-on-surface">{order.amount}</td>
                      <td className="py-3 px-6 text-on-surface-variant">{order.date}</td>
                      <td className="py-3 px-6"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              current={historyPagination.page}
              total={historyPagination.total}
              pageSize={historyPagination.limit || PAGE_SIZE}
              onPageChange={onHistoryPageChange}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-[32px] font-bold mx-auto mb-4">
              {(customer.name || '?').charAt(0)}
            </div>
            <h3 className="text-headline-md text-on-background">{customer.name}</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">{customer.email}</p>
            <p className="text-body-sm text-on-surface-variant">{customer.phone}</p>
            <div className="mt-4 flex gap-2 justify-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-full text-label-caps">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Contact Info</h3>
            <div className="space-y-3">
              {[
                { label: 'Email', value: customer.email, icon: 'mail' },
                { label: 'Phone', value: customer.phone || '—', icon: 'phone' },
                { label: 'Location', value: customer.location || '—', icon: 'location_on' },
                { label: 'Joined', value: customer.joined, icon: 'calendar_today' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">{icon}</span>
                  <div>
                    <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
                    <p className="text-body-sm text-on-surface">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(customer.tags || []).map((tag) => (
                <span key={tag} className="px-3 py-1 bg-surface-container border border-outline-variant/30 rounded-full text-label-caps text-on-surface-variant">
                  {tag}
                </span>
              ))}
              {(customer.tags || []).length === 0 && (
                <span className="text-body-sm text-on-surface-variant">No tags</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
