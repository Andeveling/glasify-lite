import type { Money } from "../entities/money";

/**
 * Calculate accessory cost with color surcharge
 *
 * Applies color multiplier to accessory price. This is consistent
 * with how color is applied to profile components.
 *
 * Formula (US4):
 * accessoryCost = accessoryPrice × colorMultiplier
 *
 * Where colorMultiplier = 1 + (colorSurchargePercentage / 100)
 * Example: 10% surcharge → colorMultiplier = 1.1
 *
 * @param accessoryPrice - Base price of the accessory
 * @param colorMultiplier - Color multiplier (1 = no surcharge, 1.1 = 10% surcharge)
 * @returns Accessory cost with color applied
 */
function calculateAccessoryCost(
  accessoryPrice: Money,
  colorMultiplier: number
): Money {
  return accessoryPrice.multiply(colorMultiplier);
}

/**
 * AccessoryCalculator - Pure functions for accessory cost calculations
 *
 * Provides methods to calculate accessory costs with color surcharge.
 * All functions are pure (no side effects) and use Money value objects.
 *
 * Key concepts:
 * - Color surcharge is applied to accessories (same as profile)
 * - Color is NOT applied to glass or services (different business rules)
 * - Accessories are optional (can be zero/null in some configurations)
 */
export const AccessoryCalculator = {
  calculateAccessoryCost,
} as const;
