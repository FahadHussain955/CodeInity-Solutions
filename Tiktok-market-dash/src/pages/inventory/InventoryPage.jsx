import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE } from '@/components/ui/Pagination';
import {
  clearInventoryNotice,
  fetchInventoryAnalytics,
  fetchInventoryList,
  restockInventory,
  setInventoryFilters,
  setInventoryPage,
} from '@/features/inventory/inventorySlice';

const InventoryPage = () => {
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
  } = useSelector((state) => state.inventory);

  const [restockOpen, setRestockOpen] = useState(false);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('10');

  useEffect(() => {
    dispatch(fetchInventoryList());
    dispatch(fetchInventoryAnalytics());
  }, [dispatch, filters.search, filters.status, filters.sort, pagination.page]);

  useEffect(() => {
    if (!notice && !error) return undefined;
    const t = window.setTimeout(() => dispatch(clearInventoryNotice()), 3500);
    return () => window.clearTimeout(t);
  }, [notice, error, dispatch]);

  const stats = analytics?.cards || [];
  const lowCount = analytics?.lowStockCount || 0;
  const outCount = analytics?.outOfStockCount || 0;

  const stockPercent = (item) => {
    if (item.inStock === 0) return 0;
    const max = Math.max(item.inStock + item.reserved, item.reorderPoint * 4);
    return Math.round((item.inStock / max) * 100);
  };

  const barColor = (item) => {
    if (item.inStock === 0) return 'bg-error';
    if (item.inStock <= item.reorderPoint) return 'bg-warning';
    return 'bg-primary';
  };

  const openRestock = (id) => {
    setRestockId(id);
    setRestockQty('10');
    setRestockOpen(true);
  };

  const submitRestock = async () => {
    if (!restockId) return;
    const quantity = Number.parseInt(restockQty, 10);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    await dispatch(restockInventory({ id: restockId, quantity }));
    setRestockOpen(false);
    dispatch(fetchInventoryList());
    dispatch(fetchInventoryAnalytics());
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">Store</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Inventory</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Inventory</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={() => openRestock(items[0]?.id)}
            disabled={!items[0]}
            className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Restock
          </button>
        </div>
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
              { label: 'Total SKUs', value: '…', icon: 'inventory_2', change: 'Loading' },
              { label: 'Low Stock Items', value: '…', icon: 'warning', change: 'Loading', alert: true },
              { label: 'Out of Stock', value: '…', icon: 'remove_shopping_cart', change: 'Loading', alert: true },
              { label: 'Total Units', value: '…', icon: 'stacked_bar_chart', change: 'Loading' },
            ]
          : stats
        ).map(({ label, value, icon, change, alert }) => (
          <div key={label} className="glass-panel rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase mb-1">{label}</p>
              <p className="text-headline-md font-bold text-on-background">{value}</p>
              <p className={`text-label-caps mt-1 ${alert ? 'text-error' : 'text-on-surface-variant'}`}>{change}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="table-toolbar">
        <h3 className="text-headline-md text-on-background">Stock Levels</h3>
        <div className="toolbar-row w-full sm:w-auto">
          <div className="relative w-full sm:w-64 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">search</span>
            <input
              value={filters.search}
              onChange={(e) => dispatch(setInventoryFilters({ search: e.target.value }))}
              className="toolbar-control w-full bg-surface border border-outline-variant/50 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="Search inventory..."
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => dispatch(setInventoryFilters({ status: e.target.value }))}
            className="toolbar-control bg-surface text-on-surface border border-outline-variant/50 px-3 text-body-sm font-medium shadow-sm"
          >
            <option value="all">All</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstocked">Overstocked</option>
          </select>
        </div>
      </div>

      {(lowCount > 0 || outCount > 0) && (
        <div className="p-4 bg-warning-bg border border-warning-border rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div>
            <p className="text-body-sm font-semibold text-warning">Low Stock Alert</p>
            <p className="text-body-sm text-warning/80 mt-0.5">
              {lowCount} items are below reorder point and {outCount} are out of stock. Consider restocking soon.
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-xl flex flex-col shadow-sm overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Product', 'SKU', 'Category', 'In Stock', 'Reserved', 'Reorder Pt', 'Stock Level', 'Status', ''].map((h) => (
                  <th key={h || 'actions'} className="py-3 px-4 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {status === 'loading' && items.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-on-surface-variant">Loading inventory…</td>
                </tr>
              )}
              {status !== 'loading' && items.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-on-surface-variant">No inventory records found.</td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="table-row-hover transition-all duration-200">
                  <td className="py-3 px-4 font-medium text-on-surface max-w-[180px] truncate">{item.name}</td>
                  <td className="py-3 px-4 font-mono text-on-surface-variant text-[12px]">{item.sku}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-semibold ${item.inStock === 0 ? 'text-error' : item.inStock <= item.reorderPoint ? 'text-warning' : 'text-on-surface'}`}>
                      {item.inStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-on-surface-variant">{item.reserved}</td>
                  <td className="py-3 px-4 font-mono text-on-surface-variant">{item.reorderPoint}</td>
                  <td className="py-3 px-4" style={{ minWidth: '140px' }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor(item)}`}
                          style={{ width: `${stockPercent(item)}%` }}
                        />
                      </div>
                      <span className="text-label-caps text-on-surface-variant w-8 text-right shrink-0">{stockPercent(item)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => openRestock(item.id)}
                      className="text-primary hover:text-primary-fixed-variant text-label-caps font-medium"
                    >
                      Restock
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
          onPageChange={(page) => dispatch(setInventoryPage(page))}
        />
      </div>

      {restockOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-on-background/40" onClick={() => setRestockOpen(false)} aria-label="Close" />
          <div className="relative z-10 w-full max-w-md glass-panel rounded-xl p-6 shadow-lg bg-surface-container-lowest">
            <h3 className="text-headline-md text-on-background mb-4">Restock Product</h3>
            <label className="block text-label-caps text-on-surface-variant uppercase mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="input-glass w-full rounded-lg py-2.5 px-3 text-body-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRestockOpen(false)} className="px-4 py-2 rounded-lg text-body-sm border border-outline-variant/50">
                Cancel
              </button>
              <button
                type="button"
                disabled={actionStatus === 'loading'}
                onClick={submitRestock}
                className="px-4 py-2 rounded-lg text-body-sm bg-primary text-on-primary disabled:opacity-60"
              >
                {actionStatus === 'loading' ? 'Saving…' : 'Confirm Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
