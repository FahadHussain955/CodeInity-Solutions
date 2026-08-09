/**
 * Shared query helpers for list endpoints.
 */
export const parsePagination = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const paginatedResult = ({ items, total, page, limit }) => ({
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  },
});

export const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const formatMoney = (value) => {
  const n = toNumber(value);
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const relativeDaysAgo = (date) => {
  if (!date) return '—';
  const ms = Date.now() - new Date(date).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};
