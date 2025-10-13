/**
 * PDF Utility Functions
 *
 * Helper functions for PDF generation including formatting,
 * image encoding, and data transformation.
 */

/**
 * Format number as Colombian Peso currency
 */
export function formatCurrency(amount: number, currency = 'COP'): string {
  if (currency === 'COP') {
    // Colombian Peso format: $1.234.567
    return `$${amount.toLocaleString('es-CO', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })}`;
  }

  // Fallback to standard format
  return new Intl.NumberFormat('es-CO', {
    currency,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format date as human-readable Spanish date
 */
export function formatDateSpanish(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
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

  return typeMap[ type.toLowerCase() ] || type;
}

/**
 * Sanitize text for PDF rendering
 * Removes special characters that might cause issues
 */
export function sanitizeText(text: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Control characters removal is intentional for PDF security
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
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
