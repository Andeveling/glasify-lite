/**
 * PriceCalculation - Aggregate Root
 *
 * Orchestrates all pricing calculators to produce a complete price breakdown.
 * This is the main entry point for calculating item prices in the domain layer.
 */

import { AccessoryCalculator } from "../services/accessory-calculator";
import { AdjustmentCalculator } from "../services/adjustment-calculator";
import { GlassCalculator } from "../services/glass-calculator";
import { MarginCalculator } from "../services/margin-calculator";
import { ProfileCalculator } from "../services/profile-calculator";
import type { ServiceAmountInput } from "../services/service-calculator";
import { ServiceCalculator } from "../services/service-calculator";
import type {
  AdjustmentInput,
  AdjustmentResult,
  ServiceResult,
} from "../types";
import type { Dimensions } from "./dimensions";
import { Money } from "./money";

/**
 * Model pricing configuration
 */
export type ModelPrices = {
  /** Base price (minimum charge) */
  basePrice: Money;
  /** Cost per millimeter of width beyond minimum */
  costPerMmWidth: Money;
  /** Cost per millimeter of height beyond minimum */
  costPerMmHeight: Money;
  /** Optional accessory price (e.g., handle, lock) */
  accessoryPrice?: Money;
};

/**
 * Glass pricing configuration
 */
export type GlassPricing = {
  /** Price per square meter of glass */
  pricePerSqm: Money;
  /** Discount from width for billing (mm) */
  discountWidthMm?: number;
  /** Discount from height for billing (mm) */
  discountHeightMm?: number;
};

/**
 * Input for complete price calculation
 */
export type PriceCalculationInput = {
  /** Product dimensions */
  dimensions: Dimensions;
  /** Model pricing configuration */
  modelPrices: ModelPrices;
  /** Color surcharge multiplier (1.0 = no surcharge, 1.1 = 10% surcharge) */
  colorMultiplier: number;
  /** Optional profit margin percentage (0-100) applied to model costs only */
  profitMarginPercentage?: number;
  /** Optional glass pricing configuration */
  glass?: GlassPricing;
  /** Optional services to include */
  services?: ServiceAmountInput[];
  /** Optional adjustments (positive or negative) */
  adjustments?: AdjustmentInput[];
};

/**
 * Complete price calculation result
 */
export type PriceCalculationResult = {
  /** Profile cost (base + dimensions + color surcharge) */
  profileCost: Money;
  /** Glass cost (NOT affected by color surcharge) */
  glassCost: Money;
  /** Accessory cost (with color surcharge if applicable) */
  accessoryCost: Money;
  /** Model cost (profile + glass + accessory) - base for profit margin */
  modelCost: Money;
  /** Model sales price (modelCost with profit margin applied) */
  modelSalesPrice: Money;
  /** Service breakdown */
  services: ServiceResult[];
  /** Adjustment breakdown */
  adjustments: AdjustmentResult[];
  /** Final subtotal (modelSalesPrice + services + adjustments) */
  subtotal: Money;
};

/**
 * PriceCalculation aggregate
 *
 * Orchestrates all domain calculators to produce a complete price breakdown.
 * All calculations are pure and immutable.
 *
 * @example
 * ```typescript
 * const result = PriceCalculation.calculate({
 *   dimensions: new Dimensions({ widthMm: 1000, heightMm: 2000, ... }),
 *   modelPrices: { basePrice: new Money(100), ... },
 *   colorMultiplier: 1.1, // 10% surcharge
 *   glass: { pricePerSqm: new Money(50), ... },
 *   services: [...],
 *   adjustments: [...]
 * });
 * ```
 */
export const PriceCalculation = {
  /**
   * Calculate complete item price
   *
   * Orchestrates:
   * 1. Profile cost (base + dimensions + color surcharge)
   * 2. Glass cost (NOT affected by color)
   * 3. Accessory cost (with color surcharge)
   * 4. Model cost (profile + glass + accessory)
   * 5. Apply profit margin to model cost → model sales price
   * 6. Services (NOT affected by color or margin)
   * 7. Adjustments (positive or negative)
   *
   * @param input - Complete calculation input
   * @returns Immutable price breakdown with all components
   */
  calculate(input: PriceCalculationInput): PriceCalculationResult {
    const {
      dimensions,
      modelPrices,
      colorMultiplier,
      profitMarginPercentage,
      glass,
      services,
      adjustments,
    } = input;

    // 1. Calculate profile cost (with color surcharge)
    const profileCost = ProfileCalculator.calculateProfileCost({
      basePrice: modelPrices.basePrice,
      costPerMmWidth: modelPrices.costPerMmWidth,
      costPerMmHeight: modelPrices.costPerMmHeight,
      dimensions,
      colorMultiplier,
    });

    // 2. Calculate glass cost (NOT affected by color)
    const glassCost = glass
      ? GlassCalculator.calculateGlassCost({
          pricePerM2: glass.pricePerSqm,
          dimensions,
          profileDiscountWidthMm: glass.discountWidthMm ?? 0,
          profileDiscountHeightMm: glass.discountHeightMm ?? 0,
        })
      : new Money(0);

    // 3. Calculate accessory cost (with color surcharge if present)
    const accessoryCost = modelPrices.accessoryPrice
      ? AccessoryCalculator.calculateAccessoryCost(
          modelPrices.accessoryPrice,
          colorMultiplier
        )
      : new Money(0);

    // 4. Calculate model cost (profile + glass + accessory)
    const modelCost = profileCost.add(glassCost).add(accessoryCost);

    // 5. Apply profit margin to model cost (NOT to services)
    const modelSalesPrice =
      profitMarginPercentage && profitMarginPercentage > 0
        ? MarginCalculator.calculateSalesPrice(
            modelCost,
            profitMarginPercentage
          )
        : modelCost;

    // 6. Calculate services (NOT affected by color or margin)
    const serviceResults: ServiceResult[] = services
      ? services.map((service) =>
          ServiceCalculator.calculateServiceAmount(service, dimensions)
        )
      : [];

    // 7. Calculate adjustments (positive or negative)
    const adjustmentResults: AdjustmentResult[] = adjustments
      ? AdjustmentCalculator.calculateAdjustments(adjustments, dimensions)
      : [];

    // 8. Calculate subtotal (modelSalesPrice + services + adjustments)
    let subtotal = modelSalesPrice;

    // Add service amounts
    for (const service of serviceResults) {
      subtotal = subtotal.add(new Money(service.amount));
    }

    // Add adjustment amounts (can be negative)
    for (const adjustment of adjustmentResults) {
      subtotal = subtotal.add(new Money(adjustment.amount));
    }

    return {
      profileCost,
      glassCost,
      accessoryCost,
      modelCost,
      modelSalesPrice,
      services: serviceResults,
      adjustments: adjustmentResults,
      subtotal,
    };
  },
};
