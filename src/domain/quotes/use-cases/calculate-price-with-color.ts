/**
 * CalculatePriceWithColorUseCase - Use Case
 *
 * Orquesta el cálculo de precio con recargo de color:
 * 1. Validar modelo y dimensiones
 * 2. Obtener datos de vidrio, servicios y color
 * 3. Calcular precio base
 * 4. Aplicar recargo de color al dimPrice
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type { GlassType, Model, Service } from "@prisma/client";
import {
  validateDimensions,
  validateGlassTypeCompatibility,
  validateModelAvailability,
} from "../services/quote-validator.service";

/**
 * Input para calcular precio con color
 */
export type CalculatePriceWithColorInput = {
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
  colorId?: string;
};

/**
 * Service output en el breakdown
 */
type ServiceBreakdown = {
  serviceId: string;
  unit: "unit" | "sqm" | "ml";
  quantity: number;
  amount: number;
};

/**
 * Adjustment output en el breakdown
 */
type AdjustmentBreakdown = {
  concept: string;
  amount: number;
};

/**
 * Output del use-case
 */
export type CalculatePriceWithColorOutput = {
  basePrice: number;
  colorSurcharge: number;
  totalWithColor: number;
  breakdown: {
    dimPrice: number;
    accPrice: number;
    color: number;
    services: ServiceBreakdown[];
    adjustments: AdjustmentBreakdown[];
  };
};

/**
 * Color con surcharge
 */
type ModelColorWithData = {
  surchargePercentage: number;
  color: {
    id: string;
    name: string;
    hexCode: string;
    isActive: boolean;
  };
};

/**
 * Dependencies (ports) que necesita el use-case
 */
export type CalculatePriceWithColorDeps = {
  // Repositories
  findModel: (id: string) => Promise<
    | (Model & {
        profileSupplier?: { id: string; name: string } | null;
      })
    | null
  >;
  findGlassType: (id: string) => Promise<GlassType | null>;
  findServices: (ids: string[]) => Promise<Service[]>;
  findModelColor: (
    modelId: string,
    colorId: string
  ) => Promise<ModelColorWithData | null>;

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
  }) => {
    dimPrice: number;
    accPrice: number;
    services: ServiceBreakdown[];
    adjustments: AdjustmentBreakdown[];
    subtotal: number;
  };
};

/**
 * Divisor para porcentajes
 */
const PERCENTAGE_DIVISOR = 100;

/**
 * CalculatePriceWithColorUseCase
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 */
export async function calculatePriceWithColorUseCase(
  input: CalculatePriceWithColorInput,
  deps: CalculatePriceWithColorDeps
): Promise<CalculatePriceWithColorOutput> {
  // 1. Fetch y validar modelo
  const model = await deps.findModel(input.modelId);
  validateModelAvailability(model);
  validateGlassTypeCompatibility(model, input.glassTypeId);
  validateDimensions(model, {
    widthMm: input.widthMm,
    heightMm: input.heightMm,
  });

  // 2. Fetch glass type
  const glassType = await deps.findGlassType(input.glassTypeId);
  if (!glassType) {
    throw new Error("Tipo de vidrio no encontrado");
  }

  // 3. Fetch services (si hay)
  const serviceIds = input.services.map((s) => s.serviceId);
  const services = serviceIds.length > 0 ? await deps.findServices(serviceIds) : [];

  // Validar que todos los servicios existen
  for (const serviceInput of input.services) {
    const service = services.find((s) => s.id === serviceInput.serviceId);
    if (!service) {
      throw new Error(`Servicio ${serviceInput.serviceId} no encontrado`);
    }
  }

  // 4. Transformar datos para el cálculo
  const domainServices = input.services.map((serviceInput) => {
    const service = services.find((s) => s.id === serviceInput.serviceId);
    return {
      serviceId: service!.id,
      name: service!.name,
      unit: service!.unit as "unit" | "sqm" | "ml",
      rate: service!.rate.toNumber(),
      minimumBillingUnit: service!.minimumBillingUnit?.toNumber(),
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

  // 5. Calcular precio base (sin color surcharge)
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
    colorSurchargePercentage: 0, // Sin color inicialmente
    glass: {
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      discountWidthMm: model.glassDiscountWidthMm ?? undefined,
      discountHeightMm: model.glassDiscountHeightMm ?? undefined,
    },
    services: domainServices,
    adjustments: domainAdjustments,
  });

  // 6. Calcular color surcharge si se proporciona colorId
  let colorSurcharge = 0;
  let colorSurchargePercentage = 0;

  if (input.colorId) {
    const modelColor = await deps.findModelColor(input.modelId, input.colorId);

    if (!modelColor) {
      throw new Error("Color no asignado a este modelo");
    }

    if (!modelColor.color.isActive) {
      throw new Error("Color no disponible");
    }

    colorSurchargePercentage = modelColor.surchargePercentage;
    // Aplicar surcharge SOLO al dimPrice (precio del modelo)
    colorSurcharge = calculation.dimPrice * (colorSurchargePercentage / PERCENTAGE_DIVISOR);
  }

  const totalWithColor = calculation.subtotal + colorSurcharge;

  return {
    basePrice: calculation.subtotal,
    colorSurcharge,
    totalWithColor,
    breakdown: {
      dimPrice: calculation.dimPrice,
      accPrice: calculation.accPrice,
      color: colorSurcharge,
      services: calculation.services,
      adjustments: calculation.adjustments,
    },
  };
}
