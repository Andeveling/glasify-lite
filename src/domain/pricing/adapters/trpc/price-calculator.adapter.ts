/**
 * @file tRPC Price Calculator Adapter
 * @description Adapter that bridges tRPC infrastructure with domain pricing layer
 *
 * This adapter:
 * 1. Transforms tRPC input (Decimal, existing structure) → Domain input (Money, Dimensions)
 * 2. Calls domain use case (CalculateItemPrice)
 * 3. Transforms domain result → tRPC output (backward compatible with existing API)
 *
 * Maintains 100% backward compatibility with existing `calculatePriceItem` function.
 */

import Decimal from "decimal.js";
import { Dimensions } from "@/domain/pricing/core/entities/dimensions";
import { Money } from "@/domain/pricing/core/entities/money";
import type { ServiceUnit } from "@/domain/pricing/core/types";
import { CalculateItemPrice } from "@/domain/pricing/use-cases/calculate-item-price";

/**
 * Legacy tRPC types for backward compatibility
 * These types maintain the existing API contract
 */
export type PriceItemCalculationInput = {
  widthMm: number;
  heightMm: number;
  model: {
    basePrice: Decimal | number;
    costPerMmWidth: Decimal | number;
    costPerMmHeight: Decimal | number;
    accessoryPrice?: Decimal | number | null;
  };
  includeAccessory?: boolean;
  colorSurchargePercentage?: number;
  glass?: {
    pricePerSqm: Decimal | number;
    discountWidthMm?: number;
    discountHeightMm?: number;
  };
  services?: Array<{
    serviceId: string;
    type: "fixed" | "variable";
    unit: string;
    rate: Decimal | number;
    minimumBillingUnit?: Decimal | number;
    quantityOverride?: number;
  }>;
  adjustments?: Array<{
    concept: string;
    unit: string;
    sign: "positive" | "negative";
    value: Decimal | number;
  }>;
};

export type PriceItemCalculationResult = {
  dimPrice: number;
  accPrice: number;
  colorSurchargePercentage?: number;
  colorSurchargeAmount?: number;
  services: Array<{
    serviceId: string;
    quantity: number;
    amount: number;
  }>;
  adjustments: Array<{
    concept: string;
    amount: number;
  }>;
  subtotal: number;
};

/**
 * Constants for percentage calculations
 */
const PERCENTAGE_TO_DECIMAL = 100;

/**
 * Convert tRPC input to domain input
 *
 * Handles:
 * - Prisma Decimal → Money value objects
 * - Raw dimensions → Dimensions value object
 * - Color surcharge percentage → multiplier (10% → 1.1)
 * - Service/adjustment transformations
 */
function toDomainInput(input: PriceItemCalculationInput) {
  // Create Dimensions value object
  const dimensions = new Dimensions({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    minWidthMm: 0, // Old API doesn't have minimums, use 0
    minHeightMm: 0,
  });

  // Convert model prices to Money
  const modelPrices = {
    basePrice: new Money(input.model.basePrice),
    costPerMmWidth: new Money(input.model.costPerMmWidth),
    costPerMmHeight: new Money(input.model.costPerMmHeight),
    accessoryPrice:
      input.includeAccessory && input.model.accessoryPrice
        ? new Money(input.model.accessoryPrice)
        : undefined,
  };

  // Convert color surcharge percentage to multiplier
  const colorSurchargePercentage = input.colorSurchargePercentage ?? 0;
  const colorMultiplier = 1 + colorSurchargePercentage / PERCENTAGE_TO_DECIMAL;

  // Convert glass configuration
  const glass = input.glass
    ? {
        pricePerSqm: new Money(input.glass.pricePerSqm),
        discountWidthMm: input.glass.discountWidthMm ?? 0,
        discountHeightMm: input.glass.discountHeightMm ?? 0,
      }
    : undefined;

  // Convert services
  const services = input.services?.map((service) => {
    // Convert minimumBillingUnit to number if it's a Decimal
    let minimumBillingUnit: number | undefined;
    if (
      service.minimumBillingUnit !== null &&
      service.minimumBillingUnit !== undefined
    ) {
      minimumBillingUnit =
        typeof service.minimumBillingUnit === "number"
          ? service.minimumBillingUnit
          : new Decimal(service.minimumBillingUnit).toNumber();
    }

    return {
      serviceId: service.serviceId,
      name: service.serviceId, // Use serviceId as name for backward compatibility
      unit: service.unit as ServiceUnit,
      rate: new Money(service.rate),
      quantityOverride: service.quantityOverride,
      minimumBillingUnit,
    };
  });

  // Convert adjustments
  const adjustments = input.adjustments?.map((adjustment) => ({
    adjustmentId: `adj-${adjustment.concept}`, // Generate ID from concept
    concept: adjustment.concept,
    unit: adjustment.unit as ServiceUnit,
    value:
      typeof adjustment.value === "number" ||
      typeof adjustment.value === "string"
        ? adjustment.value
        : adjustment.value.toNumber(),
    isPositive: adjustment.sign !== "negative",
  }));

  return {
    dimensions,
    modelPrices,
    colorMultiplier,
    glass,
    services,
    adjustments,
  };
}

/**
 * Convert domain result to tRPC output
 *
 * Maintains backward compatibility with existing `calculatePriceItem` result structure.
 */
function toTrpcOutput(
  domainResult: ReturnType<typeof CalculateItemPrice.execute>,
  input: PriceItemCalculationInput
): PriceItemCalculationResult {
  // Map services (domain → tRPC format)
  const services = domainResult.services.map((service) => ({
    serviceId: service.serviceId,
    unit: service.unit as ServiceUnit,
    quantity: service.quantity,
    amount: service.amount,
  }));

  // Map adjustments (domain → tRPC format)
  const adjustments = domainResult.adjustments.map((adjustment) => ({
    concept: adjustment.concept,
    amount: adjustment.amount,
  }));

  // Calculate dimPrice (profile + glass) for backward compatibility
  const dimPrice =
    domainResult.profileCost.toNumber() + domainResult.glassCost.toNumber();

  // Calculate color surcharge amount if applicable
  // IMPORTANT: Only from profile cost (NOT accessory)
  const colorSurchargePercentage = input.colorSurchargePercentage;
  let colorSurchargeAmount: number | undefined;

  if (colorSurchargePercentage && colorSurchargePercentage > 0) {
    // Calculate profile cost WITHOUT color surcharge
    const basePrice =
      input.model.basePrice instanceof Decimal
        ? input.model.basePrice.toNumber()
        : Number(input.model.basePrice);
    const widthCost =
      (input.model.costPerMmWidth instanceof Decimal
        ? input.model.costPerMmWidth.toNumber()
        : Number(input.model.costPerMmWidth)) * input.widthMm;
    const heightCost =
      (input.model.costPerMmHeight instanceof Decimal
        ? input.model.costPerMmHeight.toNumber()
        : Number(input.model.costPerMmHeight)) * input.heightMm;

    const profileCostBeforeColor = basePrice + widthCost + heightCost;
    colorSurchargeAmount =
      profileCostBeforeColor *
      (colorSurchargePercentage / PERCENTAGE_TO_DECIMAL);
  }

  return {
    dimPrice,
    accPrice: domainResult.accessoryCost.toNumber(),
    colorSurchargePercentage,
    colorSurchargeAmount,
    services,
    adjustments,
    subtotal: domainResult.subtotal.toNumber(),
  };
}

/**
 * Calculate item price using domain layer
 *
 * This function maintains the exact same signature and behavior as the original
 * `calculatePriceItem` but delegates to the new domain layer.
 *
 * @param input - Price calculation input (tRPC format)
 * @returns Price breakdown (tRPC format)
 *
 * @example
 * ```typescript
 * const result = calculateItemPriceAdapter({
 *   widthMm: 1000,
 *   heightMm: 2000,
 *   model: { basePrice: 100, costPerMmWidth: 0.5, costPerMmHeight: 0.3 },
 *   colorSurchargePercentage: 10,
 *   includeAccessory: true,
 * });
 * ```
 */
export function calculateItemPriceAdapter(
  input: PriceItemCalculationInput
): PriceItemCalculationResult {
  // Transform input
  const domainInput = toDomainInput(input);

  // Execute domain use case
  const domainResult = CalculateItemPrice.execute(domainInput);

  // Transform result
  return toTrpcOutput(domainResult, input);
}
