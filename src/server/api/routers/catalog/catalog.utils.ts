// src/server/api/routers/catalog/catalog.utils.ts
import type { Decimal } from '@prisma/client/runtime/library';

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
};

/**
 * Serializes Prisma Decimal fields to numbers for JSON transmission
 *
 * Converts Prisma's Decimal type to plain JavaScript numbers to enable
 * JSON serialization in tRPC responses. All monetary values and dimensions
 * are converted using the `.toNumber()` method.
 *
 * @template T - Model type extending ModelWithDecimalFields
 * @param model - Prisma model with Decimal fields
 * @returns Object with Decimal fields converted to numbers
 *
 * @example
 * ```typescript
 * const model = await db.model.findUnique({ where: { id } });
 * const serialized = serializeDecimalFields(model);
 * // serialized.basePrice is now a number, not Decimal
 * ```
 */
export function serializeDecimalFields<T extends ModelWithDecimalFields>(model: T) {
  return {
    ...model,
    accessoryPrice: model.accessoryPrice?.toNumber() ?? null,
    basePrice: model.basePrice.toNumber(),
    costPerMmHeight: model.costPerMmHeight.toNumber(),
    costPerMmWidth: model.costPerMmWidth.toNumber(),
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
