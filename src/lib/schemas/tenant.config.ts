import { z } from "zod"

export const currencySchema = z
  .string()
  .regex(/^[A-Z]{3}$/, { error: "Must be valid ISO 4217 (e.g., COP, USD, EUR)" })

export const localeSchema = z
  .string()
  .regex(/^[a-z]{2}-[A-Z]{2}$/, { error: "Must be valid BCP 47 locale (e.g., es-CO, en-US)" })

export const timezoneSchema = z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+(\/[A-Za-z_]+)?$/, {
  error: "Must be valid IANA timezone (e.g., America/Bogota)",
})

export const TenantConfigSchema = z.object({
  currency: currencySchema,
  locale: localeSchema,
  timezone: timezoneSchema,
  quoteValidityDays: z.coerce.number().int().positive(),
  taxName: z.string().nullable().optional(),
  taxRate: z.coerce.number().min(0).max(1).nullable().optional(),
  taxEnabled: z.coerce.boolean().optional(),
  taxDescription: z.string().nullable().optional(),
})

export type TenantConfigPublic = z.infer<typeof TenantConfigSchema>
