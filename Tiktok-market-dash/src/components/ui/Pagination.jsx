const Pagination = ({ current = 1, total = 1, onPageChange }) => {
  const pages = Array.from({ length: Math.min(total, 3) }, (_, i) => i + 1);

  return (
    <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant bg-surface-container-low/30">
      <div>
        Showing <span className="font-medium text-on-surface">1</span> to{' '}
        <span className="font-medium text-on-surface">10</span> of{' '}
        <span className="font-medium text-on-surface">{total}</span> results
      </div>
      <div className="flex gap-1">
        <button
          disabled={current === 1}
          onClick={() => onPageChange?.(current - 1)}
          className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 bg-surface hover:bg-surface-variant/50 disabled:opacity-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange?.(p)}
            className={`w-8 h-8 flex items-center justify-center rounded border font-medium transition-colors ${
              p === current
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant/30 bg-surface hover:bg-surface-variant/50 hover:text-on-surface'
            }`}
          >
            {p}
          </button>
        ))}
        {total > 3 && <span className="w-8 h-8 flex items-center justify-center">...</span>}
        <button
          disabled={current === total}
          onClick={() => onPageChange?.(current + 1)}
          className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 bg-surface hover:bg-surface-variant/50 disabled:opacity-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
