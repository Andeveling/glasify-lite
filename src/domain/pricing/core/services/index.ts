/**
 * Domain Services - Public API
 *
 * Exports all pricing calculation services and their input types.
 * Services are pure functions (no side effects) that orchestrate
 * domain entities to perform business calculations.
 */

export type { AdjustmentInput } from "../types"
export { AccessoryCalculator } from "./accessory-calculator"
export { AdjustmentCalculator } from "./adjustment-calculator"
export type { GlassCostInput } from "./glass-calculator"
export { GlassCalculator } from "./glass-calculator"
export type { ModelSalesPriceInput } from "./margin-calculator"
export { MarginCalculator } from "./margin-calculator"
export type { ProfileCostInput } from "./profile-calculator"
export { ProfileCalculator } from "./profile-calculator"
export {
  applyMinimumBillingUnit,
  calculateAreaQuantity,
  calculateFixedQuantity,
  calculatePerimeterQuantity,
} from "./quantity-calculations"
export type { ServiceAmountInput } from "./service-calculator"
export { ServiceCalculator } from "./service-calculator"
