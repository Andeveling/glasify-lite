/**
 * Model form utilities
 * Handles data transformation and validation
 */

import type { z } from "zod";
import {
  DEFAULT_MAX_HEIGHT_MM,
  DEFAULT_MAX_WIDTH_MM,
  DEFAULT_MIN_HEIGHT_MM,
  DEFAULT_MIN_WIDTH_MM,
} from "../_constants/model-form.constants";
import type { modelFormSchema } from "../_schemas/model-form.schema";

export type ModelFormValues = z.infer<typeof modelFormSchema>;

/**
 * Transform form values to API-compatible format
 * Converts null to undefined for backend compatibility
 * Converts undefined to 0 for required numeric fields
 */
export function transformModelFormValues(values: ModelFormValues) {
  return {
    ...values,
    accessoryPrice: values.accessoryPrice ?? undefined,
    basePrice: values.basePrice ?? 0,
    costNotes: values.costNotes ?? undefined,
    costPerMmHeight: values.costPerMmHeight ?? 0,
    costPerMmWidth: values.costPerMmWidth ?? 0,
    imageUrl: values.imageUrl ?? undefined,
    lastCostReviewDate: values.lastCostReviewDate ?? undefined,
    profileSupplierId: values.profileSupplierId ?? undefined,
    profitMarginPercentage: values.profitMarginPercentage ?? undefined,
  };
}

/**
 * Get default values for form initialization
 */
export function getModelFormDefaults(
  initialData: Partial<ModelFormValues> = {}
): ModelFormValues {
  const {
    accessoryPrice = null,
    basePrice = null,
    compatibleGlassTypeIds = [],
    costNotes = null,
    costPerMmHeight = null,
    costPerMmWidth = null,
    glassDiscountHeightMm = 0,
    glassDiscountWidthMm = 0,
    lastCostReviewDate = null,
    maxHeightMm = DEFAULT_MAX_HEIGHT_MM,
    maxWidthMm = DEFAULT_MAX_WIDTH_MM,
    minHeightMm = DEFAULT_MIN_HEIGHT_MM,
    minWidthMm = DEFAULT_MIN_WIDTH_MM,
    name = "",
    profileSupplierId = null,
    profitMarginPercentage = null,
    status = "draft",
  } = initialData;

  return {
    accessoryPrice,
    basePrice,
    compatibleGlassTypeIds,
    costNotes,
    costPerMmHeight,
    costPerMmWidth,
    glassDiscountHeightMm,
    glassDiscountWidthMm,
    imageUrl: initialData.imageUrl || undefined,
    lastCostReviewDate,
    maxHeightMm,
    maxWidthMm,
    minHeightMm,
    minWidthMm,
    name,
    profileSupplierId,
    profitMarginPercentage,
    status,
  };
}
