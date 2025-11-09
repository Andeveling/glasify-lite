/**
 * Service Validation Schemas
 *
 * Zod schemas for Service entity CRUD operations
 *
 * Entity: Service (additional services for quotes like installation, delivery)
 * Fields: name, type, unit, rate
 * Relations: quoteServices (One-to-Many)
 */

import { z } from "zod";
import type {
  ServiceType,
  ServiceUnit,
} from "@/server/db/schemas/enums.schema";
import {
  SERVICE_TYPE_VALUES,
  SERVICE_UNIT_VALUES,
} from "@/server/db/schemas/enums.schema";
import {
  paginationSchema,
  priceValidator,
  searchQuerySchema,
  sortOrderSchema,
  spanishText,
} from "../shared.schema";

/**
 * Constants
 */
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;

/**
 * Enum value arrays for validation
 */
export const SERVICE_TYPE_VALUES_ARRAY = [...SERVICE_TYPE_VALUES];
export const SERVICE_UNIT_VALUES_ARRAY = [...SERVICE_UNIT_VALUES];

/**
 * ServiceType enum schema (Drizzle-compatible)
 */
const serviceTypeSchema = z.enum(SERVICE_TYPE_VALUES_ARRAY, {
  message: "El tipo de servicio debe ser: area, perimeter o fixed",
});

/**
 * ServiceUnit enum schema (Drizzle-compatible)
 */
const serviceUnitSchema = z.enum(SERVICE_UNIT_VALUES_ARRAY, {
  message: "La unidad de medida debe ser: unit, sqm o ml",
});

/**
 * Base Service Schema
 * Shared fields for create/update operations
 */
const baseServiceSchema = z
  .object({
    name: spanishText
      .min(
        MIN_NAME_LENGTH,
        `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`
      )
      .max(
        MAX_NAME_LENGTH,
        `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`
      )
      .describe("Service name (e.g., Instalación, Entrega)"),

    rate: priceValidator
      .positive("La tarifa debe ser mayor a cero")
      .describe("Service rate (always positive, services add cost)"),

    type: serviceTypeSchema.describe("Service type (area, perimeter, fixed)"),

    unit: serviceUnitSchema.describe("Measurement unit (unit, sqm, ml)"),

    minimumBillingUnit: z
      .number()
      .positive("La unidad mínima debe ser mayor a cero")
      .optional()
      .nullable()
      .describe("Minimum billing unit (only for area/perimeter services)"),
  })
  .refine(
    (data) => {
      // If type is 'fixed', minimumBillingUnit must be null/undefined
      if (data.type === "fixed" && data.minimumBillingUnit) {
        return false;
      }
      return true;
    },
    {
      message: "La unidad mínima solo aplica a servicios tipo área o perímetro",
      path: ["minimumBillingUnit"],
    }
  );

/**
 * Create Service Schema
 */
export const createServiceSchema = baseServiceSchema;

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

/**
 * Update Service Schema
 * Wraps partial data with id
 */
export const updateServiceSchema = z.object({
  data: baseServiceSchema.partial(),
  id: z.cuid("ID de servicio inválido"),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

/**
 * List Services Schema
 * Pagination + search + sorting + filtering
 */
export const listServicesSchema = paginationSchema.extend({
  isActive: z
    .enum(["all", "active", "inactive"])
    .default("all")
    .describe("Filter by active status"),
  search: searchQuerySchema.describe("Search by name"),

  sortBy: z
    .enum(["name", "createdAt", "updatedAt", "rate"])
    .default("createdAt")
    .describe("Sort field"),

  sortOrder: sortOrderSchema.describe("Sort order"),

  type: z
    .enum(["all", "area", "perimeter", "fixed"])
    .default("all")
    .describe("Filter by type"),
});

export type ListServicesInput = z.infer<typeof listServicesSchema>;

/**
 * List Services Output Schema
 * Pagination response type (matches tRPC router output)
 */
export type ListServicesOutput = {
  items: Array<{
    id: string;
    name: string;
    type: ServiceType;
    unit: ServiceUnit;
    rate: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Get Service by ID Schema
 */
export const getServiceByIdSchema = z.object({
  id: z.cuid("ID de servicio inválido"),
});

export type GetServiceByIdInput = z.infer<typeof getServiceByIdSchema>;

/**
 * Delete Service Schema
 */
export const deleteServiceSchema = z.object({
  id: z.cuid("ID de servicio inválido"),
});

export type DeleteServiceInput = z.infer<typeof deleteServiceSchema>;

/**
 * Toggle Service Active Status Schema
 */
export const toggleServiceActiveSchema = z.object({
  id: z.cuid("ID de servicio inválido"),
  isActive: z.boolean({
    message: "El estado activo debe ser verdadero o falso",
  }),
});

export type ToggleServiceActiveInput = z.infer<
  typeof toggleServiceActiveSchema
>;
