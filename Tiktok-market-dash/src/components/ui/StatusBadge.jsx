const statusConfig = {
  Active:     { bg: 'bg-success-bg', text: 'text-success', border: 'border-success-border' },
  Paused:     { bg: 'bg-surface-variant', text: 'text-on-surface-variant', border: 'border-outline-variant/50' },
  Draft:      { bg: 'bg-surface-variant', text: 'text-on-surface-variant', border: 'border-outline-variant/50' },
  Archived:   { bg: 'bg-surface-container', text: 'text-outline', border: 'border-outline-variant/30' },
  Delivered:  { bg: 'bg-success-bg', text: 'text-success', border: 'border-success-border' },
  Processing: { bg: 'bg-info-bg', text: 'text-info', border: 'border-info-border' },
  Pending:    { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning-border' },
  'Under Review': { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning-border' },
  Cancelled:  { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error/30' },
  'Low Stock':{ bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning-border' },
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
