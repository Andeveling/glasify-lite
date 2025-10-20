/**
 * Excel Utility Functions
 *
 * Helper functions for Excel generation including formatting,
 * formulas, and data transformation.
 */

/**
 * Format number as Colombian Peso currency for Excel
 */
export function formatCurrencyForExcel(amount: number): number {
  // Excel will handle formatting with numberFormat
  // Just return the raw number
  return Math.round(amount);
}

/**
 * Get currency formula for Excel cell
 *
 * @example
 * getCurrencyFormula('D5', 'E5') // Returns: "=D5*E5"
 */
export function getCurrencyFormula(cell1: string, cell2: string): string {
  return `=${cell1}*${cell2}`;
}

/**
 * Get subtotal formula for a range of cells
 *
 * @example
 * getSubtotalFormula('F2', 'F10') // Returns: "=SUM(F2:F10)"
 */
export function getSubtotalFormula(startCell: string, endCell: string): string {
  return `=SUM(${startCell}:${endCell})`;
}

/**
 * Get tax formula (subtotal * tax rate)
 *
 * @example
 * getTaxFormula('F15', 0.19) // Returns: "=F15*0.19"
 */
export function getTaxFormula(subtotalCell: string, taxRate: number): string {
  return `=${subtotalCell}*${taxRate}`;
}

/**
 * Get total formula (subtotal + tax)
 *
 * @example
 * getTotalFormula('F15', 'F16') // Returns: "=F15+F16"
 */
export function getTotalFormula(subtotalCell: string, taxCell: string): string {
  return `=${subtotalCell}+${taxCell}`;
}

/**
 * Get Excel column letter from index (0-based)
 *
 * @example
 * getColumnLetter(0) // Returns: "A"
 * getColumnLetter(25) // Returns: "Z"
 * getColumnLetter(26) // Returns: "AA"
 */
export function getColumnLetter(index: number): string {
  let column = '';
  let idx = index;

  while (idx >= 0) {
    column = String.fromCharCode(65 + (idx % 26)) + column;
    idx = Math.floor(idx / 26) - 1;
  }

  return column;
}

/**
 * Get Excel cell reference from row and column indices
 *
 * @example
 * getCellReference(0, 0) // Returns: "A1"
 * getCellReference(4, 2) // Returns: "C5"
 */
export function getCellReference(rowIndex: number, colIndex: number): string {
  const letter = getColumnLetter(colIndex);
  const rowNumber = rowIndex + 1; // Excel rows are 1-based
  return `${letter}${rowNumber}`;
}

/**
 * Get Excel range reference
 *
 * @example
 * getRangeReference(0, 0, 4, 2) // Returns: "A1:C5"
 */
export function getRangeReference(startRow: number, startCol: number, endRow: number, endCol: number): string {
  const startCell = getCellReference(startRow, startCol);
  const endCell = getCellReference(endRow, endCol);
  return `${startCell}:${endCell}`;
}

/**
 * Calculate optimal column width based on content
 *
 * @param content - Text content to measure
 * @param minWidth - Minimum width
 * @param maxWidth - Maximum width
 * @returns Optimal column width
 */
export function calculateColumnWidth(content: string, minWidth = 10, maxWidth = 50): number {
  // Approximate character width (1 char ≈ 1.2 width units in Excel)
  const approximateWidth = content.length * 1.2;
  return Math.max(minWidth, Math.min(approximateWidth, maxWidth));
}

/**
 * Sanitize text for Excel cell
 * Removes formula injection attempts and special characters
 */
export function sanitizeExcelText(text: string): string {
  let sanitized = text;

  // Prevent formula injection
  if (
    sanitized.startsWith('=') ||
    sanitized.startsWith('+') ||
    sanitized.startsWith('-') ||
    sanitized.startsWith('@')
  ) {
    sanitized = `'${sanitized}`;
  }

  // biome-ignore lint/suspicious/noControlCharactersInRegex: Control characters removal is intentional for Excel security
  return sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
}

/**
 * Format date for Excel
 */
export function formatDateForExcel(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

/**
 * Get item subtotal formula for Excel
 *
 * @param quantityCell - Cell reference for quantity (e.g., "D5")
 * @param unitPriceCell - Cell reference for unit price (e.g., "E5")
 * @returns Excel formula string
 */
export function getItemSubtotalFormula(quantityCell: string, unitPriceCell: string): string {
  return `=${quantityCell}*${unitPriceCell}`;
}

/**
 * Apply number format to amount
 */
export function applyNumberFormat(format: string, value: number): string {
  // This is just for documentation - Excel handles actual formatting
  // Return string representation for preview
  if (format.includes('$')) {
    return `$${value.toLocaleString('es-CO')}`;
  }
  return value.toLocaleString('es-CO');
}

/**
 * Validate Excel worksheet name
 * Worksheet names must be 1-31 chars and not contain: / \ ? * [ ]
 */
export function sanitizeWorksheetName(name: string, maxLength = 31): string {
  return name
    .replace(/[/\\?*[\]]/g, '') // Remove invalid characters
    .slice(0, maxLength) // Limit length
    .trim();
}

/**
 * Get safe sheet name for Excel
 */
export function getSafeSheetName(name: string): string {
  return sanitizeWorksheetName(name);
}
