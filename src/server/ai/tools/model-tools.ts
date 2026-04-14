import type { Model } from "@prisma/generated/client"
import { z } from "zod"
import { appRouter } from "@/server/api/root"
import { createCallerFactory, createTRPCContext } from "@/server/api/trpc"

export const MODEL_TOOL_NAMES = {
  CREATE_MODEL: "create_model",
  UPDATE_MODEL: "update_model",
  CLONE_MODEL: "clone_model",
  PUBLISH_MODEL: "publish_model",
  LIST_MODELS: "list_models",
  GET_MODEL: "get_model",
} as const

const createModelInputSchema = z.object({
  name: z.string().describe("Model name (e.g., Ventana Corrediza PVC)"),
  designTemplateId: z
    .string()
    .cuid()
    .optional()
    .nullable()
    .describe("Design template ID for SVG visualization"),
  profileSupplierId: z
    .string()
    .cuid()
    .optional()
    .nullable()
    .describe("Profile supplier (manufacturer) ID"),
  minWidthMm: z.number().int().min(100).max(10000).describe("Minimum width in millimeters"),
  maxWidthMm: z.number().int().min(100).max(10000).describe("Maximum width in millimeters"),
  minHeightMm: z.number().int().min(100).max(10000).describe("Minimum height in millimeters"),
  maxHeightMm: z.number().int().min(100).max(10000).describe("Maximum height in millimeters"),
  compatibleGlassTypeIds: z
    .array(z.string().cuid())
    .min(1)
    .describe("Array of compatible GlassType IDs"),
  basePrice: z.number().nonnegative().describe("Base price in tenant currency"),
  costPerMmWidth: z
    .number()
    .nonnegative()
    .default(0)
    .describe("Additional cost per millimeter of width"),
  costPerMmHeight: z
    .number()
    .nonnegative()
    .default(0)
    .describe("Additional cost per millimeter of height"),
  accessoryPrice: z
    .number()
    .nonnegative()
    .optional()
    .nullable()
    .describe("Optional flat accessory fee"),
  status: z.enum(["draft", "published"]).default("draft").describe("Model status"),
})

const updateModelInputSchema = z.object({
  id: z.string().cuid().describe("Model ID to update"),
  data: z.object({
    name: z.string().optional(),
    designTemplateId: z.string().cuid().optional().nullable(),
    profileSupplierId: z.string().cuid().optional().nullable(),
    minWidthMm: z.number().int().min(100).max(10000).optional(),
    maxWidthMm: z.number().int().min(100).max(10000).optional(),
    minHeightMm: z.number().int().min(100).max(10000).optional(),
    maxHeightMm: z.number().int().min(100).max(10000).optional(),
    compatibleGlassTypeIds: z.array(z.string().cuid()).min(1).optional(),
    basePrice: z.number().nonnegative().optional(),
    costPerMmWidth: z.number().nonnegative().optional(),
    costPerMmHeight: z.number().nonnegative().optional(),
    accessoryPrice: z.number().nonnegative().optional().nullable(),
  }),
})

const cloneModelInputSchema = z.object({
  sourceModelId: z.string().cuid().describe("ID of the source model to clone"),
  newName: z.string().min(2).max(100).describe("Name for the new cloned model"),
  newProfileSupplierId: z.string().cuid().describe("New profile supplier ID for the cloned model"),
})

const publishModelInputSchema = z.object({
  modelId: z.string().cuid().describe("ID of the model to publish"),
})

const listModelsInputSchema = z.object({
  search: z.string().optional().describe("Search by model name"),
  status: z.enum(["all", "draft", "published"]).default("all").describe("Filter by status"),
  profileSupplierId: z.string().cuid().optional().describe("Filter by profile supplier"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getModelInputSchema = z.object({
  id: z.string().cuid().describe("Model ID"),
})

type CreateModelInput = z.infer<typeof createModelInputSchema>
type UpdateModelInput = z.infer<typeof updateModelInputSchema>
type CloneModelInput = z.infer<typeof cloneModelInputSchema>
type PublishModelInput = z.infer<typeof publishModelInputSchema>
type ListModelsInput = z.infer<typeof listModelsInputSchema>
type GetModelInput = z.infer<typeof getModelInputSchema>

interface ModelAssistantTool {
  name: string
  description: string
  parameters: z.ZodType<unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (input: any) => Promise<any>
}

async function createTRPCaller() {
  const heads = new Headers()
  heads.set("x-trpc-source", "ai-tool")
  const ctx = await createTRPCContext({ headers: heads })
  return createCallerFactory(appRouter)(ctx)
}

export async function createModelTool(input: CreateModelInput) {
  const caller = await createTRPCaller()
  return caller.admin.model.create(input)
}

export async function updateModelTool(input: UpdateModelInput) {
  const caller = await createTRPCaller()
  return caller.admin.model.update(input)
}

export async function cloneModelTool(input: CloneModelInput) {
  const caller = await createTRPCaller()
  return caller.admin.model.clone(input)
}

export async function publishModelTool(input: PublishModelInput) {
  const caller = await createTRPCaller()
  return caller.admin.model.publish(input)
}

export async function listModelsTool(input: ListModelsInput) {
  const caller = await createTRPCaller()
  return caller.admin.model.list(input)
}

export async function getModelTool(input: GetModelInput) {
  const caller = await createTRPCaller()
  return caller.admin.model["get-by-id"](input)
}

export function getModelTools(): ModelAssistantTool[] {
  return [
    {
      name: MODEL_TOOL_NAMES.CREATE_MODEL,
      description:
        "Creates a new window/door model. Use this when the user wants to create a new model from scratch. Required: name, dimensions, compatible glass types, profile supplier.",
      parameters: createModelInputSchema,
      execute: createModelTool,
    },
    {
      name: MODEL_TOOL_NAMES.UPDATE_MODEL,
      description:
        "Updates an existing model. Use this when the user wants to modify an existing model's properties. Required: id, data with fields to update.",
      parameters: updateModelInputSchema,
      execute: updateModelTool,
    },
    {
      name: MODEL_TOOL_NAMES.CLONE_MODEL,
      description:
        "Clones an existing model for a new profile supplier, copying design template and dimensions but NOT pricing. Use this when the user wants to create a variant of an existing model for a different supplier.",
      parameters: cloneModelInputSchema,
      execute: cloneModelTool,
    },
    {
      name: MODEL_TOOL_NAMES.PUBLISH_MODEL,
      description:
        "Publishes a model (changes status from draft to published). The model MUST have at least one cost breakdown entry. Use this after calibration is complete.",
      parameters: publishModelInputSchema,
      execute: publishModelTool,
    },
    {
      name: MODEL_TOOL_NAMES.LIST_MODELS,
      description:
        "Lists models with optional filters: search by name, filter by status (draft/published), filter by profile supplier.",
      parameters: listModelsInputSchema,
      execute: listModelsTool,
    },
    {
      name: MODEL_TOOL_NAMES.GET_MODEL,
      description: "Gets a single model by ID, including all its details and cost breakdowns.",
      parameters: getModelInputSchema,
      execute: getModelTool,
    },
  ]
}
