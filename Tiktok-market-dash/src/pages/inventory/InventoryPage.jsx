import { useState } from 'react';
import { mockInventory, inventoryStats } from '@/data/mockInventory';
import StatusBadge from '@/components/ui/StatusBadge';

const InventoryPage = () => {
  const [search, setSearch] = useState('');

  const filtered = mockInventory.filter(
    (item) =>
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const stockPercent = (item) => {
    if (item.inStock === 0) return 0;
    const max = Math.max(item.inStock + item.reserved, item.reorderPoint * 4);
    return Math.round((item.inStock / max) * 100);
  };

  const barColor = (item) => {
    if (item.inStock === 0) return 'bg-error';
    if (item.inStock <= item.reorderPoint) return 'bg-[#b06000]';
    return 'bg-primary';
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
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
          <button className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Restock
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {inventoryStats.map(({ label, value, icon, change, alert }) => (
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

      {/* Table Card */}
      <div className="glass-panel rounded-xl flex flex-col shadow-sm">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-headline-md text-on-background">Stock Levels</h3>
          <div className="relative w-full sm:w-64 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 rounded-lg py-1.5 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="Search inventory..."
            />
          </div>
        </div>

        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap" style={{ minWidth: '780px' }}>
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Product', 'SKU', 'Category', 'In Stock', 'Reserved', 'Reorder Pt', 'Stock Level', 'Status'].map((h) => (
                  <th key={h} className="py-3 px-4 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {filtered.map((item) => (
                <tr key={item.id} className="table-row-hover transition-all duration-200">
                  <td className="py-3 px-4 font-medium text-on-surface max-w-[180px] truncate">{item.name}</td>
                  <td className="py-3 px-4 font-mono text-on-surface-variant text-[12px]">{item.sku}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-semibold ${item.inStock === 0 ? 'text-error' : item.inStock <= item.reorderPoint ? 'text-[#b06000]' : 'text-on-surface'}`}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Low stock alert banner */}
        {filtered.some((i) => i.inStock <= i.reorderPoint) && (
          <div className="m-4 p-4 bg-[#fef3c7] border border-[#fde68a] rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-[#b06000]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <p className="text-body-sm font-semibold text-[#b06000]">Low Stock Alert</p>
              <p className="text-body-sm text-[#b06000]/80 mt-0.5">
                {filtered.filter((i) => i.inStock <= i.reorderPoint && i.inStock > 0).length} items are below reorder point and{' '}
                {filtered.filter((i) => i.inStock === 0).length} are out of stock. Consider restocking soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
