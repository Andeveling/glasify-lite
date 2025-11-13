/**
 * @file Model Factory
 * @description Generates type-safe test data for Model (window/door models) seeding
 * Pure functions with no ORM dependencies - generates POJOs only
 *
 * Features:
 * - Realistic dimensions (width/height min/max)
 * - Pricing structure (base + cost per mm)
 * - Compatible glass types
 * - Model status (draft, published)
 *
 * NOTE: Uses Zod insert schema types (number) not raw table types (string/text)
 */
/** biome-ignore-all lint/style/noNonNullAssertion: Factory pattern uses optional chaining with non-null assertions for type narrowing */
/** biome-ignore-all lint/style/noMagicNumbers: Domain-specific constants (dimensions, prices, percentages) are meaningful in context */

import type { z } from "zod";
import type { MODEL_STATUS_VALUES } from "@/server/db/schemas/enums.schema";
import { modelInsertSchema } from "@/server/db/schemas/model.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Infer type from Zod schema (not table schema) to match validation
type ModelInsertInput = z.infer<typeof modelInsertSchema>;

// Constants
const DEFAULT_IMAGE_URL = "https://placehold.co/400x300";
const ACTIVE_STATUS_PROBABILITY = 0.8;
const HAS_ACCESSORY_PROBABILITY = 0.6;
const HAS_PROFIT_MARGIN_PROBABILITY = 0.7;
const HAS_COST_NOTES_PROBABILITY = 0.4;

// Dimension ranges (in mm)
const MIN_WINDOW_WIDTH = 500; // 50cm
const MAX_WINDOW_WIDTH = 3000; // 3m
const MIN_WINDOW_HEIGHT = 500; // 50cm
const MAX_WINDOW_HEIGHT = 3000; // 3m

// Pricing ranges (COP)
const MIN_BASE_PRICE = 100_000; // 100k COP
const MAX_BASE_PRICE = 500_000; // 500k COP
const MIN_COST_PER_MM = 50; // COP/mm
const MAX_COST_PER_MM = 500; // COP/mm
const MIN_ACCESSORY_PRICE = 20_000; // 20k COP
const MAX_ACCESSORY_PRICE = 200_000; // 200k COP
const MIN_PROFIT_MARGIN = 5; // 5%
const MAX_PROFIT_MARGIN = 40; // 40%

// Glass discount (frame overlap)
const MIN_GLASS_DISCOUNT = 0; // mm
const MAX_GLASS_DISCOUNT = 100; // mm (10cm max)

// Model name templates
const MODEL_TYPES = [
  "Corredera",
  "Abatible",
  "Fija",
  "Guillotina",
  "Proyectante",
  "Batiente",
] as const;

const MODEL_SERIES = [
  "Standard",
  "Premium",
  "Eco",
  "Pro",
  "Elite",
  "Classic",
] as const;

// Helper functions
function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number.parseFloat(value.toFixed(decimals));
}

/**
 * Generate realistic model name
 */
function generateModelName(): string {
  const type = randomElement(MODEL_TYPES);
  const series = randomElement(MODEL_SERIES);
  return `${type} ${series}`;
}

/**
 * Generate random dimensions ensuring min < max
 */
function generateDimensions(): {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
} {
  const minWidth = randomInt(MIN_WINDOW_WIDTH, MAX_WINDOW_WIDTH - 500);
  const maxWidth = randomInt(minWidth + 300, MAX_WINDOW_WIDTH);

  const minHeight = randomInt(MIN_WINDOW_HEIGHT, MAX_WINDOW_HEIGHT - 500);
  const maxHeight = randomInt(minHeight + 300, MAX_WINDOW_HEIGHT);

  return { minWidth, maxWidth, minHeight, maxHeight };
}

/**
 * Generate base price (as string for decimal DB column)
 */
function generateBasePrice(): string {
  const value = randomInt(MIN_BASE_PRICE, MAX_BASE_PRICE);
  return value.toFixed(4);
}

/**
 * Generate cost per millimeter (as string for decimal DB column)
 */
function generateCostPerMm(): string {
  const COST_DECIMALS = 4;
  const value = randomDecimal(MIN_COST_PER_MM, MAX_COST_PER_MM, COST_DECIMALS);
  return value.toFixed(COST_DECIMALS);
}

/**
 * Generate accessory price (as string for decimal DB column)
 */
function generateAccessoryPrice(): string | undefined {
  if (!randomBoolean(HAS_ACCESSORY_PROBABILITY)) {
    return;
  }
  const value = randomInt(MIN_ACCESSORY_PRICE, MAX_ACCESSORY_PRICE);
  return value.toFixed(4);
}

/**
 * Generate profit margin percentage (as string for decimal DB column)
 */
function generateProfitMargin(): string | undefined {
  if (!randomBoolean(HAS_PROFIT_MARGIN_PROBABILITY)) {
    return;
  }
  const MARGIN_DECIMALS = 2;
  const value = randomDecimal(
    MIN_PROFIT_MARGIN,
    MAX_PROFIT_MARGIN,
    MARGIN_DECIMALS
  );
  return value.toFixed(MARGIN_DECIMALS);
}

/**
 * Generate glass discount (frame overlap)
 */
function generateGlassDiscount(): number {
  return randomInt(MIN_GLASS_DISCOUNT, MAX_GLASS_DISCOUNT);
}

/**
 * Generate compatible glass type IDs
 * In real usage, these should be actual UUIDs from database
 */
function generateCompatibleGlassTypeIds(): string[] {
  const MIN_GLASS_TYPES = 1;
  const MAX_GLASS_TYPES = 5;
  const count = randomInt(MIN_GLASS_TYPES, MAX_GLASS_TYPES);
  return Array.from({ length: count }, () => crypto.randomUUID());
}

/**
 * Generate cost notes
 */
function generateCostNotes(): string | undefined {
  if (!randomBoolean(HAS_COST_NOTES_PROBABILITY)) {
    return;
  }

  const templates = [
    "Incluye herrajes estándar",
    "Precio sujeto a revisión trimestral",
    "Descuento por volumen disponible",
    "Incluye instalación básica",
    "Costos actualizados al mes actual",
  ];

  return randomElement(templates);
}

/**
 * Generate model status
 */
function generateStatus(): (typeof MODEL_STATUS_VALUES)[number] {
  const PUBLISH_VS_DRAFT_SPLIT = 0.5;
  // 80% published, 20% draft
  if (randomBoolean(ACTIVE_STATUS_PROBABILITY)) {
    return "published";
  }
  return randomBoolean(PUBLISH_VS_DRAFT_SPLIT) ? "draft" : "draft";
}

/**
 * Generate a single Model POJO
 *
 * @param options - Factory options with overrides
 * @returns FactoryResult with generated data or validation error
 *
 * @example
 * ```typescript
 * const result = generateModel();
 * if (result.success) {
 *   console.log(result.data); // { name: 'Corredera Premium', basePrice: 250000, ... }
 * }
 * ```
 */
export function generateModel(
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  const dimensions = generateDimensions();

  const defaults: ModelInsertInput = {
    name: generateModelName(),
    imageUrl: DEFAULT_IMAGE_URL,
    status: generateStatus(),
    minWidthMm: dimensions.minWidth,
    maxWidthMm: dimensions.maxWidth,
    minHeightMm: dimensions.minHeight,
    maxHeightMm: dimensions.maxHeight,
    basePrice: Number.parseFloat(generateBasePrice()),
    costPerMmWidth: Number.parseFloat(generateCostPerMm()),
    costPerMmHeight: Number.parseFloat(generateCostPerMm()),
    accessoryPrice: generateAccessoryPrice()
      ? Number.parseFloat(generateAccessoryPrice()!)
      : undefined,
    glassDiscountWidthMm: generateGlassDiscount(),
    glassDiscountHeightMm: generateGlassDiscount(),
    compatibleGlassTypeIds: generateCompatibleGlassTypeIds(),
    profitMarginPercentage: generateProfitMargin()
      ? Number.parseFloat(generateProfitMargin()!)
      : undefined,
    lastCostReviewDate: undefined,
    costNotes: generateCostNotes(),
    profileSupplierId: undefined,
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = modelInsertSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((err) => ({
          code: err.code,
          context: {
            expected: "expected" in err ? err.expected : undefined,
            received: "received" in err ? err.received : undefined,
          },
          message: err.message,
          path: err.path.map(String),
        })),
      };
    }

    // Zod schema already validates min < max, so we just return
    return createSuccessResult(parsed.data);
  }

  return createSuccessResult(data);
}

/**
 * Generate multiple Models
 */
export function generateModels(
  count: number,
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput>[] {
  return Array.from({ length: count }, () => generateModel(options));
}

/**
 * Generate a batch of valid Models (only successful results)
 */
export function generateModelBatch(
  count: number,
  options?: FactoryOptions<ModelInsertInput>
): ModelInsertInput[] {
  const results = generateModels(count, options);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<ModelInsertInput> & {
        success: true;
        data: ModelInsertInput;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate model with specific status
 */
export function generateModelWithStatus(
  status: (typeof MODEL_STATUS_VALUES)[number],
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  return generateModel({
    ...options,
    overrides: {
      ...options?.overrides,
      status,
    },
  });
}

/**
 * Generate published model
 */
export function generatePublishedModel(
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  return generateModelWithStatus("published", options);
}

/**
 * Generate draft model
 */
export function generateDraftModel(
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  return generateModelWithStatus("draft", options);
}

/**
 * Generate model with profile supplier
 */
export function generateModelWithProfileSupplier(
  profileSupplierId: string,
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  return generateModel({
    ...options,
    overrides: {
      ...options?.overrides,
      profileSupplierId,
    },
  });
}

/**
 * Generate model with specific glass type compatibility
 */
export function generateModelWithGlassTypes(
  compatibleGlassTypeIds: string[],
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  return generateModel({
    ...options,
    overrides: {
      ...options?.overrides,
      compatibleGlassTypeIds,
    },
  });
}

/**
 * Generate model with custom dimensions
 */
export function generateModelWithDimensions(
  dimensions: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  },
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  return generateModel({
    ...options,
    overrides: {
      minWidthMm: dimensions.minWidth,
      maxWidthMm: dimensions.maxWidth,
      minHeightMm: dimensions.minHeight,
      maxHeightMm: dimensions.maxHeight,
      ...options?.overrides,
    },
  });
}

/**
 * Generate model with custom pricing
 */
export function generateModelWithPricing(
  pricing: {
    basePrice: number;
    costPerMmWidth: number;
    costPerMmHeight: number;
    accessoryPrice?: number;
  },
  options?: FactoryOptions<ModelInsertInput>
): FactoryResult<ModelInsertInput> {
  return generateModel({
    ...options,
    overrides: {
      basePrice: pricing.basePrice,
      costPerMmWidth: pricing.costPerMmWidth,
      costPerMmHeight: pricing.costPerMmHeight,
      accessoryPrice: pricing.accessoryPrice,
      ...options?.overrides,
    },
  });
}
