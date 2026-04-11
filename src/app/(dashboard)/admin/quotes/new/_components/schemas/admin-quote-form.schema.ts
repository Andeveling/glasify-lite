/**
 * Admin Quote Creation Form Schema
 *
 * Zod schema for admin quote creation form with items array.
 * Uses top-level validators per Zod 4 patterns.
 *
 * @module app/(dashboard)/admin/quotes/new/_components/schemas/admin-quote-form.schema
 */

import { z } from 'zod'

// ============================================================================
// Constants
// ============================================================================

const MAX_PROJECT_NAME_LENGTH = 100
const MAX_ADDRESS_LENGTH = 200
const MIN_QUANTITY = 1
const MAX_ITEMS = 50

// ============================================================================
// Item Schema
// ============================================================================

/**
 * Single quote item for admin quote creation
 */
export const adminQuoteItemSchema = z.object({
  glassTypeId: z.string().cuid({ message: 'ID del tipo de vidrio inválido' }),
  heightMm: z.number().int().positive({ message: 'Alto debe ser mayor a 0 mm' }),
  modelId: z.string().cuid({ message: 'ID del modelo inválido' }),
  quantity: z.number().int().positive({ message: 'Cantidad debe ser mayor a 0' }),
  widthMm: z.number().int().positive({ message: 'Ancho debe ser mayor a 0 mm' }),
})

export type AdminQuoteItemValues = z.infer<typeof adminQuoteItemSchema>

// ============================================================================
// Main Form Schema
// ============================================================================

/**
 * Project address schema for admin quote creation
 */
export const adminQuoteAddressSchema = z.object({
  projectCity: z.string().min(1, 'Ciudad es requerida').max(MAX_ADDRESS_LENGTH),
  projectName: z.string().min(1, 'Nombre del proyecto es requerido').max(MAX_PROJECT_NAME_LENGTH),
  projectState: z.string().min(1, 'Estado/región es requerido').max(MAX_ADDRESS_LENGTH),
  projectStreet: z.string().min(1, 'Dirección es requerida').max(MAX_ADDRESS_LENGTH),
})

export type AdminQuoteAddressValues = z.infer<typeof adminQuoteAddressSchema>

/**
 * Admin quote creation form schema
 *
 * Items array uses useFieldArray for dynamic add/remove.
 * All validation follows Zod 4 patterns with top-level validators.
 */
export const adminQuoteFormSchema = z.object({
  /**
   * Required client ID for the quote
   */
  clientId: z.string().cuid({ message: 'ID del cliente es requerido' }),

  /**
   * Dynamic items array - at least 1 item required
   */
  items: z
    .array(adminQuoteItemSchema)
    .min(MIN_QUANTITY, 'La cotización debe tener al menos un ítem')
    .max(MAX_ITEMS, 'La cotización no puede tener más de 50 ítems'),

  /**
   * Project information
   */
  projectAddress: adminQuoteAddressSchema,
  projectName: z.string().min(1, 'Nombre del proyecto es requerido').max(MAX_PROJECT_NAME_LENGTH),
})

export type AdminQuoteFormValues = z.infer<typeof adminQuoteFormSchema>

// ============================================================================
// Default Values
// ============================================================================

/**
 * Get default values for form initialization
 */
export function getAdminQuoteFormDefaults(clientId = ''): AdminQuoteFormValues {
  return {
    clientId,
    items: [
      {
        glassTypeId: '',
        heightMm: 1000,
        modelId: '',
        quantity: 1,
        widthMm: 1000,
      },
    ],
    projectAddress: {
      projectCity: '',
      projectName: '',
      projectState: '',
      projectStreet: '',
    },
    projectName: '',
  }
}
