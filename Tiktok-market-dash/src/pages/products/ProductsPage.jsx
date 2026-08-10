import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE } from '@/components/ui/Pagination';
import FilterTabs from '@/components/ui/FilterTabs';
import ProductImage from '@/components/ui/ProductImage';
import NoShopGate from '@/components/ui/NoShopGate';
import {
  clearProductFilters,
  fetchProductCategories,
  fetchProductsList,
  setProductFilters,
  setProductPage,
} from '@/features/products/productsSlice';

const STOCK_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const SORT_OPTIONS = [
  { value: 'updated:desc', label: 'Recently updated' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'price:asc', label: 'Price: low to high' },
  { value: 'price:desc', label: 'Price: high to low' },
  { value: 'stock:asc', label: 'Stock: low to high' },
  { value: 'stock:desc', label: 'Stock: high to low' },
];

const emptyDraft = (filters) => ({
  search: filters.search || '',
  category: filters.category || 'all',
  minPrice: filters.minPrice ?? '',
  maxPrice: filters.maxPrice ?? '',
  stockStatus: filters.stockStatus || 'all',
  sortBy: filters.sortBy || 'updated',
  sortOrder: filters.sortOrder || 'desc',
});

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    items,
    counts,
    categories,
    filters,
    pagination,
    status,
    error,
    lowStockThreshold,
  } = useSelector((state) => state.products);
  const selectedShopId = useSelector((state) => state.integrations?.selectedShopId);
  const [selectedIds, setSelectedIds] = useState([]);
  /** Panel visibility only — local to this page; never persisted globally. */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(() => emptyDraft(filters));
  const [filterError, setFilterError] = useState(null);
  const filterPanelRef = useRef(null);
  const filterToggleRef = useRef(null);

  const tabs = useMemo(
    () => [
      { key: 'all', label: 'All', count: counts.all },
      { key: 'active', label: 'Active', count: counts.active },
      { key: 'draft', label: 'Draft', count: counts.draft },
      { key: 'archived', label: 'Archived', count: counts.archived },
    ],
    [counts]
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.search?.trim()) n += 1;
    if (filters.category && filters.category !== 'all') n += 1;
    if (filters.minPrice !== '' && filters.minPrice != null) n += 1;
    if (filters.maxPrice !== '' && filters.maxPrice != null) n += 1;
    if (filters.stockStatus && filters.stockStatus !== 'all') n += 1;
    return n;
  }, [filters]);

  useEffect(() => {
    dispatch(fetchProductCategories());
  }, [dispatch, selectedShopId]);

  useEffect(() => {
    dispatch(fetchProductsList());
  }, [
    dispatch,
    filters.search,
    filters.status,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.stockStatus,
    filters.sortBy,
    filters.sortOrder,
    filters.range,
    pagination.page,
    selectedShopId,
  ]);

  useEffect(() => {
    setDraft(emptyDraft(filters));
  }, [filters]);

  // Close panel whenever this Products list route changes or remounts after navigation.
  useEffect(() => {
    setFiltersOpen(false);
  }, [location.pathname]);

  // Escape + click-outside while the panel is open.
  useEffect(() => {
    if (!filtersOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setFiltersOpen(false);
    };

    const onPointerDown = (e) => {
      const target = e.target;
      if (filterPanelRef.current?.contains(target)) return;
      if (filterToggleRef.current?.contains(target)) return;
      setFiltersOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [filtersOpen]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyFilters = () => {
    const minRaw = String(draft.minPrice ?? '').trim();
    const maxRaw = String(draft.maxPrice ?? '').trim();
    const min = minRaw === '' ? '' : Number(minRaw);
    const max = maxRaw === '' ? '' : Number(maxRaw);

    if (minRaw !== '' && (!Number.isFinite(min) || min < 0)) {
      setFilterError('Minimum price must be a non-negative number.');
      return;
    }
    if (maxRaw !== '' && (!Number.isFinite(max) || max < 0)) {
      setFilterError('Maximum price must be a non-negative number.');
      return;
    }
    if (min !== '' && max !== '' && min > max) {
      setFilterError('Minimum price cannot be greater than maximum price.');
      return;
    }

    setFilterError(null);
    dispatch(
      setProductFilters({
        search: draft.search.trim(),
        category: draft.category || 'all',
        minPrice: min === '' ? '' : min,
        maxPrice: max === '' ? '' : max,
        stockStatus: draft.stockStatus || 'all',
        sortBy: draft.sortBy || 'updated',
        sortOrder: draft.sortOrder || 'desc',
      })
    );
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setFilterError(null);
    dispatch(clearProductFilters());
    setDraft(emptyDraft({ ...filters, search: '', category: 'all', minPrice: '', maxPrice: '', stockStatus: 'all' }));
  };

  const sortValue = `${draft.sortBy || 'updated'}:${draft.sortOrder || 'desc'}`;

  const stockDotClass = (product) => {
    if (product.stock == null) return 'bg-outline';
    if (product.stock <= 0) return 'bg-error';
    if (product.stock <= (product.lowStockThreshold ?? lowStockThreshold ?? 10)) return 'bg-warning';
    return 'bg-secondary';
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
      </div>

      <NoShopGate description="Connect your TikTok Shop to start managing products.">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
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
              value={draft.search}
              onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
              className="toolbar-control w-full bg-surface border border-outline-variant/50 pl-9 pr-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="Search name, SKU, or ID…"
              type="text"
            />
          </div>
          <button
            ref={filterToggleRef}
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="product-filters-panel"
            className={`toolbar-control inline-flex items-center justify-center gap-1.5 border px-2.5 font-body-sm text-body-sm font-medium transition-colors shadow-sm shrink-0 ${
              filtersOpen || activeFilterCount
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-surface text-on-surface border-outline-variant/50 hover:bg-surface-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            <span className="hidden sm:inline">
              {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filters'}
            </span>
            {activeFilterCount > 0 && (
              <span className="sm:hidden min-w-[1.1rem] h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-semibold inline-flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div
          id="product-filters-panel"
          ref={filterPanelRef}
          className="glass-panel rounded-xl p-4 border border-outline-variant/20 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-body-md font-semibold text-on-background">Product filters</h3>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Low stock uses your threshold of {lowStockThreshold}. Selected shop is unchanged when you clear filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface transition-colors shrink-0"
              aria-label="Close filters"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Category</label>
              <select
                value={draft.category || 'all'}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Stock</label>
              <select
                value={draft.stockStatus || 'all'}
                onChange={(e) => setDraft((d) => ({ ...d, stockStatus: e.target.value }))}
                className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {STOCK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Min price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.minPrice}
                onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
                placeholder="0"
                className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Max price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.maxPrice}
                onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
                placeholder="Any"
                className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Sort</label>
              <select
                value={sortValue}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split(':');
                  setDraft((d) => ({ ...d, sortBy, sortOrder }));
                }}
                className="w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-body-sm text-on-surface-variant pb-2">
                Product type is not a separate field in this catalog — use Category instead.
              </p>
            </div>
          </div>

          {filterError && (
            <div className="rounded-lg border border-error/30 bg-error-container/40 text-on-error-container px-3 py-2 text-body-sm">
              {filterError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 px-3 rounded-lg border border-outline-variant/50 text-body-sm font-medium text-on-surface hover:bg-surface-variant/30 transition-colors"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="h-9 px-3 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

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
                      <ProductImage
                        src={product.image}
                        name={product.name}
                        size="xs"
                        rounded="rounded"
                      />
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
                        <span className={`w-1.5 h-1.5 rounded-full ${stockDotClass(product)}`} />
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
      </NoShopGate>
    </div>
  );
};

export default ProductsPage;
