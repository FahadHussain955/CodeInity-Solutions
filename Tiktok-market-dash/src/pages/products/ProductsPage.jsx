import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE } from '@/components/ui/Pagination';
import FilterTabs from '@/components/ui/FilterTabs';
import {
  fetchProductsList,
  setProductFilters,
  setProductPage,
} from '@/features/products/productsSlice';

const ProductsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items,
    counts,
    filters,
    pagination,
    status,
    error,
  } = useSelector((state) => state.products);
  const [selectedIds, setSelectedIds] = useState([]);

  const tabs = useMemo(
    () => [
      { key: 'all', label: 'All', count: counts.all },
      { key: 'active', label: 'Active', count: counts.active },
      { key: 'draft', label: 'Draft', count: counts.draft },
      { key: 'archived', label: 'Archived', count: counts.archived },
    ],
    [counts]
  );

  useEffect(() => {
    dispatch(fetchProductsList());
  }, [dispatch, filters.search, filters.status, filters.range, pagination.page]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Catalog</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">Products</span>
          </div>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background">Products</h2>
        </div>
        <div className="toolbar-row">
          <button type="button" className="toolbar-control flex items-center justify-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 font-body-sm text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PRODUCT_NEW)}
            className="toolbar-control flex items-center justify-center gap-2 bg-primary text-on-primary px-4 font-body-sm text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-body-sm">
          {error}
        </div>
      )}

      <div className="table-toolbar">
        <FilterTabs
          tabs={tabs}
          value={filters.status}
          onChange={(status) => dispatch(setProductFilters({ status }))}
        />
        <div className="toolbar-row w-full lg:w-auto">
          <div className="relative w-full lg:w-64 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">search</span>
            <input
              value={filters.search}
              onChange={(e) => dispatch(setProductFilters({ search: e.target.value }))}
              className="toolbar-control w-full bg-surface border border-outline-variant/50 pl-9 pr-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="Filter products..."
              type="text"
            />
          </div>
          <button type="button" className="toolbar-control flex items-center justify-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-3 font-body-sm text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex flex-col shadow-sm overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                <th className="py-2 px-4 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-outline-variant/50 text-primary focus:ring-primary/20 bg-transparent"
                    onChange={(e) => setSelectedIds(e.target.checked ? items.map((p) => p.id) : [])}
                    checked={selectedIds.length === items.length && items.length > 0}
                  />
                </th>
                {['Product', 'SKU', 'Category', 'Stock', 'Price', 'Sold', 'Profit', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold ${
                      h === 'Stock' || h === 'Price' || h === 'Sold' || h === 'Profit' ? 'text-right' : h === 'Status' ? 'text-center' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant/10">
              {status === 'loading' && !items.length && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-on-surface-variant">Loading products…</td>
                </tr>
              )}
              {!items.length && status !== 'loading' && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-on-surface-variant">No products found.</td>
                </tr>
              )}
              {items.map((product) => (
                <tr
                  key={product.id}
                  className={`table-row-hover transition-all duration-200 cursor-pointer ${product.aiOptimized ? 'ai-glow bg-surface/30' : ''}`}
                  onClick={() => navigate(`/dashboard/products/${product.id}`)}
                >
                  <td className="py-1.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant/50 text-primary focus:ring-primary/20 bg-surface"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                    />
                  </td>
                  <td className="py-1.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border border-outline-variant/20 overflow-hidden bg-surface-container-lowest shrink-0 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-outline text-[18px]">image</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-on-surface truncate">{product.name}</span>
                          {product.aiOptimized && (
                            <span className="material-symbols-outlined text-[14px] text-primary shrink-0" title="AI Optimized Listing">auto_awesome</span>
                          )}
                        </div>
                        <span className="text-outline text-[11px]">Updated {product.updatedLabel || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-1.5 px-4 font-mono text-on-surface-variant">{product.sku}</td>
                  <td className="py-1.5 px-4 text-on-surface-variant">{product.category}</td>
                  <td className="py-1.5 px-4 text-right font-mono text-on-surface">
                    {product.stock !== null && product.stock !== undefined ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${product.stock < 20 ? 'bg-error' : 'bg-secondary'}`} />
                        {product.stock}
                      </span>
                    ) : (
                      <span className="text-outline">-</span>
                    )}
                  </td>
                  <td className="py-1.5 px-4 text-right font-mono font-medium text-on-surface">
                    {product.priceFormatted || `$${Number(product.price || 0).toFixed(2)}`}
                  </td>
                  <td className="py-1.5 px-4 text-right font-mono text-on-surface">
                    {product.performance?.unitsSold ?? 0}
                  </td>
                  <td className="py-1.5 px-4 text-right font-mono text-on-surface">
                    <div className="flex flex-col items-end">
                      <span>{product.performance?.grossProfitFormatted || '$0.00'}</span>
                      <span className="text-[11px] text-on-surface-variant">
                        {product.performance?.profitMarginLabel || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="py-1.5 px-4 text-center"><StatusBadge status={product.status} /></td>
                  <td className="py-1.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant/50">
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
          onPageChange={(page) => dispatch(setProductPage(page))}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
