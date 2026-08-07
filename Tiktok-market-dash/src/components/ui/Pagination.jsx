export const PAGE_SIZE = 10;

export const paginateItems = (items, page, pageSize = PAGE_SIZE) => {
  const start = (Math.max(1, page) - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

const getVisiblePages = (current, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 3) return [1, 2, 3, '…', totalPages];
  if (current >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages];
  return [1, '…', current - 1, current, current + 1, '…', totalPages];
};

const Pagination = ({ current = 1, total = 0, pageSize = PAGE_SIZE, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, current), totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = getVisiblePages(page, totalPages);

  return (
    <div className="p-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-body-sm font-body-sm text-on-surface-variant bg-surface-container-low/30">
      <div>
        Showing <span className="font-medium text-on-surface">{from}</span> to{' '}
        <span className="font-medium text-on-surface">{to}</span> of{' '}
        <span className="font-medium text-on-surface">{total}</span> results
      </div>
      <div className="flex gap-1 flex-wrap">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 bg-surface hover:bg-surface-variant/50 disabled:opacity-50 transition-colors"
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center">…</span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange?.(p)}
              className={`w-8 h-8 flex items-center justify-center rounded border font-medium transition-colors ${
                p === page
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant/30 bg-surface hover:bg-surface-variant/50 hover:text-on-surface'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 bg-surface hover:bg-surface-variant/50 disabled:opacity-50 transition-colors"
          aria-label="Next page"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
