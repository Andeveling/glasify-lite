/**
 * @file Formatting Utilities
 * @description String formatting utilities for seeding (phone, email, addresses, etc.)
 * ORM-agnostic utilities using only standard JavaScript
 */

// Constants for phone formatting
const PHONE_AREA_START = 0;
const PHONE_AREA_END = 3;
const PHONE_EXCHANGE_START = 3;
const PHONE_EXCHANGE_END = 6;
const COLOMBIAN_PHONE_LENGTH = 10;
const COUNTRY_CODE_LENGTH = 2;

// Constants for tax ID
const TAX_ID_MIN_LENGTH = 8;

// Regex patterns (defined at top level for performance)
const WORD_SPLIT_REGEX = /\s+/;
const SPECIAL_CHARS_REGEX = /[^\w-]/g;
const DASH_COLLAPSE_REGEX = /-+/g;
const DASH_TRIM_REGEX = /^-|-$/g;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGIT_EXTRACT_REGEX = /\d+/g;

/**
 * Format a Colombian phone number
 * Accepts: 10+ digits, returns +57 country code format or local format
 *
 * @param phone - Phone number (digits only or with formatting)
 * @param includeCountryCode - Whether to include +57 prefix (default: false)
 * @returns Formatted phone number
 *
 * @example
 * ```typescript
 * formatPhoneNumber('3012345678') // '301 234 5678'
 * formatPhoneNumber('3012345678', true) // '+57 301 234 5678'
 * formatPhoneNumber('+573012345678') // '301 234 5678'
 * ```
 */
export function formatPhoneNumber(
  phone: string,
  includeCountryCode = false
): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Remove country code if present
  let cleaned = digits.startsWith("57")
    ? digits.slice(COUNTRY_CODE_LENGTH)
    : digits;

  // Ensure it's a valid Colombian phone (10 digits)
  if (cleaned.length < COLOMBIAN_PHONE_LENGTH) {
    return phone; // Return original if invalid
  }

  // Take only first 10 digits
  cleaned = cleaned.slice(0, COLOMBIAN_PHONE_LENGTH);

  // Format: XXX XXX XXXX
  const formatted = `${cleaned.slice(PHONE_AREA_START, PHONE_AREA_END)} ${cleaned.slice(PHONE_EXCHANGE_START, PHONE_EXCHANGE_END)} ${cleaned.slice(PHONE_EXCHANGE_END)}`;

  return includeCountryCode ? `+57 ${formatted}` : formatted;
}

/**
 * Format a tax ID (NIT) for Colombia
 * Format: XXXXXXXXXX-Y where Y is check digit
 *
 * @param taxId - Tax ID (digits only or formatted)
 * @returns Formatted tax ID
 *
 * @example
 * ```typescript
 * formatTaxId('8001234560') // '800123456-0'
 * formatTaxId('800-123456-0') // '800123456-0'
 * ```
 */
export function formatTaxId(taxId: string): string {
  // Remove all non-digits
  const digits = taxId.replace(/\D/g, "");

  if (digits.length < TAX_ID_MIN_LENGTH) {
    return taxId; // Return original if invalid
  }

  // Format: XXXXXXXXX-Y (9 + 1 digit check)
  const formatted = `${digits.slice(0, -1)}-${digits.slice(-1)}`;

  return formatted;
}

/**
 * Capitalize first letter of each word
 *
 * @param text - Text to capitalize
 * @returns Capitalized text
 *
 * @example
 * ```typescript
 * capitalize('john doe') // 'John Doe'
 * capitalize('fabricante de vidrio') // 'Fabricante De Vidrio'
 * ```
 */
export function capitalize(text: string): string {
  return text
    .toLowerCase()
    .split(WORD_SPLIT_REGEX)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Convert text to slug format (kebab-case, URL-safe)
 *
 * @param text - Text to slugify
 * @returns Slugified text
 *
 * @example
 * ```typescript
 * slugify('Fabricante de Vidrio') // 'fabricante-de-vidrio'
 * slugify('Model XL 100') // 'model-xl-100'
 * ```
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Spaces to dashes
    .replace(SPECIAL_CHARS_REGEX, "") // Remove special chars
    .replace(DASH_COLLAPSE_REGEX, "-") // Collapse multiple dashes
    .replace(DASH_TRIM_REGEX, ""); // Remove leading/trailing dashes
}

/**
 * Format a currency amount with symbol
 *
 * @param amount - Amount as number or string
 * @param currency - Currency code (default: COP)
 * @param decimals - Number of decimal places (default: 0 for COP, 2 for USD)
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatCurrency(100000) // '$100.000'
 * formatCurrency(99.99, 'USD') // '$99.99'
 * formatCurrency(5500.50, 'COP', 2) // '$5.500,50'
 * ```
 */
export function formatCurrency(
  amount: number | string,
  currency = "COP",
  decimals?: number
): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;

  // Default decimals per currency
  const decimalPlaces = decimals ?? (currency === "COP" ? 0 : 2);

  // Format number with Colombian locale (. for thousands, , for decimals)
  const formatted = new Intl.NumberFormat("es-CO", {
    currency,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    style: "currency",
  }).format(num);

  return formatted;
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @param suffix - Suffix for truncated text (default: '...')
 * @returns Truncated text
 *
 * @example
 * ```typescript
 * truncate('Fabricante de vidrio templado', 20) // 'Fabricante de vid...'
 * truncate('Hello', 10) // 'Hello'
 * ```
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncateLength = maxLength - suffix.length;
  return text.slice(0, truncateLength) + suffix;
}

/**
 * Remove accents and special characters
 *
 * @param text - Text to clean
 * @returns Cleaned text
 *
 * @example
 * ```typescript
 * removeAccents('Fabricación de vidrio') // 'Fabricacion de vidrio'
 * removeAccents('Côté français') // 'Cote francais'
 * ```
 */
export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Pad a number with leading zeros
 *
 * @param num - Number to pad
 * @param length - Target length
 * @returns Padded string
 *
 * @example
 * ```typescript
 * padNumber(5, 4) // '0005'
 * padNumber(123, 2) // '123'
 * ```
 */
export function padNumber(num: number | string, length: number): string {
  return String(num).padStart(length, "0");
}

/**
 * Generate a random code (alphanumeric)
 *
 * @param length - Code length (default: 8)
 * @param includeUppercase - Include uppercase letters (default: true)
 * @param includeDigits - Include digits (default: true)
 * @returns Random code
 *
 * @example
 * ```typescript
 * randomCode(6) // 'aB4xKz'
 * randomCode(10, false, true) // 'abc123def456' (lowercase + digits)
 * ```
 */
export function randomCode(
  length = 8,
  includeUppercase = true,
  includeDigits = true
): string {
  let chars = "abcdefghijklmnopqrstuvwxyz";

  if (includeUppercase) {
    chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (includeDigits) {
    chars += "0123456789";
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Check if string is a valid email format
 *
 * @param email - Email to validate
 * @returns True if valid email format
 *
 * @example
 * ```typescript
 * isValidEmail('test@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  // Simple email regex (not RFC-compliant but good enough for testing)
  return EMAIL_REGEX.test(email);
}

/**
 * Extract numbers from text
 *
 * @param text - Text to extract from
 * @returns Array of numbers found
 *
 * @example
 * ```typescript
 * extractNumbers('Model 100 x 200cm') // [100, 200]
 * extractNumbers('Price: $1,250.50') // [1, 250, 50]
 * ```
 */
export function extractNumbers(text: string): number[] {
  const matches = text.match(DIGIT_EXTRACT_REGEX);
  return matches ? matches.map(Number) : [];
}

/**
 * Repeat string n times
 *
 * @param text - Text to repeat
 * @param times - Number of repetitions
 * @param separator - Separator between repetitions (default: '')
 * @returns Repeated text
 *
 * @example
 * ```typescript
 * repeat('ab', 3) // 'ababab'
 * repeat('item', 2, ', ') // 'item, item'
 * ```
 */
export function repeat(text: string, times: number, separator = ""): string {
  return Array.from({ length: times }).fill(text).join(separator);
}
