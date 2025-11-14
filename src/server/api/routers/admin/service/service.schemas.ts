/**
 * Service Schemas - Validation Layer
 *
 * Composed from drizzle-zod generated schemas.
 * Single source of truth: Drizzle table definition.
 *
 * @module server/api/routers/admin/service/service.schemas
 */

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { services } from "@/server/db/schema";

// Constants
const MAX_NAME_LENGTH = 255;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

// ✅ Auto-generated base schemas
export const SelectServiceSchema = createSelectSchema(services);
export const InsertServiceSchema = createInsertSchema(services);

// ✅ Input schemas - pick relevant fields
export const serviceCreateInput = InsertServiceSchema.pick({
  name: true,
  type: true,
  unit: true,
  rate: true,
  minimumBillingUnit: true,
}).extend({
  name: z.string().min(1, "Nombre es requerido").max(MAX_NAME_LENGTH),
  type: z.enum(["area", "perimeter", "fixed"]),
  unit: z.enum(["sqm", "ml", "unit"]),
  rate: z.string().refine((val) => !Number.isNaN(Number.parseFloat(val)), {
    message: "Tarifa debe ser un número válido",
  }),
  minimumBillingUnit: z
    .string()
    .refine((val) => {
      if (!val) {
        return true;
      }
      return !Number.isNaN(Number.parseFloat(val));
    })
    .optional(),
});

export const serviceUpdateInput = serviceCreateInput.partial().extend({
  id: z.string().uuid(),
});

// ✅ Filter schema
export const serviceFilterInput = z.object({
  search: z.string().optional(),
  type: z.enum(["area", "perimeter", "fixed"]).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  sortBy: z
    .enum(["name", "rate", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ✅ Output schema - with type conversions
export const serviceOutput = SelectServiceSchema.extend({
  rate: z.string().transform((val) => Number.parseFloat(val)), // decimal string → number
  minimumBillingUnit: z
    .string()
    .nullable()
    .transform((val) => (val ? Number.parseFloat(val) : null)),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ✅ List response
export const serviceListOutput = z.object({
  items: z.array(serviceOutput),
  total: z.number().int(),
  page: z.number().int(),
  totalPages: z.number().int(),
});

// ✅ Type exports
export type ServiceCreateInput = z.infer<typeof serviceCreateInput>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateInput>;
export type ServiceFilterInput = z.infer<typeof serviceFilterInput>;
export type ServiceOutput = z.infer<typeof serviceOutput>;
export type ServiceListOutput = z.infer<typeof serviceListOutput>;
