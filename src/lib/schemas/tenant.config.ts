import { z } from 'zod'

const ISO4217Regex = /^[A-Z]{3}$/
const BCP47Regex = /^[a-z]{2}-[A-Z]{2}$/
const IANATimezoneRegex = /^[A-Za-z_]+\/[A-Za-z_]+(\/[A-Za-z_]+)?$/

export const TenantConfigSchema = z.object({
  currency: z
    .string()
    .regex(ISO4217Regex, { error: 'Must be valid ISO 4217 (e.g., COP, USD, EUR)' }),
  locale: z
    .string()
    .regex(BCP47Regex, { error: 'Must be valid BCP 47 locale (e.g., es-CO, en-US)' }),
  timezone: z
    .string()
    .regex(IANATimezoneRegex, { error: 'Must be valid IANA timezone (e.g., America/Bogota)' }),
  quoteValidityDays: z.coerce.number().int().positive(),
  taxName: z.string().nullable().optional(),
  taxRate: z.coerce.number().min(0).max(1).nullable().optional(),
  taxEnabled: z.coerce.boolean().optional(),
  taxDescription: z.string().nullable().optional(),
})

export type TenantConfigPublic = z.infer<typeof TenantConfigSchema>
