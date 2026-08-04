const statusConfig = {
  Active:     { bg: 'bg-[#e6f4ea]', text: 'text-[#137333]', border: 'border-[#ceead6]' },
  Draft:      { bg: 'bg-surface-variant', text: 'text-on-surface-variant', border: 'border-outline-variant/50' },
  Archived:   { bg: 'bg-surface-container', text: 'text-outline', border: 'border-outline-variant/30' },
  Delivered:  { bg: 'bg-[#e6f4ea]', text: 'text-[#137333]', border: 'border-[#ceead6]' },
  Processing: { bg: 'bg-[#e8f0fe]', text: 'text-[#1a73e8]', border: 'border-[#aecbfa]' },
  Pending:    { bg: 'bg-[#fef3c7]', text: 'text-[#b06000]', border: 'border-[#fde68a]' },
  Cancelled:  { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error/30' },
  'Low Stock':{ bg: 'bg-[#fef3c7]', text: 'text-[#b06000]', border: 'border-[#fde68a]' },
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
