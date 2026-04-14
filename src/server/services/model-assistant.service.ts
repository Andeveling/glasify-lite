import { TRPCError } from "@trpc/server"
import { z } from "zod"

const modelAssistantSessionContextSchema = z.union([
  z.object({
    designTemplateId: z.string(),
    dimensions: z.object({
      maxHeightMm: z.number(),
      maxWidthMm: z.number(),
      minHeightMm: z.number(),
      minWidthMm: z.number(),
    }),
    glassTypeIds: z.array(z.string()),
    name: z.string(),
    profileSupplierId: z.string(),
  }),
  z.object({
    accessories: z.array(
      z.object({
        name: z.string(),
        quantity: z.number(),
      }),
    ),
    barLengthMeters: z.number(),
    modelId: z.string(),
    profiles: z.array(
      z.object({
        meters: z.number(),
        name: z.string(),
      }),
    ),
    supplierId: z.string(),
  }),
])

type ModelAssistantSessionContext = z.infer<typeof modelAssistantSessionContextSchema>

type SourceModelClone = {
  accessoryPrice: number | null | { toNumber(): number }
  compatibleGlassTypeIds: string
  costPerMmHeight: number | { toNumber(): number }
  costPerMmWidth: number | { toNumber(): number }
  designTemplateId: string | null
  imageUrl: string | null
  maxHeightMm: number
  maxWidthMm: number
  minHeightMm: number
  minWidthMm: number
  name: string
  profileSupplierId: string | null
  status: string
  basePrice: number | { toNumber(): number }
}

function toNumber(value: number | null | { toNumber(): number }): number {
  if (value === null) {
    return 0
  }

  return typeof value === "number" ? value : value.toNumber()
}

export function buildModelClonePayload(input: {
  input: {
    newName: string
    newProfileSupplierId: string
    sourceModelId: string
  }
  sourceModel: SourceModelClone
}) {
  return {
    accessoryPrice: 0,
    compatibleGlassTypeIds: input.sourceModel.compatibleGlassTypeIds,
    costPerMmHeight: 0,
    costPerMmWidth: 0,
    designTemplateId: input.sourceModel.designTemplateId,
    imageUrl: input.sourceModel.imageUrl ?? "",
    maxHeightMm: input.sourceModel.maxHeightMm,
    maxWidthMm: input.sourceModel.maxWidthMm,
    minHeightMm: input.sourceModel.minHeightMm,
    minWidthMm: input.sourceModel.minWidthMm,
    name: input.input.newName,
    profileSupplierId: input.input.newProfileSupplierId,
    status: "draft" as const,
    basePrice: 0,
  }
}

export function ensureModelCanBePublished(input: {
  costBreakdownCount: number
  modelName: string
}) {
  if (input.costBreakdownCount < 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El modelo debe ser calibrado antes de publicarse",
    })
  }
}

export function serializeModelAssistantSessionContext(
  context: ModelAssistantSessionContext,
): string {
  return JSON.stringify(context)
}

export function parseModelAssistantSessionContext(value: string): ModelAssistantSessionContext {
  const parsed = JSON.parse(value)
  return modelAssistantSessionContextSchema.parse(parsed)
}

export function parseCloneSourceModel(model: {
  accessoryPrice: null | { toNumber(): number }
  basePrice: { toNumber(): number }
  compatibleGlassTypeIds: string
  costPerMmHeight: { toNumber(): number }
  costPerMmWidth: { toNumber(): number }
  designTemplateId: string | null
  imageUrl: string | null
  maxHeightMm: number
  maxWidthMm: number
  minHeightMm: number
  minWidthMm: number
  name: string
  profileSupplierId: string | null
  status: string
}): SourceModelClone {
  return {
    accessoryPrice: model.accessoryPrice ? toNumber(model.accessoryPrice) : null,
    basePrice: toNumber(model.basePrice),
    compatibleGlassTypeIds: model.compatibleGlassTypeIds,
    costPerMmHeight: toNumber(model.costPerMmHeight),
    costPerMmWidth: toNumber(model.costPerMmWidth),
    designTemplateId: model.designTemplateId,
    imageUrl: model.imageUrl,
    maxHeightMm: model.maxHeightMm,
    maxWidthMm: model.maxWidthMm,
    minHeightMm: model.minHeightMm,
    minWidthMm: model.minWidthMm,
    name: model.name,
    profileSupplierId: model.profileSupplierId,
    status: model.status,
  }
}
