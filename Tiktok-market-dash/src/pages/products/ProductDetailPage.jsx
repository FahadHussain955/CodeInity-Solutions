import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import ProductImage from '@/components/ui/ProductImage';
import {
  clearSelectedProduct,
  fetchProductById,
  fetchProductPerformance,
  setPerformanceRange,
} from '@/features/products/productsSlice';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '14d', label: 'Last 14 Days' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom Range' },
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filterRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');

  const {
    selected: product,
    performance,
    detailStatus,
    performanceStatus,
    filters,
    error,
  } = useSelector((state) => state.products);

  useEffect(() => {
    if (!id) return undefined;
    dispatch(fetchProductById(id));
    dispatch(fetchProductPerformance({ id }));
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProductPerformance({ id }));
  }, [id, dispatch, filters.range, filters.start, filters.end]);

  useEffect(() => {
    if (!open && !customOpen) return undefined;
    const onDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpen(false);
        setCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, customOpen]);

  const filterLabel = useMemo(() => {
    const preset = PRESETS.find((p) => p.key === filters.range);
    if (filters.range === 'custom' && filters.start && filters.end) {
      return `${filters.start} → ${filters.end}`;
    }
    return preset?.label || 'All Time';
  }, [filters]);

  const selectPreset = (key) => {
    if (key === 'custom') {
      setCustomOpen(true);
      setOpen(false);
      return;
    }
    dispatch(setPerformanceRange({ range: key, start: null, end: null }));
    setOpen(false);
  };

  const applyCustom = () => {
    if (!draftStart || !draftEnd) return;
    dispatch(setPerformanceRange({ range: 'custom', start: draftStart, end: draftEnd }));
    setCustomOpen(false);
  };

  const chartSeries = performance?.revenueTrend || [];
  const maxRevenue = Math.max(1, ...chartSeries.map((p) => Number(p.revenue) || 0));
  const maxUnits = Math.max(1, ...((performance?.salesTrend || []).map((p) => Number(p.unitsSold) || 0)));
  const maxProfit = Math.max(
    1,
    ...((performance?.profitTrend || []).map((p) => Math.abs(Number(p.profit) || 0)))
  );

  if (detailStatus === 'loading' && !product) {
    return <div className="py-16 text-center text-on-surface-variant text-body-sm">Loading product…</div>;
  }

  if (!product) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-on-surface-variant text-body-sm">{error || 'Product not found.'}</p>
        <button type="button" onClick={() => navigate(ROUTES.PRODUCTS)} className="text-primary text-body-sm">
          Back to products
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Units Sold',
      value: performance ? `${(performance.unitsSold || 0).toLocaleString()} units` : '—',
      icon: 'shopping_bag',
    },
    {
      label: 'Revenue',
      value: performance?.grossSalesFormatted || '$0.00',
      icon: 'payments',
    },
    {
      label: 'Cost (COGS)',
      value: performance?.cogsFormatted || '$0.00',
      icon: 'account_balance_wallet',
    },
    {
      label: 'Profit',
      value: performance?.grossProfitFormatted || '$0.00',
      icon: 'trending_up',
    },
    {
      label: 'Profit Margin',
      value: performance?.profitMarginLabel || '—',
      icon: 'percent',
    },
    {
      label: 'Orders',
      value: performance ? `${performance.ordersCount || 0} orders` : '—',
      icon: 'receipt_long',
    },
    {
      label: 'Avg. Selling Price',
      value: performance?.averageSellingPriceFormatted || '—',
      icon: 'sell',
    },
  ];

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button type="button" onClick={() => navigate(ROUTES.PRODUCTS)} className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors">
              Products
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">{product.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-display-lg-mobile text-on-background">{product.name}</h2>
            <StatusBadge status={product.status} />
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {product.sku} · {product.category} · Cost {product.costPriceFormatted}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
                      filters.range === key ? 'bg-primary/5 text-primary font-medium' : 'text-on-surface hover:bg-surface-variant/40'
                    }`}
                  >
                    {label}
                    {filters.range === key && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                ))}
              </div>
            )}
            {customOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 glass-panel rounded-xl shadow-lg border border-outline-variant/20 p-4 z-50 space-y-3">
                <p className="font-body-sm text-body-sm font-medium text-on-surface">Custom Range</p>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Start date</label>
                  <input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2 px-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">End date</label>
                  <input type="date" value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2 px-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setCustomOpen(false)} className="px-3 py-1.5 rounded-lg border border-outline-variant/50 text-body-sm">Cancel</button>
                  <button type="button" onClick={applyCustom} className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-body-sm font-medium">Apply</button>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
            className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-body-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div>
            <h3 className="text-headline-md text-on-background mb-4">Product Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon }) => (
                <div key={label} className="glass-panel rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{icon}</span>
                    <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
                  </div>
                  <p className="text-headline-md font-bold text-on-background">
                    {performanceStatus === 'loading' && !performance ? '…' : value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-background">Sales Performance</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Revenue, units, and profit over the selected range
                </p>
              </div>
            </div>
            <div className="h-44 rounded-lg flex items-end gap-1.5 px-2 bg-chart-area border border-outline-variant/20">
              {!chartSeries.length && (
                <div className="w-full h-full flex items-center justify-center text-body-sm text-on-surface-variant">
                  No sales in this range
                </div>
              )}
              {chartSeries.map((point, idx) => {
                const revH = Math.max(4, (Number(point.revenue) / maxRevenue) * 100);
                const units = performance?.salesTrend?.[idx]?.unitsSold || 0;
                const profit = performance?.profitTrend?.[idx]?.profit || 0;
                const unitsH = Math.max(2, (units / maxUnits) * 70);
                const profitH = Math.max(2, (Math.abs(profit) / maxProfit) * 70);
                return (
                  <div key={point.date || idx} className="flex-1 flex flex-col items-center justify-end gap-0.5 h-full min-w-0" title={`${point.label}: ${point.revenueFormatted || ''}`}>
                    <div className="w-full flex items-end justify-center gap-0.5 h-[85%]">
                      <div className="w-[28%] rounded-t bg-primary/80" style={{ height: `${revH}%` }} />
                      <div className="w-[28%] rounded-t bg-secondary/70" style={{ height: `${unitsH}%` }} />
                      <div className={`w-[28%] rounded-t ${profit >= 0 ? 'bg-success/70' : 'bg-error/70'}`} style={{ height: `${profitH}%` }} />
                    </div>
                    <span className="text-[9px] text-outline truncate w-full text-center">{point.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-label-caps text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-primary/80" /> Revenue</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-secondary/70" /> Units</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-success/70" /> Profit</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Product Details</h3>
            <div className="space-y-3 divide-y divide-outline-variant/10">
              {[
                ['SKU', product.sku],
                ['Category', product.category],
                ['Selling Price', product.priceFormatted],
                ['Cost Price', product.costPriceFormatted],
                ['Stock', product.stock ?? '—'],
                ['Status', product.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 first:pt-0">
                  <span className="text-body-sm text-on-surface-variant">{label}</span>
                  <span className="text-body-sm font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden p-3 sm:p-4">
            <ProductImage
              src={product.image}
              name={product.name}
              size="lg"
              rounded="rounded-lg"
              lazy={false}
              className="mx-auto border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
