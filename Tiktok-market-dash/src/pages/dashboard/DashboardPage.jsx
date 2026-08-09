import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';
import Pagination, { PAGE_SIZE, paginateItems } from '@/components/ui/Pagination';
import {
  clearDashboardError,
  fetchDashboardOverview,
  setDashboardRange,
} from '@/features/dashboard/dashboardSlice';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last14', label: 'Last 14 Days' },
  { key: 'custom', label: 'Custom Range' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const toInputDate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatShortDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const dayCountInclusive = (start, end) =>
  Math.max(1, Math.round((endOfDay(end) - startOfDay(start)) / DAY_MS) + 1);

const getPresetRange = (preset, today = new Date()) => {
  const end = endOfDay(today);
  if (preset === 'today') return { start: startOfDay(today), end };
  if (preset === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { start: startOfDay(y), end: endOfDay(y) };
  }
  if (preset === 'last7') {
    const start = startOfDay(today);
    start.setDate(start.getDate() - 6);
    return { start, end };
  }
  if (preset === 'last14') {
    const start = startOfDay(today);
    start.setDate(start.getDate() - 13);
    return { start, end };
  }
  return { start: startOfDay(today), end };
};

const EARLIEST_STORE_DATA = new Date('2025-11-20T00:00:00');

const StatCard = ({ label, value, change, positive, icon, onClick }) => (
  <button
    onClick={onClick}
    className="glass-panel rounded-xl p-6 flex items-start justify-between hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-full text-left"
  >
    <div>
      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">{label}</p>
      <p className="font-display-lg-mobile text-display-lg-mobile text-on-background font-bold">{value}</p>
      <p className={`font-body-sm text-body-sm mt-1 ${positive ? 'text-success' : 'text-error'}`}>
        {positive ? '↑' : '↓'} {change} vs last month
      </p>
    </div>
    <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
  </button>
);

const formatChartLabel = (value) => {
  const n = Number(value) || 0;
  if (n >= 1) return `$${n}K`;
  if (n > 0) return `$${Math.round(n * 1000)}`;
  return '$0';
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { storeDetails } = useStoreConnection();
  const filterRef = useRef(null);
  const {
    kpis,
    revenue,
    recentOrders: liveOrders,
    lowStockItems,
    storeHealth,
    status,
    error,
  } = useSelector((s) => s.dashboard);

  const storeJoinedDate = useMemo(() => {
    if (storeDetails?.connectedAt) return startOfDay(new Date(storeDetails.connectedAt));
    return startOfDay(EARLIEST_STORE_DATA);
  }, [storeDetails?.connectedAt]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const [preset, setPreset] = useState('today');
  const [range, setRange] = useState(() => getPresetRange('today'));
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(toInputDate(EARLIEST_STORE_DATA));
  const [draftEnd, setDraftEnd] = useState(toInputDate(new Date()));
  const [ordersPage, setOrdersPage] = useState(1);

  useEffect(() => {
    const payload = {
      preset: preset === 'custom' ? 'custom' : preset,
      start: range.start,
      end: range.end,
      limit: 20,
    };
    dispatch(setDashboardRange(payload));
    dispatch(fetchDashboardOverview(payload));
  }, [dispatch, preset, range]);

  useEffect(() => {
    if (!error) return undefined;
    const t = window.setTimeout(() => dispatch(clearDashboardError()), 4000);
    return () => window.clearTimeout(t);
  }, [error, dispatch]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpen(false);
        setCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const filterLabel = useMemo(() => {
    if (preset === 'custom') {
      return `${formatShortDate(range.start)} – ${formatShortDate(range.end)}`;
    }
    return PRESETS.find((p) => p.key === preset)?.label ?? 'Last 7 Days';
  }, [preset, range]);

  const selectPreset = (key) => {
    if (key === 'custom') {
      setDraftStart(toInputDate(storeJoinedDate));
      setDraftEnd(toInputDate(today));
      setCustomOpen(true);
      return;
    }
    setPreset(key);
    setRange(getPresetRange(key, today));
    setCustomOpen(false);
    setOpen(false);
  };

  const applyCustomRange = () => {
    let start = startOfDay(new Date(draftStart));
    let end = endOfDay(new Date(draftEnd));
    if (start < storeJoinedDate) start = storeJoinedDate;
    if (end > endOfDay(today)) end = endOfDay(today);
    if (start > end) start = startOfDay(end);
    setPreset('custom');
    setRange({ start, end });
    setCustomOpen(false);
    setOpen(false);
  };

  const stats = useMemo(() => {
    const cards = kpis?.cards;
    if (cards?.length) {
      return cards.map((card) => {
        if (card.id === 'revenue' && kpis?.roas != null) {
          return {
            ...card,
            change: `ROAS ${kpis.roas}x · ${card.change}`,
            positive: true,
          };
        }
        if (card.id === 'orders' && kpis?.conversionRateFormatted) {
          return {
            ...card,
            change: `Conv ${kpis.conversionRateFormatted} · ${card.change}`,
          };
        }
        if (card.id === 'products' && storeHealth) {
          return {
            ...card,
            change: [
              kpis?.inventoryValueFormatted ? `Value ${kpis.inventoryValueFormatted}` : card.change,
              storeHealth.lowStockCount != null ? `${storeHealth.lowStockCount} low` : null,
              storeHealth.outOfStockCount != null ? `${storeHealth.outOfStockCount} out` : null,
            ]
              .filter(Boolean)
              .join(' · '),
            positive: true,
          };
        }
        if (card.id === 'customers' && kpis) {
          return {
            ...card,
            change: [
              card.change,
              kpis.averageOrderValueFormatted ? `AOV ${kpis.averageOrderValueFormatted}` : null,
            ]
              .filter(Boolean)
              .join(' · '),
          };
        }
        return card;
      });
    }

    return [
      { id: 'revenue', label: 'Total Revenue', value: '…', change: 'Loading', positive: true, icon: 'payments', route: ROUTES.ORDERS },
      { id: 'orders', label: 'Total Orders', value: '…', change: 'Loading', positive: true, icon: 'shopping_cart', route: ROUTES.ORDERS },
      { id: 'products', label: 'Active Products', value: '…', change: 'Loading', positive: true, icon: 'inventory_2', route: ROUTES.PRODUCTS },
      { id: 'customers', label: 'Total Customers', value: '…', change: 'Loading', positive: true, icon: 'group', route: ROUTES.CUSTOMERS },
    ];
  }, [kpis, storeHealth]);

  const chartBars = useMemo(() => {
    if (revenue?.labels?.length && revenue?.values?.length) {
      return {
        labels: revenue.labels,
        values: revenue.values,
        max: revenue.max || Math.max(...revenue.values, 1),
      };
    }
    const days = dayCountInclusive(range.start, range.end);
    const count = Math.min(Math.max(days, 1), 14);
    return {
      labels: Array.from({ length: count }, (_, i) => {
        const d = new Date(range.start);
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      values: Array.from({ length: count }, () => 0),
      max: 1,
    };
  }, [revenue, range]);

  const recentOrders = liveOrders || [];

  useEffect(() => {
    setOrdersPage(1);
  }, [range, recentOrders.length]);

  const pagedOrders = paginateItems(recentOrders, ordersPage, PAGE_SIZE);

  const chartSubtitle = useMemo(() => {
    if (preset === 'today' || preset === 'yesterday') return 'Daily performance';
    if (preset === 'last7') return 'Last 7 days performance trend';
    if (preset === 'last14') return 'Last 14 days performance trend';
    return `${formatShortDate(range.start)} – ${formatShortDate(range.end)}`;
  }, [preset, range]);

  const outOfStockCount = storeHealth?.outOfStockCount;

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">Business Command Center</p>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background">Dashboard</h2>
        </div>
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              setCustomOpen(false);
            }}
            className="toolbar-control flex items-center gap-2 px-3 rounded-lg border border-outline-variant/50 bg-surface text-on-surface hover:bg-surface-variant/30 transition-colors font-body-sm text-body-sm font-medium shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">date_range</span>
            {filterLabel}
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
          </button>

          {open && !customOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-50">
              {PRESETS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectPreset(key)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left font-body-sm text-body-sm transition-colors ${
                    preset === key
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-on-surface hover:bg-surface-variant/40'
                  }`}
                >
                  {label}
                  {preset === key && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {customOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 glass-panel rounded-xl shadow-lg border border-outline-variant/20 p-4 z-50 space-y-3">
              <p className="font-body-sm text-body-sm font-medium text-on-surface">Custom Range</p>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Start date</label>
                <input
                  type="date"
                  value={draftStart}
                  min={toInputDate(storeJoinedDate)}
                  max={draftEnd}
                  onChange={(e) => setDraftStart(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2 px-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">End date</label>
                <input
                  type="date"
                  value={draftEnd}
                  min={draftStart}
                  max={toInputDate(today)}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2 px-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Available from {formatShortDate(storeJoinedDate)} to {formatShortDate(today)}
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface text-on-surface hover:bg-surface-variant/30 transition-colors font-body-sm text-body-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCustomRange}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-surface-tint transition-colors font-body-sm text-body-sm font-medium shadow-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-body-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            {...stat}
            onClick={() => navigate(stat.route)}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="xl:col-span-2 glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-background">Revenue Overview</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{chartSubtitle}</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.ANALYTICS)}
              className="flex items-center gap-1 font-body-sm text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
            >
              View Analytics
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* Chart Area */}
          <div className="h-44 rounded-lg flex items-end gap-2 px-2 bg-chart-area border border-outline-variant/20">
            {status === 'loading' && !revenue ? (
              <p className="w-full text-center text-body-sm text-on-surface-variant self-center">Loading chart…</p>
            ) : (
              chartBars.values.map((h, i) => (
                <div key={`${chartBars.labels[i]}-${i}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end pb-1 min-w-0">
                  <span className="text-label-caps text-chart-label text-[9px]">{formatChartLabel(h)}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/50 transition-all duration-500 hover:from-primary/80"
                    style={{ height: `${Math.max((h / chartBars.max) * 90, 4)}%` }}
                  />
                  <span className="text-label-caps text-chart-label text-[9px] truncate w-full text-center">
                    {chartBars.labels[i]}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Low Stock Alert */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-background">Low Stock</h3>
              {outOfStockCount != null && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {outOfStockCount} out of stock
                  {storeHealth?.inventoryHealth != null
                    ? ` · Health ${storeHealth.inventoryHealth}%`
                    : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate(ROUTES.INVENTORY)}
              className="font-body-sm text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(lowStockItems?.length ? lowStockItems : []).map((item) => (
              <div
                key={item.sku}
                onClick={() => navigate(ROUTES.INVENTORY)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-body-sm text-body-sm font-medium text-on-surface">{item.name}</p>
                  <p className="font-label-caps text-label-caps text-outline mt-0.5">{item.sku}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                  <span className="font-mono text-body-sm font-medium text-error">{item.stock}</span>
                </div>
              </div>
            ))}
            {!lowStockItems?.length && (
              <p className="text-body-sm text-on-surface-variant py-2">No low-stock items.</p>
            )}
          </div>
          <button
            onClick={() => navigate(ROUTES.INVENTORY)}
            className="mt-4 w-full py-2 border border-outline-variant/50 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-variant/30 transition-colors"
          >
            Manage Inventory
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-outline-variant/20">
          <h3 className="font-headline-md text-headline-md text-on-background">Recent Orders</h3>
          <button
            onClick={() => navigate(ROUTES.ORDERS)}
            className="flex items-center gap-1 font-body-sm text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
          >
            View All Orders
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map((col) => (
                  <th key={col} className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant/10">
              {status === 'loading' && recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-on-surface-variant">Loading orders…</td>
                </tr>
              )}
              {status !== 'loading' && recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-on-surface-variant">No orders in this range.</td>
                </tr>
              )}
              {pagedOrders.map((order) => (
                <tr
                  key={order.orderId || order.id}
                  onClick={() => navigate(`/dashboard/orders/${order.orderId || order.id}`)}
                  className="table-row-hover transition-all duration-200 cursor-pointer"
                >
                  <td className="py-3 px-6 font-mono text-primary font-medium">{order.id}</td>
                  <td className="py-3 px-6 text-on-surface">{order.customer}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{order.product}</td>
                  <td className="py-3 px-6 font-mono font-medium text-on-surface">{order.amount}</td>
                  <td className="py-3 px-6"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-6 text-on-surface-variant">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination current={ordersPage} total={recentOrders.length} pageSize={PAGE_SIZE} onPageChange={setOrdersPage} />
      </div>
    </div>
  );
};

export default DashboardPage;
