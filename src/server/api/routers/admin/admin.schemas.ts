import { z } from "zod"

export const modelUpsertInput = z.object({
  accessoryPrice: z.number().min(0).optional().nullable(),
  basePrice: z.number().min(0, "Precio base debe ser mayor o igual a 0"),
  compatibleGlassTypeIds: z
    .array(z.cuid("ID del tipo de vidrio debe ser válido"))
    .min(1, "Debe seleccionar al menos un tipo de vidrio compatible"),
  costPerMmHeight: z.number().min(0, "Costo por mm de alto debe ser mayor o igual a 0"),
  costPerMmWidth: z.number().min(0, "Costo por mm de ancho debe ser mayor o igual a 0"),
  designTemplateId: z
    .string()
    .cuid("ID de plantilla de diseño debe ser válido")
    .optional()
    .nullable(),
  id: z.cuid().optional(),
  maxHeightMm: z.number().int().min(1, "Alto máximo debe ser mayor a 0 mm"),
  maxWidthMm: z.number().int().min(1, "Ancho máximo debe ser mayor a 0 mm"),
  minHeightMm: z.number().int().min(1, "Alto mínimo debe ser mayor a 0 mm"),
  minWidthMm: z.number().int().min(1, "Ancho mínimo debe ser mayor a 0 mm"),
  name: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "Nombre del modelo es requerido"),
  ),
  profileSupplierId: z
    .string()
    .cuid("ID del proveedor de perfiles debe ser válido")
    .optional()
    .nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
})

export const modelUpsertOutput = z.object({
  message: z.string(),
  modelId: z.string(),
  status: z.enum(["draft", "published"]),
})
