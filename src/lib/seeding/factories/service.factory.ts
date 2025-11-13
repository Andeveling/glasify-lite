/**
 * @file Service Factory
 * @description Generates type-safe test data for Service seeding
 * Pure functions with no ORM dependencies - generates POJOs only
 *
 * Service types:
 * - area: Charged per square meter (sqm)
 * - perimeter: Charged per linear meter (ml)
 * - fixed: One-time charge per unit
 */

import {
  SERVICE_TYPE_VALUES,
  type SERVICE_UNIT_VALUES,
} from "@/server/db/schemas/enums.schema";
import type { NewService } from "@/server/db/schemas/service.schema";
import { serviceInsertSchema } from "@/server/db/schemas/service.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Constants
const ACTIVE_PROBABILITY = 0.9;
const HAS_MINIMUM_BILLING_PROBABILITY = 0.4;

// Pricing ranges (COP)
const MIN_AREA_RATE = 10_000; // 10k COP/sqm
const MAX_AREA_RATE = 100_000; // 100k COP/sqm
const MIN_PERIMETER_RATE = 5000; // 5k COP/ml
const MAX_PERIMETER_RATE = 50_000; // 50k COP/ml
const MIN_FIXED_RATE = 20_000; // 20k COP/unit
const MAX_FIXED_RATE = 500_000; // 500k COP/unit

// Real-world service presets
export const ALL_SERVICES: NewService[] = [
  {
    name: "Instalación Básica",
    type: "area",
    unit: "sqm",
    rate: "25000.0000",
    minimumBillingUnit: "1.0000",
    isActive: "true",
  },
  {
    name: "Instalación Premium",
    type: "area",
    unit: "sqm",
    rate: "45000.0000",
    minimumBillingUnit: "2.0000",
    isActive: "true",
  },
  {
    name: "Sellado de Perímetro",
    type: "perimeter",
    unit: "ml",
    rate: "12000.0000",
    minimumBillingUnit: "1.0000",
    isActive: "true",
  },
  {
    name: "Refuerzo Estructural",
    type: "perimeter",
    unit: "ml",
    rate: "18000.0000",
    isActive: "true",
  },
  {
    name: "Transporte e Izaje",
    type: "fixed",
    unit: "unit",
    rate: "150000.0000",
    isActive: "true",
  },
  {
    name: "Desmonte de Ventana Existente",
    type: "fixed",
    unit: "unit",
    rate: "80000.0000",
    isActive: "true",
  },
  {
    name: "Limpieza Post-Instalación",
    type: "fixed",
    unit: "unit",
    rate: "30000.0000",
    isActive: "true",
  },
];

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

/**
 * Generate realistic service name based on type
 */
function generateServiceName(
  type: (typeof SERVICE_TYPE_VALUES)[number]
): string {
  const areaServices = [
    "Instalación Básica",
    "Instalación Premium",
    "Templado",
    "Laminado de Seguridad",
    "Aplicación de Película",
  ];

  const perimeterServices = [
    "Sellado de Perímetro",
    "Marco de Aluminio",
    "Refuerzo Estructural",
    "Goma de Sellado",
    "Canaleta de Drenaje",
  ];

  const fixedServices = [
    "Transporte e Izaje",
    "Desmonte de Ventana Existente",
    "Limpieza Post-Instalación",
    "Herrajes y Accesorios",
    "Garantía Extendida",
  ];

  switch (type) {
    case "area":
      return randomElement(areaServices);
    case "perimeter":
      return randomElement(perimeterServices);
    case "fixed":
      return randomElement(fixedServices);
  }
}

/**
 * Get correct unit for service type
 */
function getUnitForType(
  type: (typeof SERVICE_TYPE_VALUES)[number]
): (typeof SERVICE_UNIT_VALUES)[number] {
  switch (type) {
    case "area":
      return "sqm";
    case "perimeter":
      return "ml";
    case "fixed":
      return "unit";
  }
}

/**
 * Generate rate based on service type
 */
function generateRate(type: (typeof SERVICE_TYPE_VALUES)[number]): string {
  const RATE_DECIMALS = 4;
  let value: number;

  switch (type) {
    case "area":
      value = randomInt(MIN_AREA_RATE, MAX_AREA_RATE);
      break;
    case "perimeter":
      value = randomInt(MIN_PERIMETER_RATE, MAX_PERIMETER_RATE);
      break;
    case "fixed":
      value = randomInt(MIN_FIXED_RATE, MAX_FIXED_RATE);
      break;
  }

  return value.toFixed(RATE_DECIMALS);
}

/**
 * Generate minimum billing unit
 */
function generateMinimumBillingUnit(): string | undefined {
  if (!randomBoolean(HAS_MINIMUM_BILLING_PROBABILITY)) {
    return;
  }

  const BILLING_DECIMALS = 4;
  const MIN_BILLING = 1;
  const MAX_BILLING = 5;
  const value = randomInt(MIN_BILLING, MAX_BILLING);
  return value.toFixed(BILLING_DECIMALS);
}

/**
 * Generate a single Service POJO
 *
 * @param options - Factory options with overrides
 * @returns FactoryResult with generated data or validation error
 *
 * @example
 * ```typescript
 * const result = generateService();
 * if (result.success) {
 *   console.log(result.data); // { name: 'Instalación Básica', type: 'area', ... }
 * }
 * ```
 */
export function generateService(
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  const type = randomElement(SERVICE_TYPE_VALUES);

  const defaults: NewService = {
    name: generateServiceName(type),
    type,
    unit: getUnitForType(type),
    rate: generateRate(type),
    minimumBillingUnit: generateMinimumBillingUnit(),
    isActive: randomBoolean(ACTIVE_PROBABILITY) ? "true" : "false",
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = serviceInsertSchema.safeParse(data);
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

    // Additional business logic validation: type and unit must match
    const validatedData = parsed.data;
    const validCombinations: Record<
      (typeof SERVICE_TYPE_VALUES)[number],
      (typeof SERVICE_UNIT_VALUES)[number]
    > = {
      area: "sqm",
      perimeter: "ml",
      fixed: "unit",
    };

    if (validatedData.unit !== validCombinations[validatedData.type]) {
      return {
        success: false,
        errors: [
          {
            code: "INVALID_TYPE_UNIT_COMBINATION",
            context: {
              type: validatedData.type,
              unit: validatedData.unit,
              expected: validCombinations[validatedData.type],
            },
            message: `Service type '${validatedData.type}' must use unit '${validCombinations[validatedData.type]}'`,
            path: ["type", "unit"],
          },
        ],
      };
    }

    return createSuccessResult(validatedData);
  }

  return createSuccessResult(data);
}

/**
 * Generate multiple Services
 */
export function generateServices(
  count: number,
  options?: FactoryOptions<NewService>
): FactoryResult<NewService>[] {
  return Array.from({ length: count }, () => generateService(options));
}

/**
 * Generate a batch of valid Services (only successful results)
 */
export function generateServiceBatch(
  count: number,
  options?: FactoryOptions<NewService>
): NewService[] {
  const results = generateServices(count, options);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<NewService> & {
        success: true;
        data: NewService;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate service from preset (real-world examples)
 */
export function generateServiceFromPreset(
  presetIndex?: number,
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  const MIN_INDEX = 0;
  const index = presetIndex ?? randomInt(MIN_INDEX, ALL_SERVICES.length - 1);
  const preset = ALL_SERVICES[index];

  return generateService({
    ...options,
    overrides: {
      ...preset,
      ...options?.overrides,
    },
  });
}

/**
 * Generate service with specific type
 */
export function generateServiceWithType(
  type: (typeof SERVICE_TYPE_VALUES)[number],
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  return generateService({
    ...options,
    overrides: {
      type,
      unit: getUnitForType(type),
      ...options?.overrides,
    },
  });
}

/**
 * Generate area-based service
 */
export function generateAreaService(
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  return generateServiceWithType("area", options);
}

/**
 * Generate perimeter-based service
 */
export function generatePerimeterService(
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  return generateServiceWithType("perimeter", options);
}

/**
 * Generate fixed-price service
 */
export function generateFixedService(
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  return generateServiceWithType("fixed", options);
}

/**
 * Generate inactive service
 */
export function generateInactiveService(
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  return generateService({
    ...options,
    overrides: {
      ...options?.overrides,
      isActive: "false",
    },
  });
}

/**
 * Generate service with custom rate
 */
export function generateServiceWithRate(
  rate: number,
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  const RATE_DECIMALS = 4;
  return generateService({
    ...options,
    overrides: {
      rate: rate.toFixed(RATE_DECIMALS),
      ...options?.overrides,
    },
  });
}

/**
 * Generate service with minimum billing unit
 */
export function generateServiceWithMinimumBilling(
  minimumBillingUnit: number,
  options?: FactoryOptions<NewService>
): FactoryResult<NewService> {
  const BILLING_DECIMALS = 4;
  return generateService({
    ...options,
    overrides: {
      minimumBillingUnit: minimumBillingUnit.toFixed(BILLING_DECIMALS),
      ...options?.overrides,
    },
  });
}
