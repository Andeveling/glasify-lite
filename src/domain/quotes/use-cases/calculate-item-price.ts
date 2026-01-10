/**
 * CalculateItemPriceUseCase - Use Case
 *
 * Orquesta el cálculo de precio de un ítem para cotización:
 * 1. Validar modelo y dimensiones
 * 2. Obtener datos de vidrio y servicios
 * 3. Calcular precio usando el dominio pricing
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type { GlassType, Model, Service } from "@prisma/client";
import {
  validateColorSurcharge,
  validateDimensions,
  validateGlassTypeCompatibility,
  validateModelAvailability,
  validateQuantity,
} from "../services/quote-validator.service";

/**
 * Input para calcular precio de un ítem
 */
export type CalculateItemPriceInput = {
  modelId: string;
  glassTypeId: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  unit: "unit" | "sqm" | "ml";
  services: Array<{
    serviceId: string;
    quantity?: number;
  }>;
  adjustments: Array<{
    concept: string;
    sign: "positive" | "negative";
    unit: "unit" | "sqm" | "ml";
    value: number;
  }>;
  colorSurchargePercentage?: number;
};

/**
 * Output del cálculo de precio
 */
export type CalculateItemPriceOutput = {
  dimPrice: number;
  accPrice: number;
  colorSurchargePercentage?: number;
  colorSurchargeAmount?: number;
  services: Array<{
    serviceId: string;
    unit: "unit" | "sqm" | "ml";
    quantity: number;
    amount: number;
  }>;
  adjustments: Array<{
    concept: string;
    amount: number;
  }>;
  subtotal: number;
};

/**
 * Dependencies (ports) que necesita el use-case
 */
export type CalculateItemPriceDeps = {
  // Repositories
  findModel: (id: string) => Promise<
    | (Model & {
        profileSupplier?: { id: string; name: string } | null;
      })
    | null
  >;
  findGlassType: (id: string) => Promise<GlassType | null>;
  findServices: (ids: string[]) => Promise<Service[]>;

  // Domain services - adaptador para transformar y calcular
  calculatePrice: (input: {
    widthMm: number;
    heightMm: number;
    modelPrices: {
      basePrice: number;
      costPerMmWidth: number;
      costPerMmHeight: number;
      minWidthMm: number;
      minHeightMm: number;
      accessoryPrice?: number;
    };
    colorSurchargePercentage?: number;
    profitMarginPercentage?: number;
    glass?: {
      pricePerSqm: number;
      discountWidthMm?: number;
      discountHeightMm?: number;
    };
    services: Array<{
      serviceId: string;
      name: string;
      unit: "unit" | "sqm" | "ml";
      rate: number;
      minimumBillingUnit?: number;
      quantityOverride?: number;
    }>;
    adjustments: Array<{
      adjustmentId: string;
      concept: string;
      unit: "unit" | "sqm" | "ml";
      value: number;
      sign: "positive" | "negative";
    }>;
  }) => CalculateItemPriceOutput;
};

/**
 * CalculateItemPriceUseCase
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 * Esto la hace 100% testeable sin mocks complejos.
 */
export async function calculateItemPriceUseCase(
  input: CalculateItemPriceInput,
  deps: CalculateItemPriceDeps
): Promise<CalculateItemPriceOutput> {
  // 1. Validar cantidad y color surcharge (validaciones sin I/O)
  validateQuantity(input.quantity);
  validateColorSurcharge(input.colorSurchargePercentage);

  // 2. Fetch y validar modelo
  const model = await deps.findModel(input.modelId);
  validateModelAvailability(model);
  validateGlassTypeCompatibility(model, input.glassTypeId);
  validateDimensions(model, {
    widthMm: input.widthMm,
    heightMm: input.heightMm,
  });

  // 3. Fetch glass type
  const glassType = await deps.findGlassType(input.glassTypeId);
  if (!glassType) {
    throw new Error("Tipo de vidrio no encontrado");
  }

  // 4. Fetch services (si hay)
  const serviceIds = input.services.map((s) => s.serviceId);
  const services =
    serviceIds.length > 0 ? await deps.findServices(serviceIds) : [];

  // Validar que todos los servicios existen
  for (const serviceInput of input.services) {
    const service = services.find((s) => s.id === serviceInput.serviceId);
    if (!service) {
      throw new Error(`Servicio ${serviceInput.serviceId} no encontrado`);
    }
  }

  // 5. Transformar datos para el cálculo
  const domainServices = input.services.map((serviceInput) => {
    const service = services.find((s) => s.id === serviceInput.serviceId);
    // Ya validamos arriba que existe
    return {
      serviceId: service?.id,
      name: service?.name,
      unit: service?.unit as "unit" | "sqm" | "ml",
      rate: service?.rate.toNumber(),
      minimumBillingUnit: service?.minimumBillingUnit?.toNumber(),
      quantityOverride: serviceInput.quantity,
    };
  });

  const domainAdjustments = input.adjustments.map((adj) => ({
    adjustmentId: `adj-${performance.now()}-${Math.random()}`,
    concept: adj.concept,
    unit: adj.unit,
    value: adj.value,
    sign: adj.sign,
  }));

  // 6. Ejecutar cálculo de precio
  const calculation = deps.calculatePrice({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    modelPrices: {
      basePrice: model.basePrice.toNumber(),
      costPerMmWidth: model.costPerMmWidth.toNumber(),
      costPerMmHeight: model.costPerMmHeight.toNumber(),
      minWidthMm: model.minWidthMm,
      minHeightMm: model.minHeightMm,
      accessoryPrice: model.accessoryPrice?.toNumber(),
    },
    colorSurchargePercentage: input.colorSurchargePercentage,
    profitMarginPercentage: model.profitMarginPercentage?.toNumber(),
    glass: {
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      discountWidthMm: model.glassDiscountWidthMm ?? undefined,
      discountHeightMm: model.glassDiscountHeightMm ?? undefined,
    },
    services: domainServices,
    adjustments: domainAdjustments,
  });

  return calculation;
}
