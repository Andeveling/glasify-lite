import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency value for Spanish (Latin America) locale
 * @param value - The value to format (string or number)
 * @param currency - Optional currency code (defaults to 'COP')
 * @returns Formatted currency string
 */
export function formatCurrency(value: string | number, currency = 'COP'): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(numericValue)) {
    return '$0,00';
  }

  return new Intl.NumberFormat('es-CO', {
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(numericValue);
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
