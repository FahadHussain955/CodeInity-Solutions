import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE } from '@/components/ui/Pagination';
import NoShopGate from '@/components/ui/NoShopGate';
import {
  clearCustomerNotice,
  createCustomer,
  fetchCustomerAnalytics,
  fetchCustomersList,
  setCustomerFilters,
  setCustomerPage,
} from '@/features/customers/customersSlice';

const CustomersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items,
    analytics,
    filters,
    pagination,
    status,
    analyticsStatus,
    error,
    notice,
    actionStatus,
  } = useSelector((state) => state.customers);
  const selectedShopId = useSelector((state) => state.integrations?.selectedShopId);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', city: '' });

  useEffect(() => {
    dispatch(fetchCustomersList());
    dispatch(fetchCustomerAnalytics());
  }, [dispatch, filters.search, filters.filter, filters.sort, pagination.page, selectedShopId]);

  useEffect(() => {
    if (!notice && !error) return undefined;
    const t = window.setTimeout(() => dispatch(clearCustomerNotice()), 3500);
    return () => window.clearTimeout(t);
  }, [notice, error, dispatch]);

  const stats = analytics?.cards || [];

  const submitCreate = async () => {
    const result = await dispatch(createCustomer(form));
    if (createCustomer.fulfilled.match(result)) {
      setAddOpen(false);
      setForm({ fullName: '', email: '', phone: '', city: '' });
      dispatch(fetchCustomersList());
      dispatch(fetchCustomerAnalytics());
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">Store</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Customers</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Customers</h2>
        </div>
      </div>

      <NoShopGate description="Connect your TikTok Shop to start managing customers.">
      <div className="flex items-center justify-end gap-3">
          <button className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Customer
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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {(analyticsStatus === 'loading' && !stats.length
          ? [
              { label: 'Total Customers', value: '…', icon: 'group', change: 'Loading' },
              { label: 'New This Month', value: '…', icon: 'person_add', change: 'Loading' },
              { label: 'Returning Rate', value: '…', icon: 'autorenew', change: 'Loading' },
              { label: 'Avg. Order Value', value: '…', icon: 'payments', change: 'Loading' },
            ]
          : stats
        ).map(({ label, value, icon, change }) => (
          <div key={label} className="glass-panel rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase mb-1">{label}</p>
              <p className="text-headline-md font-bold text-on-background">{value}</p>
              <p className="text-label-caps text-success mt-1">{change}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="table-toolbar">
        <h3 className="text-headline-md text-on-background">All Customers</h3>
        <div className="toolbar-row w-full sm:w-auto">
          <div className="relative w-full sm:w-64 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">search</span>
            <input
              value={filters.search}
              onChange={(e) => dispatch(setCustomerFilters({ search: e.target.value }))}
              className="toolbar-control w-full bg-surface border border-outline-variant/50 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="Search customers..."
            />
          </div>
          <select
            value={filters.filter}
            onChange={(e) => dispatch(setCustomerFilters({ filter: e.target.value }))}
            className="toolbar-control bg-surface text-on-surface border border-outline-variant/50 px-3 text-body-sm font-medium shadow-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="high_value">High Value</option>
            <option value="recent">Recent</option>
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex flex-col shadow-sm overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Customer', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined', 'Status', ''].map((h) => (
                  <th key={h || 'actions'} className="py-3 px-6 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {status === 'loading' && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-on-surface-variant">Loading customers…</td>
                </tr>
              )}
              {status !== 'loading' && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-on-surface-variant">No customers found.</td>
                </tr>
              )}
              {items.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                  className="table-row-hover transition-all duration-200 cursor-pointer"
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold text-body-sm shrink-0">
                        {(customer.name || '?').charAt(0)}
                      </div>
                      <span className="font-medium text-on-surface">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-on-surface-variant">{customer.email}</td>
                  <td className="py-3 px-6 text-on-surface-variant font-mono text-[12px]">{customer.phone || '—'}</td>
                  <td className="py-3 px-6 text-on-surface text-center font-medium">{customer.orders}</td>
                  <td className="py-3 px-6 font-mono font-medium text-on-surface">{customer.spent}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{customer.joined}</td>
                  <td className="py-3 px-6"><StatusBadge status={customer.status} /></td>
                  <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant/50">
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
          onPageChange={(page) => dispatch(setCustomerPage(page))}
        />
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-on-background/40" onClick={() => setAddOpen(false)} aria-label="Close" />
          <div className="relative z-10 w-full max-w-md glass-panel rounded-xl p-6 shadow-lg bg-surface-container-lowest space-y-3">
            <h3 className="text-headline-md text-on-background mb-2">Add Customer</h3>
            {[
              ['fullName', 'Full name'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['city', 'City'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="input-glass w-full rounded-lg py-2.5 px-3 text-body-sm"
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-body-sm border border-outline-variant/50">
                Cancel
              </button>
              <button
                type="button"
                disabled={actionStatus === 'loading'}
                onClick={submitCreate}
                className="px-4 py-2 rounded-lg text-body-sm bg-primary text-on-primary disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </NoShopGate>
    </div>
  );
};

export default CustomersPage;
