/**
 * PDF Utility Functions
 *
 * Helper functions for PDF generation including formatting,
 * image encoding, and data transformation.
 *
 * @deprecated formatCurrency, formatDate, formatDateSpanish
 * Use @/lib/format instead for tenant-aware formatting
 */

import { formatCurrency as formatCurrencyCore, formatDateCustom, formatDateFull } from '@/lib/format';

/**
 * Format number as currency (legacy wrapper)
 * @deprecated Use formatCurrency from @/lib/format with TenantConfig context
 */
export function formatCurrency(amount: number, currency = 'COP'): string {
  return formatCurrencyCore(amount, { context: { currency, locale: 'es-CO', timezone: 'America/Bogota' } });
}

/**
 * Format date as YYYY-MM-DD (legacy wrapper)
 * @deprecated Use formatDateCustom from @/lib/format with TenantConfig context
 */
export function formatDate(date: string | Date): string {
  return formatDateCustom(date, 'YYYY-MM-DD');
}

/**
 * Format date as human-readable Spanish date (legacy wrapper)
 * @deprecated Use formatDateFull from @/lib/format with TenantConfig context
 */
export function formatDateSpanish(date: string | Date): string {
  return formatDateFull(date, { currency: 'COP', locale: 'es-CO', timezone: 'America/Bogota' });
}

/**
 * Encode image URL to base64 for embedding in PDF
 * This is a simplified version - in production, you'd fetch and encode the actual image
 */
export function encodeImage(_url: string): Promise<string | null> {
  // In a real implementation, you would:
  // 1. Fetch the image from the URL
  // 2. Convert to base64
  // 3. Return data URL with proper MIME type

  // For now, return null to use fallback
  // TODO: Implement actual image fetching and encoding
  return Promise.resolve(null);
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  const ellipsisLength = 3;

  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - ellipsisLength)}...`;
}

/**
 * Calculate number of pages needed based on items count
 */
export function calculatePageCount(itemsCount: number, itemsPerPage = 15): number {
  return Math.ceil(itemsCount / itemsPerPage);
}

/**
 * Group items into pages for pagination
 */
export function paginateItems<T>(items: T[], itemsPerPage = 15): T[][] {
  const pages: T[][] = [];

  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage));
  }

  return pages;
}

/**
 * Format dimensions string
 */
export function formatDimensions(dimensions: string): string {
  // Ensure consistent formatting
  return dimensions.trim();
}

/**
 * Get friendly name for glass type
 */
export function getGlassTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    clear: 'Claro',
    frosted: 'Esmerilado',
    insulated: 'Termo-acústico',
    laminated: 'Laminado',
    tempered: 'Templado',
    tinted: 'Polarizado',
  };

  return typeMap[type.toLowerCase()] || type;
}

/**
 * Sanitize text for PDF rendering
 * Removes special characters that might cause issues
 */
export function sanitizeText(text: string): string {
  return (
    text
      // biome-ignore lint/suspicious/noControlCharactersInRegex: Control characters removal is intentional for PDF security
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .trim()
  );
}

/**
 * Calculate tax amount from subtotal
 */
export function calculateTax(subtotal: number, taxRate = 0.19): number {
  return subtotal * taxRate;
}

/**
 * Calculate total from subtotal and tax
 */
export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}
