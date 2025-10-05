/**
 * Text Formatting Utilities
 *
 * Pure utility functions for text formatting and pluralization.
 * Following Single Responsibility Principle - each function has one clear purpose.
 */

// ============================================================================
// Types
// ============================================================================

export type PluralOptions = {
  zero?: string;
  one: string;
  other: string;
};

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Format number with thousand separators
 *
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'es-AR')
 * @returns Formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1000); // => "1.000"
 * formatNumber(1234567); // => "1.234.567"
 * ```
 */
export function formatNumber(num: number, locale = 'es-AR'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Get plural form based on count
 *
 * Returns appropriate text based on the count value.
 * Supports custom text for zero, one, and other cases.
 *
 * @param count - The count to determine plural form
 * @param options - Plural options for different cases
 * @returns Appropriate plural text
 *
 * @example
 * ```ts
 * pluralize(0, { zero: 'No items', one: '1 item', other: 'items' });
 * // => "No items"
 *
 * pluralize(1, { one: '1 modelo', other: 'modelos' });
 * // => "1 modelo"
 *
 * pluralize(5, { one: '1 modelo', other: '5 modelos' });
 * // => "5 modelos"
 * ```
 */
export function pluralize(count: number, options: PluralOptions): string {
  if (count === 0 && options.zero !== undefined) {
    return options.zero;
  }

  if (count === 1) {
    return options.one;
  }

  return options.other;
}

/**
 * Format result count message
 *
 * Returns appropriate Spanish message for result count.
 * Handles zero, one, and multiple results cases.
 *
 * @param count - Number of results
 * @returns Formatted message with proper pluralization
 *
 * @example
 * ```ts
 * formatResultCount(0); // => "No se encontraron resultados"
 * formatResultCount(1); // => "1 modelo encontrado"
 * formatResultCount(25); // => "25 modelos encontrados"
 * formatResultCount(1000); // => "1.000 modelos encontrados"
 * ```
 */
export function formatResultCount(count: number): string {
  return pluralize(count, {
    one: `${formatNumber(count)} modelo encontrado`,
    other: `${formatNumber(count)} modelos encontrados`,
    zero: 'No se encontraron resultados',
  });
}

/**
 * Extract count number from result message
 *
 * Parses formatted count from the message text.
 * Useful for displaying count with special styling.
 *
 * @param count - Number of results
 * @returns Object with count (formatted) and hasResults flag
 *
 * @example
 * ```ts
 * getResultCountParts(0); // => { count: null, hasResults: false }
 * getResultCountParts(1); // => { count: "1", hasResults: true }
 * getResultCountParts(1000); // => { count: "1.000", hasResults: true }
 * ```
 */
export function getResultCountParts(count: number): {
  count: string | null;
  hasResults: boolean;
} {
  if (count === 0) {
    return {
      count: null,
      hasResults: false,
    };
  }

  return {
    count: formatNumber(count),
    hasResults: true,
  };
}
