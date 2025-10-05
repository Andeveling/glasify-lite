// src/server/api/routers/catalog/catalog.utils.ts
import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Type representing a model with Decimal price fields from Prisma
 */
type ModelWithDecimalFields = {
  accessoryPrice?: Decimal | null;
  basePrice: Decimal;
  costPerMmHeight: Decimal;
  costPerMmWidth: Decimal;
};

/**
 * Serialize Decimal fields to numbers for JSON serialization
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
 * Serialize a complete model with manufacturer info
 * @deprecated Use serializeDecimalFields directly
 */
export function serializeModel<T extends ModelWithDecimalFields>(model: T) {
  return serializeDecimalFields(model);
}
