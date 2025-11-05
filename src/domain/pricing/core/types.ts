/**
 * Domain types for price calculation
 *
 * These types define the core data structures used throughout the pricing
 * domain. They are framework-independent and can be used in any context.
 */

import type { Decimal } from "decimal.js";

/**
 * Service unit types for quantity calculation
 */
export const ServiceUnit = {
  /** Fixed quantity (1 unit, or quantityOverride) */
  UNIT: "unit",
  /** Square meters (width × height in m²) */
  SQM: "sqm",
  /** Linear meters (perimeter in ml) */
  ML: "ml",
} as const;

export type ServiceUnit = (typeof ServiceUnit)[keyof typeof ServiceUnit];

/**
 * Input for service calculation
 */
export type ServiceInput = {
  /** Unique service identifier */
  serviceId: string;
  /** Service name (for error messages) */
  name: string;
  /** Unit type for quantity calculation */
  unit: ServiceUnit;
  /** Rate per unit (in currency) */
  rate: Decimal | number | string;
  /** Minimum billing unit (for area/perimeter services) */
  minimumBillingUnit?: number;
  /** Override quantity (for fixed services) */
  quantityOverride?: number;
};

/**
 * Result of service calculation
 */
export type ServiceResult = {
  /** Service identifier */
  serviceId: string;
  /** Service name */
  name: string;
  /** Unit type */
  unit: ServiceUnit;
  /** Calculated quantity (rounded per SERVICE_QUANTITY_SCALE) */
  quantity: number;
  /** Calculated amount (rate × quantity) */
  amount: number;
};

/**
 * Input for adjustment calculation
 */
export type AdjustmentInput = {
  /** Unique adjustment identifier */
  adjustmentId: string;
  /** Adjustment concept/description */
  concept: string;
  /** Unit type for quantity calculation */
  unit: ServiceUnit;
  /** Value per unit (in currency) */
  value: Decimal | number | string;
  /** Whether adjustment is positive (add) or negative (subtract) */
  isPositive: boolean;
};

/**
 * Result of adjustment calculation
 */
export type AdjustmentResult = {
  /** Adjustment identifier */
  adjustmentId: string;
  /** Adjustment concept */
  concept: string;
  /** Calculated amount (±value × quantity) */
  amount: number;
};
