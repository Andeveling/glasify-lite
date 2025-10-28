/**
 * Service Factory
 *
 * Creates validated Service seed data for additional window/glass services.
 *
 * Data sources:
 * - prisma/seed.ts (existing service data)
 * - Colombian market service rates
 *
 * @version 1.0.0
 */

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type {
  FactoryMetadata,
  FactoryOptions,
  FactoryResult,
  ValidationError,
} from "./types";
import { mergeOverrides, validatePrice, validateWithSchema } from "./utils";

// Validation constants
const MIN_SERVICE_NAME_LENGTH = 3;
const MAX_SERVICE_NAME_LENGTH = 100;
const MAX_SERVICE_RATE_COP = 5_000_000; // 5M COP max rate

/**
 * Zod schema for Service input validation
 */
const serviceInputSchema = z.object({
  name: z.string().min(MIN_SERVICE_NAME_LENGTH).max(MAX_SERVICE_NAME_LENGTH),
  rate: z.number().positive(),
  type: z.enum(["area", "perimeter", "fixed"]),
  unit: z.enum(["unit", "sqm", "ml"]),
});

/**
 * Input type for creating a Service
 */
export type ServiceInput = z.infer<typeof serviceInputSchema>;

/**
 * Validates that service type matches unit
 */
function validateServiceTypeUnit(
  type: string,
  unit: string
): ValidationError | null {
  const validCombinations: Record<string, string[]> = {
    area: ["sqm"],
    fixed: ["unit"],
    perimeter: ["ml"],
  };

  if (!validCombinations[type]?.includes(unit)) {
    return {
      code: "INVALID_TYPE_UNIT_COMBINATION",
      context: { type, unit, validUnits: validCombinations[type] },
      message: `Service type '${type}' requires unit to be one of: ${validCombinations[type]?.join(", ")}`,
      path: ["unit"],
    };
  }

  return null;
}

/**
 * Creates a validated Service object for seeding
 *
 * @param input - Service data
 * @param options - Factory options
 * @returns FactoryResult with validated Service or errors
 *
 * @example
 * ```ts
 * const result = createService({
 *   name: 'Instalación',
 *   type: 'fixed',
 *   unit: 'unit',
 *   rate: 25000,
 * });
 *
 * if (result.success) {
 *   await prisma.service.create({ data: result.data });
 * }
 * ```
 */
export function createService(
  input: ServiceInput,
  options?: FactoryOptions
): FactoryResult<Prisma.ServiceCreateInput> {
  // Merge overrides if provided
  const data = mergeOverrides(input, options?.overrides);

  // Skip validation if requested
  if (options?.skipValidation) {
    return {
      data: data as Prisma.ServiceCreateInput,
      success: true,
    };
  }

  // Validate with Zod schema
  const schemaResult = validateWithSchema(serviceInputSchema, data);
  if (!schemaResult.success) {
    return schemaResult;
  }

  const validated = schemaResult.data;
  if (!validated) {
    return {
      errors: [
        { code: "VALIDATION_ERROR", message: "Validation failed", path: [] },
      ],
      success: false,
    };
  }

  // Additional business logic validations
  const additionalErrors: ValidationError[] = [];

  // Validate rate is reasonable
  const priceError = validatePrice(
    validated.rate,
    "rate",
    MAX_SERVICE_RATE_COP
  );
  if (priceError) {
    additionalErrors.push(priceError);
  }

  // Validate type-unit combination
  const typeUnitError = validateServiceTypeUnit(validated.type, validated.unit);
  if (typeUnitError) {
    additionalErrors.push(typeUnitError);
  }

  if (additionalErrors.length > 0) {
    return {
      errors: additionalErrors,
      success: false,
    };
  }

  // Return validated data ready for Prisma
  return {
    data: validated as Prisma.ServiceCreateInput,
    success: true,
  };
}

/**
 * Creates multiple Services in batch
 *
 * @param inputs - Array of Service inputs
 * @param options - Factory options
 * @returns Array of FactoryResults
 */
export function createServices(
  inputs: ServiceInput[],
  options?: FactoryOptions
): FactoryResult<Prisma.ServiceCreateInput>[] {
  return inputs.map((input) => createService(input, options));
}

/**
 * Filters successful results from a batch creation
 *
 * @param results - Array of FactoryResults
 * @returns Array of successful data objects
 */
export function getSuccessfulServices(
  results: FactoryResult<Prisma.ServiceCreateInput>[]
): Prisma.ServiceCreateInput[] {
  return results
    .filter(
      (
        result
      ): result is FactoryResult<Prisma.ServiceCreateInput> & {
        success: true;
        data: Prisma.ServiceCreateInput;
      } => result.success && result.data !== undefined
    )
    .map((result) => result.data);
}

/**
 * Factory metadata
 */
export const serviceFactoryMetadata: FactoryMetadata = {
  description:
    "Creates validated Service seed data for window/glass additional services",
  name: "ServiceFactory",
  sources: ["prisma/seed.ts"],
  version: "1.0.0",
};
