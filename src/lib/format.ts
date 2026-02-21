export function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${amount} ${currencyCode}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
