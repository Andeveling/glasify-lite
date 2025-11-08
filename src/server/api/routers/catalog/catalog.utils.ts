// src/server/api/routers/catalog/catalog.utils.ts
import { Money } from "@/domain/pricing/core/entities/money";
import { MarginCalculator } from "@/domain/pricing/core/services/margin-calculator";

/**
 * Type representing a model with numeric fields from Drizzle
 *
 * Drizzle stores Decimal/Numeric/Integer types as strings for precision.
 * Boolean values might also be stored as strings "true"/"false".
 * They need to be converted to numbers/booleans for JSON transmission.
 */
type ModelWithNumericFields = {
  accessoryPrice?: string | null;
  basePrice?: string;
  costPerMmHeight?: string;
  costPerMmWidth?: string;
  glassDiscountHeightMm?: string;
  glassDiscountWidthMm?: string;
  isSeeded?: string; // "true" or "false" from Drizzle
  maxHeightMm?: string;
  maxWidthMm?: string;
  minHeightMm?: string;
  minWidthMm?: string;
  profitMarginPercentage?: string | null;
  thicknessMm?: string;
  pricePerSqm?: string;
  uValue?: string | null;
};

/**
 * Serializes Drizzle string-based numeric fields to numbers for JSON transmission
 *
 * Converts Drizzle's string representation of Decimal/Numeric/Integer types to plain
 * JavaScript numbers for JSON serialization in tRPC responses. All monetary
 * values, dimensions, and numeric values are converted using `Number.parseFloat()`.
 *
 * **Profit Margin Application (for models)**:
 * - Uses domain layer (MarginCalculator) for correct margin calculation
 * - Formula: salesPrice = cost / (1 - marginPercentage/100)
 * - Example: basePrice=$100, profitMargin=20% → salesPrice=$125
 * - Verification: ($125 - $100) / $125 = 25/125 = 0.2 = 20% ✓
 * - This ensures catalog displays public-facing prices with correct margin
 *
 * @template T - Entity type extending ModelWithNumericFields
 * @param entity - Drizzle entity with numeric fields as strings
 * @returns Object with numeric fields converted to numbers and profit margin applied to basePrice (if present)
 *
 * @example
 * ```typescript
 * const model = await db.select().from(models).where(eq(models.id, id));
 * const serialized = serializeDecimalFields(model[0]);
 * // serialized.basePrice includes profit margin (public sales price)
 * ```
 */
export function serializeDecimalFields<
  T extends Partial<ModelWithNumericFields>,
>(
  entity: T
): T & {
  accessoryPrice?: number | null;
  basePrice?: number;
  costPerMmHeight?: number;
  costPerMmWidth?: number;
  glassDiscountHeightMm?: number;
  glassDiscountWidthMm?: number;
  isSeeded?: boolean;
  maxHeightMm?: number;
  maxWidthMm?: number;
  minHeightMm?: number;
  minWidthMm?: number;
  profitMarginPercentage?: number;
  thicknessMm?: number;
  pricePerSqm?: number;
  uValue?: number | null;
} {
  const result: Record<string, unknown> = { ...entity };

  // Helper to convert string to number or null
  const parseOptional = (value: string | null | undefined) =>
    value ? Number.parseFloat(value) : null;

  // Helper to convert string to number
  const parseRequired = (value: string | undefined) =>
    value !== undefined ? Number.parseFloat(value) : undefined;

  // Convert all numeric fields
  result.accessoryPrice = parseOptional(entity.accessoryPrice);
  result.costPerMmHeight = parseRequired(entity.costPerMmHeight);
  result.costPerMmWidth = parseRequired(entity.costPerMmWidth);
  result.glassDiscountHeightMm = parseRequired(entity.glassDiscountHeightMm);
  result.glassDiscountWidthMm = parseRequired(entity.glassDiscountWidthMm);
  result.maxHeightMm = parseRequired(entity.maxHeightMm);
  result.maxWidthMm = parseRequired(entity.maxWidthMm);
  result.minHeightMm = parseRequired(entity.minHeightMm);
  result.minWidthMm = parseRequired(entity.minWidthMm);
  result.thicknessMm = parseRequired(entity.thicknessMm);
  result.pricePerSqm = parseRequired(entity.pricePerSqm);
  result.uValue = parseOptional(entity.uValue);

  // Convert boolean fields stored as strings
  if (entity.isSeeded !== undefined) {
    result.isSeeded = entity.isSeeded === "true";
  }

  // Calculate final base price with profit margin using domain layer (for models only)
  if (entity.basePrice !== undefined) {
    const rawBasePrice = Number.parseFloat(entity.basePrice);
    const profitMargin = entity.profitMarginPercentage
      ? Number.parseFloat(entity.profitMarginPercentage)
      : 0;

    // Use MarginCalculator from domain for correct margin calculation
    const basePriceMoney = new Money(rawBasePrice);
    const salesPriceMoney = MarginCalculator.calculateSalesPrice(
      basePriceMoney,
      profitMargin
    );

    result.basePrice = salesPriceMoney.toNumber();
    result.profitMarginPercentage = profitMargin;
  }

  return result as T & {
    accessoryPrice?: number | null;
    basePrice?: number;
    costPerMmHeight?: number;
    costPerMmWidth?: number;
    glassDiscountHeightMm?: number;
    glassDiscountWidthMm?: number;
    isSeeded?: boolean;
    maxHeightMm?: number;
    maxWidthMm?: number;
    minHeightMm?: number;
    minWidthMm?: number;
    profitMarginPercentage?: number;
    thicknessMm?: number;
    pricePerSqm?: number;
    uValue?: number | null;
  };
}

/**
 * Serialize a complete model with profile supplier info
 *
 * @deprecated Use serializeDecimalFields directly. This function is redundant.
 * @template T - Entity type extending ModelWithNumericFields
 * @param entity - Drizzle entity with numeric fields as strings
 * @returns Object with serialized numeric fields
 */
export function serializeModel<T extends Partial<ModelWithNumericFields>>(
  entity: T
) {
  return serializeDecimalFields(entity);
}
