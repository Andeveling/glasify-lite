/**
 * Price Breakdown Builder
 * Pure utility for building detailed price breakdown items from calculation results
 */

import type { PriceItemCalculationResult } from "@/server/price/price-item";
import type {
  GlassTypeOutput,
  ModelDetailOutput,
  ServiceOutput,
} from "@/server/api/routers/catalog";

export type PriceBreakdownItem = {
  amount: number;
  category: "model" | "glass" | "service" | "adjustment";
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

  if (modelOnlyPrice > 0) {
    items.push({
      amount: modelOnlyPrice,
      category: "model",
      label: "Precio base del modelo",
    });
  }

  // Glass type (show area calculation with discounts applied)
  if (glassCost > 0 && selectedGlassType) {
    items.push({
      amount: glassCost,
      category: "glass",
      label: `Vidrio ${selectedGlassType.name} (${glassArea.toFixed(2)} m²)`,
    });
  }

  // Accessories
  if (breakdown.accPrice > 0) {
    items.push({
      amount: breakdown.accPrice,
      category: "model",
      label: "Accesorios",
    });
  }

  // Services
  if (breakdown.services.length > 0) {
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

  // Adjustments
  if (breakdown.adjustments.length > 0) {
    for (const adj of breakdown.adjustments) {
      items.push({
        amount: adj.amount,
        category: "adjustment",
        label: adj.concept,
      });
    }
  }

  return items;
}
