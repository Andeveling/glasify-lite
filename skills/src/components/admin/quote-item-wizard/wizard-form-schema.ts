import { z } from 'zod'

const wizardFormSchema = z.object({
  widthMm: z.number().int().positive().max(6000),
  heightMm: z.number().int().positive().max(6000),
  quantity: z.number().int().positive().default(1),
  roomLocation: z.string().optional(),
  modelId: z.string().min(1),
  configuredWidthMm: z.number().int().positive(),
  configuredHeightMm: z.number().int().positive(),
  colorId: z.string().min(1).optional(),
  glassTypeId: z.string().min(1),
  serviceIds: z.array(z.string().min(1)).default([]),
})

const STEP_FIELDS: Record<number, (keyof z.infer<typeof wizardFormSchema>)[]> = {
  0: ['widthMm', 'heightMm', 'quantity'],
  1: ['modelId', 'configuredWidthMm', 'configuredHeightMm'],
  2: ['glassTypeId'],
  3: ['serviceIds'],
  4: [],
}

export { wizardFormSchema, STEP_FIELDS }
export type WizardFormValues = z.infer<typeof wizardFormSchema>
