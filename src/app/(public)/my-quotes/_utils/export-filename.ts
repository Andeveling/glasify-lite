/**
 * Export Filename Generator
 *
 * Generates filenames in the format: "Cotizacion_ProjectName_YYYY-MM-DD.ext"
 * for PDF and Excel exports.
 */

import type { ExportFormat } from '@/types/export.types';

/**
 * Generate export filename with consistent format
 *
 * @param projectName - Name of the project (will be sanitized)
 * @param date - Date for the filename
 * @param format - Export format (pdf or excel)
 * @returns Filename string: "Cotizacion_ProjectName_YYYY-MM-DD.ext"
 *
 * @example
 * generateExportFilename('Casa Rodriguez', new Date('2025-10-12'), 'pdf')
 * // Returns: "Cotizacion_Casa_Rodriguez_2025-10-12.pdf"
 */
export function generateExportFilename(projectName: string, date: Date, format: ExportFormat): string {
  // Sanitize project name
  const sanitizedName = sanitizeProjectName(projectName);

  // Format date as YYYY-MM-DD
  const formattedDate = formatDateForFilename(date);

  // Get file extension
  const extension = getFileExtension(format);

  // Construct filename
  return `Cotizacion_${sanitizedName}_${formattedDate}.${extension}`;
}

/**
 * Sanitize project name for use in filename
 * - Removes special characters
 * - Replaces spaces with underscores
 * - Truncates to max 50 characters
 * - Handles empty names
 */
function sanitizeProjectName(name: string): string {
  if (!name || name.trim() === '') {
    return 'Sin_Nombre';
  }

  return (
    name
      .trim()
      // Remove quotes, ampersands, and other special chars
      .replace(/["&\\.]/g, '')
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Replace spaces with underscores
      .replace(/\s/g, '_')
      // Remove any remaining non-alphanumeric chars (except underscores and accented chars)
      .replace(/[^\w\u00C0-\u017F_]/g, '')
      // Truncate to max 50 chars
      .slice(0, 50)
      // Capitalize first letter of each word
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_')
  );
}

/**
 * Format date as YYYY-MM-DD for filename
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get file extension based on export format
 */
function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'pdf':
      return 'pdf';
    case 'excel':
      return 'xlsx';
    default:
      return 'pdf';
  }
}

/**
 * Validate filename doesn't exceed system limits
 */
export function validateFilename(filename: string): boolean {
  // Most filesystems support 255 chars
  return filename.length <= 255;
}

/**
 * Generate filename with timestamp for uniqueness (optional variant)
 */
export function generateExportFilenameWithTimestamp(projectName: string, format: ExportFormat): string {
  const sanitizedName = sanitizeProjectName(projectName);
  const timestamp = Date.now();
  const extension = getFileExtension(format);

  return `Cotizacion_${sanitizedName}_${timestamp}.${extension}`;
}
