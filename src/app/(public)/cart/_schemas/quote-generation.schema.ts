/**
 * Quote Generation Form Schema
 *
 * Zod validation schema for the quote generation form.
 * Simplified MVP: Uses geocoded address as primary source,
 * with derived fields for backward compatibility.
 *
 * Business Rules:
 * - Phone is REQUIRED (contactPhone)
 * - Address is REQUIRED (via DeliveryAddressPicker geocoding)
 * - Project name is optional
 *
 * @module app/(public)/cart/_schemas/quote-generation.schema
 */

import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

const MAX_PROJECT_NAME_LENGTH = 100;
const MAX_REFERENCE_LENGTH = 200;

// ============================================================================
// Sub-schemas
// ============================================================================

/**
 * Delivery address schema (from geocoding picker)
 * Maps to ProjectAddress entity in Prisma
 */
export const deliveryAddressSchema = z.object({
  city: z.string().nullish(),
  country: z.string().nullish(),
  district: z.string().nullish(),
  label: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  postalCode: z.string().nullish(),
  reference: z.string().nullish(),
  region: z.string().nullish(),
  street: z.string().nullish(),
});

export type DeliveryAddressInput = z.infer<typeof deliveryAddressSchema>;

/**
 * Phone validation with international format support
 */
const phoneSchema = z
  .string()
  .min(1, "El teléfono es obligatorio")
  .refine(
    (val) => isValidPhoneNumber(val),
    "Formato de teléfono inválido. Usa formato internacional (+57...)"
  );

// ============================================================================
// Main Schema
// ============================================================================

/**
 * Quote Generation Form Schema
 *
 * Simplified schema that requires:
 * 1. deliveryAddress: Geocoded address from picker (required, must have city)
 * 2. contactPhone: International phone format (required)
 * 3. projectName: Optional project identifier
 * 4. reference: Optional delivery instructions
 */
export const quoteGenerationFormSchema = z
  .object({
    /** Optional project name for internal reference */
    projectName: z
      .string()
      .max(MAX_PROJECT_NAME_LENGTH, "Nombre muy largo")
      .optional(),

    /** Geocoded delivery address (required) */
    deliveryAddress: deliveryAddressSchema,

    /** Contact phone in E.164 format (required) */
    contactPhone: phoneSchema,

    /** Optional delivery reference/instructions */
    deliveryReference: z
      .string()
      .max(MAX_REFERENCE_LENGTH, "Referencia muy larga")
      .optional(),
  })
  .refine(
    (data) => {
      // Ensure address has at least city (core required field from geocoding)
      return Boolean(data.deliveryAddress?.city);
    },
    {
      message: "Selecciona una dirección válida con ciudad",
      path: ["deliveryAddress"],
    }
  );

export type QuoteGenerationFormValues = z.infer<
  typeof quoteGenerationFormSchema
>;

// ============================================================================
// Transformation Utils
// ============================================================================

/**
 * Transform form values to server action input
 *
 * Derives projectStreet, projectCity, projectState from geocoded address
 * for backward compatibility with existing Quote schema.
 */
export function transformToActionInput(values: QuoteGenerationFormValues) {
  const { deliveryAddress, contactPhone, projectName, deliveryReference } =
    values;

  return {
    // Required fields derived from geocoded address
    projectStreet: deliveryAddress.street ?? deliveryAddress.label ?? "",
    projectCity: deliveryAddress.city ?? "",
    projectState: deliveryAddress.region ?? "",

    // Optional fields
    projectName: projectName ?? undefined,
    contactPhone,

    // Full geocoded address for ProjectAddress entity
    deliveryAddress: {
      ...deliveryAddress,
      reference: deliveryReference ?? deliveryAddress.reference ?? null,
    },
  };
}
