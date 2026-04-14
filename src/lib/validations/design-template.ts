import { z } from "zod"

const MAX_NAME_LENGTH = 100
const PATTERN_REGEX = /^[XO]+$/

export const frameConfigSchema = z.object({
  thickness: z.number().int().positive().min(2).max(12).default(4),
  profileStyle: z.enum(["simple", "double", "premium"]).default("simple"),
  profileColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
})

// Schema for type="window"
export const windowSchema = z.object({
  type: z.literal("window"),
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(MAX_NAME_LENGTH, { message: `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres` })
    .trim(),
  pattern: z
    .string()
    .min(1, { message: "El patrón es requerido" })
    .max(10, { message: "El patrón no puede exceder 10 caracteres" })
    .regex(PATTERN_REGEX, { message: "El patrón solo puede contener X (móvil) y O (fijo)" })
    .refine((p) => p.includes("X"), { message: "El patrón debe tener al menos un panel móvil (X)" })
    .transform((val) => val.toUpperCase()),
  frameConfig: frameConfigSchema,
  showArrows: z.boolean().default(true),
  showHandles: z.boolean().default(true),
})

// Schema for type="door"
export const doorSchema = z.object({
  type: z.literal("door"),
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(MAX_NAME_LENGTH, { message: `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres` })
    .trim(),
  openingType: z.enum(["left_interior", "right_interior", "left_exterior", "right_exterior"]),
  traverseCount: z.number().int().min(0).max(4).default(2),
  traverseStyle: z.enum(["horizontal", "vertical", "grid"]).default("horizontal"),
  frameConfig: frameConfigSchema,
  frameColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#ffffff"),
  glassColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#1a1a1a"),
  handleStyle: z.enum(["lever", "knob", "pull"]).default("lever"),
  showLock: z.boolean().default(true),
})

// Partial versions for update (type is required, all others optional)
const windowSchemaPartial = windowSchema.partial()
const doorSchemaPartial = doorSchema.partial()

export const designTemplateCreateSchema = z.discriminatedUnion("type", [windowSchema, doorSchema])
export const designTemplateUpdateSchema = z.discriminatedUnion("type", [
  // type is required in update, all others optional
  windowSchemaPartial.extend({ type: z.literal("window") }),
  doorSchemaPartial.extend({ type: z.literal("door") }),
])

export const designTemplateIdSchema = z.object({
  id: z.string().cuid({ message: "ID de plantilla inválido" }),
})

export const designTemplateListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.enum(["window", "door"]).optional(),
  sortBy: z.enum(["name", "type", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

export type DesignTemplateCreateInput = z.infer<typeof designTemplateCreateSchema>
export type DesignTemplateUpdateInput = z.infer<typeof designTemplateUpdateSchema>
export type DesignTemplateIdInput = z.infer<typeof designTemplateIdSchema>
export type DesignTemplateListInput = z.infer<typeof designTemplateListSchema>
export type DesignTemplateListQuery = z.output<typeof designTemplateListSchema>
