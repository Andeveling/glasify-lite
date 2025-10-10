import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency as formatCurrencyUtil } from '@/app/_utils/format-currency.util';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency value for Spanish (Latin America) locale
 *
 * @deprecated Use formatCurrency from '@/app/_utils/format-currency.util' instead
 * This function is kept for backward compatibility
 *
 * @param value - The value to format (string or number)
 * @param currency - Optional currency code (defaults to 'COP')
 * @returns Formatted currency string
 */
export function formatCurrency(value: string | number, currency = 'COP'): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(numericValue)) {
    return formatCurrencyUtil(0, { currency });
  }

  return formatCurrencyUtil(numericValue, {
    currency,
    decimals: currency === 'USD' ? 2 : 0,
    locale: currency === 'USD' ? 'es-PA' : 'es-CO',
  });
}

/**
 * Formats a date for Spanish (Latin America) locale
 * @param date - The date to format (Date object or string)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}
