/**
 * Price Breakdown Builder
 * Pure utility for building detailed price breakdown items from calculation results
 */

import type { PriceItemCalculationResult } from "@/domain/pricing/adapters/trpc/price-calculator.adapter";
import type {
  GlassTypeOutput,
  ModelDetailOutput,
  ServiceOutput,
} from "@/server/api/routers/catalog";

export type PriceBreakdownItem = {
  amount: number;
  category: "model" | "glass" | "service" | "adjustment" | "color";
  label: string;
};

type BuildPriceBreakdownParams = {
  breakdown: PriceItemCalculationResult | null;
  glassArea: number;
  model: ModelDetailOutput;
  selectedGlassType: GlassTypeOutput | undefined;
  services: ServiceOutput[];
};

/**
 * Helper: Add model price items
 */
function addModelPriceItems(
  items: PriceBreakdownItem[],
  modelOnlyPrice: number
) {
  if (modelOnlyPrice > 0) {
    items.push({
      amount: modelOnlyPrice,
      category: "model",
      label: "Precio base del modelo",
    });
  }
}

/**
 * Helper: Add glass price item
 */
function addGlassPriceItem(
  items: PriceBreakdownItem[],
  glassCost: number,
  selectedGlassType: GlassTypeOutput | undefined,
  glassArea: number
) {
  if (glassCost > 0 && selectedGlassType) {
    items.push({
      amount: glassCost,
      category: "glass",
      label: `Vidrio ${selectedGlassType.name} (${glassArea.toFixed(2)} m²)`,
    });
  }
}

/**
 * Helper: Add accessories price item
 */
function addAccessoriesPriceItem(
  items: PriceBreakdownItem[],
  accPrice: number
) {
  if (accPrice > 0) {
    items.push({
      amount: accPrice,
      category: "model",
      label: "Accesorios",
    });
  }
}

/**
 * Helper: Add color surcharge item
 */
function addColorSurchargeItem(
  items: PriceBreakdownItem[],
  breakdown: PriceItemCalculationResult
) {
  if (breakdown.colorSurchargeAmount && breakdown.colorSurchargeAmount > 0) {
    items.push({
      amount: breakdown.colorSurchargeAmount,
      category: "color",
      label: `Recargo de color (+${breakdown.colorSurchargePercentage}%)`,
    });
  }
}

/**
 * Helper: Add service items
 */
function addServiceItems(
  items: PriceBreakdownItem[],
  breakdown: PriceItemCalculationResult,
  services: ServiceOutput[]
) {
  if (breakdown.services.length === 0) {
    return;
  }

  const servicesById = services.reduce(
    (acc, svc) => {
      acc[svc.id] = svc;
      return acc;
    },
    {} as Record<string, ServiceOutput>
  );

  for (const svc of breakdown.services) {
    const serviceData = servicesById[svc.serviceId];
    if (serviceData) {
      items.push({
        amount: svc.amount,
        category: "service",
        label: serviceData.name,
      });
    }
  }
}

/**
 * Helper: Add adjustment items
 */
function addAdjustmentItems(
  items: PriceBreakdownItem[],
  breakdown: PriceItemCalculationResult
) {
  if (breakdown.adjustments.length === 0) {
    return;
  }

  for (const adj of breakdown.adjustments) {
    items.push({
      amount: adj.amount,
      category: "adjustment",
      label: adj.concept,
    });
  }
}

/**
 * Build detailed price breakdown items for display
 *
 * @param params - Breakdown data and context
 * @returns Array of categorized price items
 *
 * @example
 * buildPriceBreakdown({
 *   breakdown: { dimPrice: 1000, accPrice: 100, services: [], adjustments: [] },
 *   model: { basePrice: 800 },
 *   glassArea: 2.5,
 *   selectedGlassType: { name: "Templado", pricePerSqm: 80 },
 *   services: []
 * })
 * // Returns: [
 * //   { category: "model", label: "Precio base del modelo", amount: 800 },
 * //   { category: "glass", label: "Vidrio Templado (2.50 m²)", amount: 200 },
 * //   { category: "model", label: "Accesorios", amount: 100 }
 * // ]
 */
export function buildPriceBreakdown({
  breakdown,
  glassArea,
  model,
  selectedGlassType,
  services,
}: BuildPriceBreakdownParams): PriceBreakdownItem[] {
  const items: PriceBreakdownItem[] = [];

  if (!breakdown) {
    // Fallback: show base price only
    items.push({
      amount: Number(model.basePrice),
      category: "model",
      label: "Precio base del modelo",
    });
    return items;
  }

  // Calculate glass cost (with discounts applied)
  const glassCost = selectedGlassType
    ? glassArea * selectedGlassType.pricePerSqm
    : 0;

  // Model price (dimPrice includes base + area factor, but NOT glass cost)
  const modelOnlyPrice = breakdown.dimPrice - glassCost;

  // Add all breakdown items
  addModelPriceItems(items, modelOnlyPrice);
  addGlassPriceItem(items, glassCost, selectedGlassType, glassArea);
  addAccessoriesPriceItem(items, breakdown.accPrice);
  addColorSurchargeItem(items, breakdown);
  addServiceItems(items, breakdown, services);
  addAdjustmentItems(items, breakdown);

  return items;
}
