/* Shared presentation formatter for all monetary values. Stored amounts remain numeric. */
window.formatCurrency = (value, options = {}) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2
  }).format(amount);
};
