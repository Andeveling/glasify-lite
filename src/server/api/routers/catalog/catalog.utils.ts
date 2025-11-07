// src/server/api/routers/catalog/catalog.utils.ts
import type { Decimal } from "@prisma/client/runtime/library";
import { Money } from "@/domain/pricing/core/entities/money";
import { MarginCalculator } from "@/domain/pricing/core/services/margin-calculator";

/**
 * Type representing a model with Decimal price fields from Prisma
 *
 * Prisma's Decimal type cannot be directly serialized to JSON,
 * so it needs to be converted to number or string.
 */
type ModelWithDecimalFields = {
  accessoryPrice?: Decimal | null;
  basePrice: Decimal;
  costPerMmHeight: Decimal;
  costPerMmWidth: Decimal;
  profitMarginPercentage?: Decimal | null;
};

/**
 * Serializes Prisma Decimal fields to numbers for JSON transmission
 *
 * Converts Prisma's Decimal type to plain JavaScript numbers to enable
 * JSON serialization in tRPC responses. All monetary values and dimensions
 * are converted using the `.toNumber()` method.
 *
 * **Profit Margin Application**:
 * - Uses domain layer (MarginCalculator) for correct margin calculation
 * - Formula: salesPrice = cost / (1 - marginPercentage/100)
 * - Example: basePrice=$100, profitMargin=20% → salesPrice=$125
 * - Verification: ($125 - $100) / $125 = 25/125 = 0.2 = 20% ✓
 * - This ensures catalog displays public-facing prices with correct margin
 *
 * @template T - Model type extending ModelWithDecimalFields
 * @param model - Prisma model with Decimal fields
 * @returns Object with Decimal fields converted to numbers and profit margin applied to basePrice
 *
 * @example
 * ```typescript
 * const model = await db.model.findUnique({ where: { id } });
 * const serialized = serializeDecimalFields(model);
 * // serialized.basePrice includes profit margin (public sales price)
 * ```
 */
export function serializeDecimalFields<T extends ModelWithDecimalFields>(
  model: T
) {
  // Calculate final base price with profit margin using domain layer
  const rawBasePrice = model.basePrice.toNumber();
  const profitMargin = model.profitMarginPercentage?.toNumber() ?? 0;

  // Use MarginCalculator from domain for correct margin calculation
  // Formula: salesPrice = cost / (1 - margin%)
  const basePriceMoney = new Money(rawBasePrice);
  const salesPriceMoney = MarginCalculator.calculateSalesPrice(
    basePriceMoney,
    profitMargin
  );
  const finalBasePrice = salesPriceMoney.toNumber();

  return {
    ...model,
    accessoryPrice: model.accessoryPrice?.toNumber() ?? null,
    basePrice: finalBasePrice, // Public-facing price with profit margin
    costPerMmHeight: model.costPerMmHeight.toNumber(),
    costPerMmWidth: model.costPerMmWidth.toNumber(),
    profitMarginPercentage: profitMargin, // Keep as number for reference
  };
}

/**
 * Serialize a complete model with profile supplier info
 *
 * @deprecated Use serializeDecimalFields directly. This function is redundant.
 * @template T - Model type extending ModelWithDecimalFields
 * @param model - Prisma model with Decimal fields
 * @returns Object with serialized Decimal fields
 */
export function serializeModel<T extends ModelWithDecimalFields>(model: T) {
  return serializeDecimalFields(model);
}
