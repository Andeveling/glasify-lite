/**
 * Client Form Zod Validation Schema
 *
 * Validation for client create/update forms in admin UI.
 * Mirrors the constraints defined in the tRPC router (admin/clients.ts).
 */

import { z } from 'zod'

const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 100
const MAX_PHONE_LENGTH = 20
const MAX_COMPANY_LENGTH = 100
const MAX_NOTES_LENGTH = 500

/**
 * Client base schema with all fields
 * Used as foundation for create and update schemas
 */
const clientBaseSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'El nombre es requerido' })
    .max(MAX_NAME_LENGTH, {
      message: `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`,
    })
    .trim(),

  email: z
    .string()
    .email({ message: 'Correo electrónico inválido' })
    .max(MAX_EMAIL_LENGTH, {
      message: `El correo no puede exceder ${MAX_EMAIL_LENGTH} caracteres`,
    })
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),

  phone: z
    .string()
    .max(MAX_PHONE_LENGTH, {
      message: `El teléfono no puede exceder ${MAX_PHONE_LENGTH} caracteres`,
    })
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),

  company: z
    .string()
    .max(MAX_COMPANY_LENGTH, {
      message: `La empresa no puede exceder ${MAX_COMPANY_LENGTH} caracteres`,
    })
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),

  notes: z
    .string()
    .max(MAX_NOTES_LENGTH, {
      message: `Las notas no pueden exceder ${MAX_NOTES_LENGTH} caracteres`,
    })
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
})

/**
 * Client create schema
 * All fields except name are optional
 */
export const clientCreateSchema = clientBaseSchema

/**
 * Client update schema
 * All fields optional for partial updates
 */
export const clientUpdateSchema = clientBaseSchema.partial()

/**
 * Client ID parameter schema
 * Used in getById, update, delete operations
 */
export const clientIdSchema = z.object({
  id: z.string().cuid({ message: 'ID de cliente inválido' }),
})

// Type exports
export type ClientCreateInput = z.infer<typeof clientCreateSchema>
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>
export type ClientIdInput = z.infer<typeof clientIdSchema>
