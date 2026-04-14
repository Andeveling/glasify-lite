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
import { createModelTool, getModelTool, listModelsTool } from "@/server/ai/tools/model-tools"

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
type ListModelsInput = z.infer<typeof listModelsInputSchema>
type GetModelInput = z.infer<typeof getModelInputSchema>
type ListDesignTemplatesInput = z.infer<typeof listDesignTemplatesInputSchema>
type GetDesignTemplateInput = z.infer<typeof getDesignTemplateInputSchema>
type ListProfileSuppliersInput = z.infer<typeof listProfileSuppliersInputSchema>
type GetProfileSupplierInput = z.infer<typeof getProfileSupplierInputSchema>
type ListGlassTypesInput = z.infer<typeof listGlassTypesInputSchema>
type GetGlassTypeInput = z.infer<typeof getGlassTypeInputSchema>

export const modelCreationTools = {
  createModel: tool({
    description:
      "Creates a new window/door model. Use this when the user wants to create a new model from scratch. Required: name, dimensions, compatible glass types, profile supplier.",
    inputSchema: createModelInputSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
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

  listModels: tool({
    description:
      "Lists models with optional filters: search by name, filter by status (draft/published), filter by profile supplier.",
    inputSchema: listModelsInputSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
      return getModelTool({ id: input.id })
    },
  }),

  listDesignTemplates: tool({
    description:
      "Lists all available design templates for window/door configurations (OX, XX, etc.).",
    inputSchema: listDesignTemplatesInputSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
      return getDesignTemplateTool({ id: input.id })
    },
  }),

  listProfileSuppliers: tool({
    description: "Lists all profile suppliers (manufacturers) available.",
    inputSchema: listProfileSuppliersInputSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
      return getProfileSupplierTool({ id: input.id })
    },
  }),

  listGlassTypes: tool({
    description: "Lists all glass types available for windows/doors.",
    inputSchema: listGlassTypesInputSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (input: any) => {
      return getGlassTypeTool({ id: input.id })
    },
  }),
}

export const modelCalibrationTools = {
  getModel: modelCreationTools.getModel,
  listModels: modelCreationTools.listModels,
  listProfileSuppliers: modelCreationTools.listProfileSuppliers,
  getProfileSupplier: modelCreationTools.getProfileSupplier,
  listGlassTypes: modelCreationTools.listGlassTypes,
  getGlassType: modelCreationTools.getGlassType,
}

export type ModelCreationTools = typeof modelCreationTools
export type ModelCalibrationTools = typeof modelCalibrationTools
