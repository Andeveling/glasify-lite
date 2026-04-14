import { tool } from "ai"
import { z } from "zod"
import {
  getDesignTemplateTool,
  getGlassTypeTool,
  getProfileSupplierTool,
  listDesignTemplatesTool,
  listGlassTypesTool,
  listProfileSuppliersTool,
} from "@/server/ai/tools/catalog-tools"
import {
  cloneModelTool,
  createModelTool,
  getModelTool,
  listModelsTool,
  publishModelTool,
  updateModelTool,
} from "@/server/ai/tools/model-tools"

const createModelInputSchema = z.object({
  name: z.string().describe("Model name (e.g., Ventana Corrediza PVC)"),
  designTemplateId: z.string().cuid().describe("Design template ID for SVG visualization"),
  profileSupplierId: z.string().cuid().describe("Profile supplier (manufacturer) ID"),
  minWidthMm: z.number().int().min(100).max(10000).describe("Minimum width in millimeters"),
  maxWidthMm: z.number().int().min(100).max(10000).describe("Maximum width in millimeters"),
  minHeightMm: z.number().int().min(100).max(10000).describe("Minimum height in millimeters"),
  maxHeightMm: z.number().int().min(100).max(10000).describe("Maximum height in millimeters"),
  compatibleGlassTypeIds: z
    .array(z.string().cuid())
    .min(1)
    .describe("Array of compatible GlassType IDs"),
  basePrice: z.number().nonnegative().describe("Base price in tenant currency"),
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

const listModelsInputSchema = z.object({
  search: z.string().optional().describe("Search by model name"),
  status: z.enum(["all", "draft", "published"]).default("all").describe("Filter by status"),
  profileSupplierId: z.string().optional().describe("Filter by profile supplier"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getModelInputSchema = z.object({
  id: z.string().cuid().describe("Model ID"),
})

const listDesignTemplatesInputSchema = z.object({
  search: z.string().optional().describe("Search by template name"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getDesignTemplateInputSchema = z.object({
  id: z.string().cuid().describe("Design template ID"),
})

const listProfileSuppliersInputSchema = z.object({
  search: z.string().optional().describe("Search by supplier name"),
  isActive: z
    .enum(["all", "active", "inactive"])
    .default("all")
    .describe("Filter by active status"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getProfileSupplierInputSchema = z.object({
  id: z.string().cuid().describe("Profile supplier ID"),
})

const listGlassTypesInputSchema = z.object({
  search: z.string().optional().describe("Search by glass type name"),
  isActive: z
    .enum(["all", "active", "inactive"])
    .default("all")
    .describe("Filter by active status"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getGlassTypeInputSchema = z.object({
  id: z.string().cuid().describe("Glass type ID"),
})

type CreateModelInput = z.infer<typeof createModelInputSchema>
type UpdateModelInput = z.infer<typeof updateModelInputSchema>
type ListModelsInput = z.infer<typeof listModelsInputSchema>
type GetModelInput = z.infer<typeof getModelInputSchema>
type ListDesignTemplatesInput = z.infer<typeof listDesignTemplatesInputSchema>
type GetDesignTemplateInput = z.infer<typeof getDesignTemplateInputSchema>
type ListProfileSuppliersInput = z.infer<typeof listProfileSuppliersInputSchema>
type GetProfileSupplierInput = z.infer<typeof getProfileSupplierInputSchema>
type ListGlassTypesInput = z.infer<typeof listGlassTypesInputSchema>
type GetGlassTypeInput = z.infer<typeof getGlassTypeInputSchema>

const cloneModelInputSchema = z.object({
  sourceModelId: z.string().cuid().describe("ID of the source model to clone"),
  newName: z.string().min(2).max(100).describe("Name for the new cloned model"),
  newProfileSupplierId: z.string().cuid().describe("New profile supplier ID for the cloned model"),
})

const publishModelInputSchema = z.object({
  modelId: z.string().cuid().describe("ID of the model to publish"),
})

type CloneModelInput = z.infer<typeof cloneModelInputSchema>
type PublishModelInput = z.infer<typeof publishModelInputSchema>

export const modelCreationTools = {
  createModel: tool({
    description:
      "Creates a new window/door model. Use this when the user wants to create a new model from scratch. Required: name, dimensions, compatible glass types, profile supplier.",
    inputSchema: createModelInputSchema,
    execute: async (input: CreateModelInput) => {
      return createModelTool({
        name: input.name,
        designTemplateId: input.designTemplateId,
        profileSupplierId: input.profileSupplierId,
        minWidthMm: input.minWidthMm,
        maxWidthMm: input.maxWidthMm,
        minHeightMm: input.minHeightMm,
        maxHeightMm: input.maxHeightMm,
        compatibleGlassTypeIds: input.compatibleGlassTypeIds,
        basePrice: input.basePrice,
        costPerMmWidth: 0,
        costPerMmHeight: 0,
        status: "draft",
      })
    },
  }),

  updateModel: tool({
    description:
      "Updates an existing model. Use this when the user wants to modify model properties or pricing.",
    inputSchema: updateModelInputSchema,
    execute: async (input: UpdateModelInput) => {
      return updateModelTool({
        id: input.id,
        data: {
          name: input.data.name,
          designTemplateId: input.data.designTemplateId,
          profileSupplierId: input.data.profileSupplierId,
          minWidthMm: input.data.minWidthMm,
          maxWidthMm: input.data.maxWidthMm,
          minHeightMm: input.data.minHeightMm,
          maxHeightMm: input.data.maxHeightMm,
          compatibleGlassTypeIds: input.data.compatibleGlassTypeIds,
          basePrice: input.data.basePrice,
          costPerMmWidth: input.data.costPerMmWidth,
          costPerMmHeight: input.data.costPerMmHeight,
          accessoryPrice: input.data.accessoryPrice,
        },
      })
    },
  }),

  cloneModel: tool({
    description:
      "Clones an existing model for a new profile supplier, copying design template and dimensions but not pricing.",
    inputSchema: cloneModelInputSchema,
    execute: async (input: CloneModelInput) => {
      return cloneModelTool({
        sourceModelId: input.sourceModelId,
        newName: input.newName,
        newProfileSupplierId: input.newProfileSupplierId,
      })
    },
  }),

  publishModel: tool({
    description:
      "Publishes a model once calibration is complete. The model must have at least one cost breakdown entry.",
    inputSchema: publishModelInputSchema,
    execute: async (input: PublishModelInput) => {
      return publishModelTool({ modelId: input.modelId })
    },
  }),

  listModels: tool({
    description:
      "Lists models with optional filters: search by name, filter by status (draft/published), filter by profile supplier.",
    inputSchema: listModelsInputSchema,
    execute: async (input: ListModelsInput) => {
      return listModelsTool({
        search: input.search,
        status: input.status,
        profileSupplierId: input.profileSupplierId,
        page: input.page,
        limit: input.limit,
      })
    },
  }),

  getModel: tool({
    description: "Gets a single model by ID, including all its details and cost breakdowns.",
    inputSchema: getModelInputSchema,
    execute: async (input: GetModelInput) => {
      return getModelTool({ id: input.id })
    },
  }),

  listDesignTemplates: tool({
    description:
      "Lists all available design templates for window/door configurations (OX, XX, etc.).",
    inputSchema: listDesignTemplatesInputSchema,
    execute: async (input: ListDesignTemplatesInput) => {
      return listDesignTemplatesTool({
        search: input.search,
        page: input.page ?? 1,
        limit: input.limit ?? 20,
      })
    },
  }),

  getDesignTemplate: tool({
    description: "Gets a single design template by ID.",
    inputSchema: getDesignTemplateInputSchema,
    execute: async (input: GetDesignTemplateInput) => {
      return getDesignTemplateTool({ id: input.id })
    },
  }),

  listProfileSuppliers: tool({
    description: "Lists all profile suppliers (manufacturers) available.",
    inputSchema: listProfileSuppliersInputSchema,
    execute: async (input: ListProfileSuppliersInput) => {
      return listProfileSuppliersTool({
        search: input.search,
        isActive: input.isActive ?? "all",
        page: input.page ?? 1,
        limit: input.limit ?? 20,
      })
    },
  }),

  getProfileSupplier: tool({
    description: "Gets a single profile supplier by ID.",
    inputSchema: getProfileSupplierInputSchema,
    execute: async (input: GetProfileSupplierInput) => {
      return getProfileSupplierTool({ id: input.id })
    },
  }),

  listGlassTypes: tool({
    description: "Lists all glass types available for windows/doors.",
    inputSchema: listGlassTypesInputSchema,
    execute: async (input: ListGlassTypesInput) => {
      return listGlassTypesTool({
        search: input.search,
        isActive: input.isActive ?? "all",
        page: input.page ?? 1,
        limit: input.limit ?? 20,
      })
    },
  }),

  getGlassType: tool({
    description: "Gets a single glass type by ID.",
    inputSchema: getGlassTypeInputSchema,
    execute: async (input: GetGlassTypeInput) => {
      return getGlassTypeTool({ id: input.id })
    },
  }),
}

export const modelCalibrationTools = {
  getModel: modelCreationTools.getModel,
  listModels: modelCreationTools.listModels,
  updateModel: modelCreationTools.updateModel,
  cloneModel: modelCreationTools.cloneModel,
  publishModel: modelCreationTools.publishModel,
  listProfileSuppliers: modelCreationTools.listProfileSuppliers,
  getProfileSupplier: modelCreationTools.getProfileSupplier,
  listGlassTypes: modelCreationTools.listGlassTypes,
  getGlassType: modelCreationTools.getGlassType,
}

export type ModelCreationTools = typeof modelCreationTools
export type ModelCalibrationTools = typeof modelCalibrationTools
