import type { MaterialType } from '@prisma/client';

/**
 * Maps ProfileSupplier material types to base colors for design rendering.
 * Colors are neutral/approximations for visual differentiation.
 *
 * @constant
 * @type {Record<MaterialType, string>}
 *
 * @example
 * ```typescript
 * const aluminumColor = MATERIAL_COLORS.ALUMINUM; // '#808080'
 * const pvcColor = MATERIAL_COLORS.PVC; // '#FFFFFF'
 * ```
 */
export const MATERIAL_COLORS: Record<MaterialType, string> = {
  ALUMINUM: '#808080', // Gray
  MIXED: '#D3D3D3', // Light Gray (neutral)
  PVC: '#FFFFFF', // White
  WOOD: '#8B4513', // Brown (SaddleBrown)
} as const;

/**
 * Get the hex color for a given material type.
 *
 * @param material - The material type from ProfileSupplier
 * @returns Hex color string (e.g., '#FFFFFF')
 *
 * @example
 * ```typescript
 * const color = getMaterialColor('PVC'); // '#FFFFFF'
 * const aluminumColor = getMaterialColor('ALUMINUM'); // '#808080'
 * ```
 */
export function getMaterialColor(material: MaterialType): string {
  return MATERIAL_COLORS[material];
}

/**
 * Check if a value is a valid material color hex string.
 *
 * @param color - Value to check
 * @returns True if the color is a valid material color
 *
 * @example
 * ```typescript
 * isValidMaterialColor('#FFFFFF'); // true
 * isValidMaterialColor('#808080'); // true
 * isValidMaterialColor('#FF0000'); // false (not a material color)
 * isValidMaterialColor('invalid'); // false
 * ```
 */
export function isValidMaterialColor(color: unknown): color is string {
  return typeof color === 'string' && Object.values(MATERIAL_COLORS).includes(color);
}
