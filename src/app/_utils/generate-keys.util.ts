import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique random key for React components
 * @returns A unique string suitable for React keys
 */
export function generateKey() {
  return uuidv4(); // Cambiado de Math.random() para mayor unicidad
}

/**
 * Creates an array of a specific length with unique keys for React rendering
 * @param length - The length of the array to generate
 * @param prefix - Optional prefix for the generated keys (default: 'item')
 * @returns Array of objects with unique keys
 */
export function generateKeyedArray(length: number, prefix = 'item') {
  return Array.from({ length }, (_, index) => ({
    index,
    key: `${prefix}-${generateKey()}-${index}`,
  }));
}

/**
 * Creates an array with stable keys based on content and position
 * Useful for skeleton loaders where we want deterministic keys
 * @param length - The length of the array to generate
 * @param prefix - Prefix for the generated keys
 * @returns Array of objects with stable keys
 */
export function generateStableKeyedArray(length: number, prefix: string) {
  return Array.from({ length }, (_, index) => ({
    index,
    key: `${prefix}-${index}`,
  }));
}
