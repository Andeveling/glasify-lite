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
  MIN_DIMENSION_MM,
} from "../_constants/model-form.constants";
import type { modelFormSchema } from "../_schemas/model-form.schema";

export type ModelFormValues = z.infer<typeof modelFormSchema>;

/**
 * Transform form values to API-compatible format
 * Converts null to undefined for backend compatibility
 */
export function transformModelFormValues(values: ModelFormValues) {
  return {
    ...values,
    accessoryPrice: values.accessoryPrice ?? undefined,
    costNotes: values.costNotes ?? undefined,
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
    basePrice = MIN_DIMENSION_MM,
    compatibleGlassTypeIds = [],
    costNotes = null,
    costPerMmHeight = 0,
    costPerMmWidth = 0,
    glassDiscountHeightMm = 0,
    glassDiscountWidthMm = 0,
    imageUrl,
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
    imageUrl,
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
