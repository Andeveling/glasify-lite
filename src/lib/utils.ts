import { format as tempoFormat } from '@formkit/tempo';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date for Spanish (Latin America) locale using Tempo
 * @param date - The date to format (Date object or string)
 * @param locale - IETF BCP 47 locale (e.g., 'es-CO', 'en-US')
 * @param timezone - IANA timezone identifier (e.g., 'America/Bogota')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale = 'es-CO', timezone = 'America/Bogota'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }

    // Use Tempo for consistent date formatting with tenant config
    return tempoFormat(dateObj, 'DD/MM/YYYY', locale);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
}
