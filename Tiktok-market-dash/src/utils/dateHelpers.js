/**
 * Human-friendly relative time for activity / notification timestamps.
 */
export const relativeTime = (date) => {
  if (!date) return '';
  const ms = Date.now() - new Date(date).getTime();
  if (Number.isNaN(ms)) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
