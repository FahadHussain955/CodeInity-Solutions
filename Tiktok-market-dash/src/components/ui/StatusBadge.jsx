const statusConfig = {
  Active:     { bg: 'bg-success-bg', text: 'text-success', border: 'border-success-border' },
  Inactive:   { bg: 'bg-surface-variant', text: 'text-on-surface-variant', border: 'border-outline-variant/50' },
  Paused:     { bg: 'bg-surface-variant', text: 'text-on-surface-variant', border: 'border-outline-variant/50' },
  Draft:      { bg: 'bg-surface-variant', text: 'text-on-surface-variant', border: 'border-outline-variant/50' },
  Archived:   { bg: 'bg-surface-container', text: 'text-outline', border: 'border-outline-variant/30' },
  Delivered:  { bg: 'bg-success-bg', text: 'text-success', border: 'border-success-border' },
  Processing: { bg: 'bg-info-bg', text: 'text-info', border: 'border-info-border' },
  Pending:    { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning-border' },
  'Under Review': { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning-border' },
  Ready:      { bg: 'bg-success-bg', text: 'text-success', border: 'border-success-border' },
  Populating: { bg: 'bg-info-bg', text: 'text-info', border: 'border-info-border' },
  Cancelled:  { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error/30' },
  Refunded:   { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error/30' },
  'Partially Refunded': { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning-border' },
  'In Stock': { bg: 'bg-success-bg', text: 'text-success', border: 'border-success-border' },
  'Low Stock':{ bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning-border' },
  'Out of Stock': { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error/30' },
  Overstocked: { bg: 'bg-info-bg', text: 'text-info', border: 'border-info-border' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
