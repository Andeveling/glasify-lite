/**
 * Price Adapter - tRPC to Domain transformation
 *
 * Converts tRPC input (from quote.calculate-item mutation) to domain layer
 * PriceCalculationInput format. This adapter bridges the infrastructure layer
 * (tRPC) with the domain layer (pricing entities and use cases).
 *
 * Key transformations:
 * - Number → Money (value objects)
 * - Percentage (0-100) → Multiplier (1.0-2.0)
 * - tRPC primitive types → Domain types
 * - "positive"/"negative" sign → isPositive boolean
 */

import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { Money } from "@domain/pricing/core/entities/money";
import type {
  PriceCalculationInput,
  PriceCalculationResult,
} from "@domain/pricing/core/entities/price-calculation";
import type { ServiceAmountInput } from "@domain/pricing/core/services/service-calculator";
import type { AdjustmentInput, ServiceUnit } from "@domain/pricing/core/types";

/**
 * tRPC input shape for model prices
 */
type TRPCModelPrices = {
  basePrice: number;
  costPerMmWidth: number;
  costPerMmHeight: number;
  minWidthMm: number;
  minHeightMm: number;
  accessoryPrice?: number;
};

/**
 * tRPC input shape for glass pricing
 */
type TRPCGlassPricing = {
  pricePerSqm: number;
  discountWidthMm?: number;
  discountHeightMm?: number;
};

/**
 * tRPC input shape for services
 */
type TRPCService = {
  serviceId: string;
  name: string;
  unit: ServiceUnit;
  rate: number;
  minimumBillingUnit?: number;
  quantityOverride?: number;
};

/**
 * tRPC input shape for adjustments
 */
type TRPCAdjustment = {
  adjustmentId: string;
  concept: string;
  unit: ServiceUnit;
  value: number;
  sign: "positive" | "negative";
};

/**
 * tRPC input shape (from calculate-item mutation)
 */
type TRPCPriceInput = {
  widthMm: number;
  heightMm: number;
  modelPrices: TRPCModelPrices;
  colorSurchargePercentage?: number;
  glass?: TRPCGlassPricing;
  services?: TRPCService[];
  adjustments?: TRPCAdjustment[];
};

/**
 * Percentage divisor constant for converting percentage to decimal
 */
const PERCENTAGE_DIVISOR = 100;

/**
 * Base multiplier (no surcharge)
 */
const BASE_MULTIPLIER = 1.0;

/**
 * Convert color surcharge percentage (0-100) to multiplier (1.0-2.0)
 *
 * Examples:
 * - 0% → 1.0 (no surcharge)
 * - 10% → 1.1 (10% surcharge)
 * - 50% → 1.5 (50% surcharge)
 *
 * @param percentage - Color surcharge percentage (0-100)
 * @returns Color multiplier (1.0-2.0)
 */
function convertPercentageToMultiplier(percentage?: number): number {
  if (percentage === undefined || percentage === 0) {
    return BASE_MULTIPLIER;
  }
  return BASE_MULTIPLIER + percentage / PERCENTAGE_DIVISOR;
}

/**
 * Adapt tRPC input to domain PriceCalculationInput
 *
 * Transforms infrastructure layer types to domain layer types:
 * - Numbers → Money value objects
 * - Percentage → Multiplier
 * - Primitive types → Domain types
 *
 * @param input - tRPC price input from calculate-item mutation
 * @returns Domain PriceCalculationInput
 */
export function adaptTRPCToDomain(
  input: TRPCPriceInput
): PriceCalculationInput {
  // Convert dimensions to value object
  const dimensions = new Dimensions({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    minWidthMm: input.modelPrices.minWidthMm,
    minHeightMm: input.modelPrices.minHeightMm,
  });

  // Convert model prices to Money instances
  const modelPrices = {
    basePrice: new Money(input.modelPrices.basePrice),
    costPerMmWidth: new Money(input.modelPrices.costPerMmWidth),
    costPerMmHeight: new Money(input.modelPrices.costPerMmHeight),
    accessoryPrice: input.modelPrices.accessoryPrice
      ? new Money(input.modelPrices.accessoryPrice)
      : undefined,
  };

  // Convert color surcharge percentage to multiplier
  const colorMultiplier = convertPercentageToMultiplier(
    input.colorSurchargePercentage
  );

  // Convert glass pricing if provided
  const glass = input.glass
    ? {
        pricePerSqm: new Money(input.glass.pricePerSqm),
        discountWidthMm: input.glass.discountWidthMm,
        discountHeightMm: input.glass.discountHeightMm,
      }
    : undefined;

  // Convert services if provided
  const services: ServiceAmountInput[] | undefined = input.services
    ? input.services.map((svc) => ({
        serviceId: svc.serviceId,
        name: svc.name,
        unit: svc.unit,
        rate: new Money(svc.rate),
        minimumBillingUnit: svc.minimumBillingUnit,
        quantityOverride: svc.quantityOverride,
      }))
    : undefined;

  // Convert adjustments if provided
  const adjustments: AdjustmentInput[] | undefined = input.adjustments
    ? input.adjustments.map((adj) => ({
        adjustmentId: adj.adjustmentId,
        concept: adj.concept,
        unit: adj.unit,
        value: adj.value,
        isPositive: adj.sign === "positive",
      }))
    : undefined;

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
 * tRPC output shape for services
 */
type TRPCServiceOutput = {
  serviceId: string;
  unit: ServiceUnit;
  quantity: number;
  amount: number;
};

/**
 * tRPC output shape for adjustments
 */
type TRPCAdjustmentOutput = {
  concept: string;
  amount: number;
};

/**
 * tRPC output shape (for calculate-item mutation result)
 */
export type TRPCPriceOutput = {
  dimPrice: number;
  accPrice: number;
  colorSurchargePercentage?: number;
  colorSurchargeAmount?: number;
  services: TRPCServiceOutput[];
  adjustments: TRPCAdjustmentOutput[];
  subtotal: number;
};

/**
 * Adapt domain PriceCalculationResult to tRPC output format
 *
 * Transforms domain layer types back to infrastructure layer types:
 * - Money → number
 * - ServiceResult → TRPCServiceOutput
 * - AdjustmentResult → TRPCAdjustmentOutput
 * - Calculates legacy dimPrice (profile + glass)
 * - Reconstructs color surcharge info from multiplier
 *
 * @param result - Domain PriceCalculationResult
 * @param colorSurchargePercentage - Original percentage from input (for output)
 * @returns tRPC output format
 */
export function adaptDomainToTRPC(
  result: PriceCalculationResult,
  colorSurchargePercentage?: number
): TRPCPriceOutput {
  // Calculate dimPrice (profile + glass) for legacy compatibility
  const dimPrice = result.profileCost.add(result.glassCost).toNumber();

  // Convert services to tRPC format
  const services: TRPCServiceOutput[] = result.services.map((svc) => ({
    serviceId: svc.serviceId,
    unit: svc.unit,
    quantity: svc.quantity,
    amount: svc.amount,
  }));

  // Convert adjustments to tRPC format
  const adjustments: TRPCAdjustmentOutput[] = result.adjustments.map((adj) => ({
    concept: adj.concept,
    amount: adj.amount,
  }));

  // Build output
  const output: TRPCPriceOutput = {
    dimPrice,
    accPrice: result.accessoryCost.toNumber(),
    services,
    adjustments,
    subtotal: result.subtotal.toNumber(),
  };

  // Add color surcharge info if applicable
  if (colorSurchargePercentage !== undefined && colorSurchargePercentage > 0) {
    output.colorSurchargePercentage = colorSurchargePercentage;

    // Calculate color surcharge amount
    // The domain already applied the multiplier, so we need to extract the surcharge
    // Formula: surcharge = (current - original) where current = original × multiplier
    // Therefore: surcharge = current × (1 - 1/multiplier)
    const multiplier =
      BASE_MULTIPLIER + colorSurchargePercentage / PERCENTAGE_DIVISOR;
    const profilePlusAccessory = result.profileCost.add(result.accessoryCost);
    const surchargeMultiplier = 1 - 1 / multiplier;
    const surchargeAmount = profilePlusAccessory.multiply(surchargeMultiplier);
    output.colorSurchargeAmount = surchargeAmount.toNumber();
  }

  return output;
}
