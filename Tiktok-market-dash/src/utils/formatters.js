export const formatCurrency = (amount, currency = 'USD') => {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};
