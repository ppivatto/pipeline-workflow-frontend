/**
 * Format a number as US-style currency: $7,000,000.00
 * Commas for thousands, dot for decimals.
 */
export function fmtMoney(n: any): string {
  if (n == null || n === '' || isNaN(Number(n))) return '—';
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a raw number input value with commas while typing.
 * Strips non-numeric except dots, formats with commas.
 * Returns { display, raw } where display is formatted and raw is the clean number string.
 */
export function formatMoneyInput(value: string): { display: string; raw: string } {
  // Strip everything except digits and dot
  const clean = value.replace(/[^0-9.]/g, '');
  // Avoid multiple dots
  const parts = clean.split('.');
  const intPart = parts[0] || '';
  const decPart = parts.length > 1 ? parts[1].slice(0, 2) : undefined;

  // Add commas to integer part
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const display = decPart !== undefined ? `${formatted}.${decPart}` : formatted;
  const raw = decPart !== undefined ? `${intPart}.${decPart}` : intPart;

  return { display, raw };
}

/**
 * Parse a formatted money string back to a clean number string.
 * "7,000,000.00" → "7000000.00"
 */
export function parseMoney(formatted: string): string {
  return formatted.replace(/,/g, '');
}
