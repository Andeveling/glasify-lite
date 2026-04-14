import { z } from "zod"
import { appRouter } from "@/server/api/root"
import { createCallerFactory, createTRPCContext } from "@/server/api/trpc"

export const CATALOG_TOOL_NAMES = {
  LIST_DESIGN_TEMPLATES: "list_design_templates",
  LIST_PROFILE_SUPPLIERS: "list_profile_suppliers",
  LIST_GLASS_TYPES: "list_glass_types",
  GET_DESIGN_TEMPLATE: "get_design_template",
  GET_PROFILE_SUPPLIER: "get_profile_supplier",
  GET_GLASS_TYPE: "get_glass_type",
} as const

const listDesignTemplatesInputSchema = z.object({
  search: z.string().optional().describe("Search by name or pattern"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getDesignTemplateInputSchema = z.object({
  id: z.string().cuid().describe("Design template ID"),
})

const listProfileSuppliersInputSchema = z.object({
  search: z.string().optional().describe("Search by name"),
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
  search: z.string().optional().describe("Search by name"),
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

type ListDesignTemplatesInput = z.infer<typeof listDesignTemplatesInputSchema>
type GetDesignTemplateInput = z.infer<typeof getDesignTemplateInputSchema>
type ListProfileSuppliersInput = z.infer<typeof listProfileSuppliersInputSchema>
type GetProfileSupplierInput = z.infer<typeof getProfileSupplierInputSchema>
type ListGlassTypesInput = z.infer<typeof listGlassTypesInputSchema>
type GetGlassTypeInput = z.infer<typeof getGlassTypeInputSchema>

interface CatalogTool {
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

export async function listDesignTemplatesTool(input: ListDesignTemplatesInput) {
  const caller = await createTRPCaller()
  return caller.admin["design-template"].list({
    page: input.page,
    limit: input.limit,
    search: input.search,
  })
}

export async function getDesignTemplateTool(input: GetDesignTemplateInput) {
  const caller = await createTRPCaller()
  return caller.admin["design-template"].getById(input)
}

export async function listProfileSuppliersTool(input: ListProfileSuppliersInput) {
  const caller = await createTRPCaller()
  return caller.admin["profile-supplier"].list({
    page: input.page,
    limit: input.limit,
    search: input.search,
    isActive: input.isActive,
  })
}

export async function getProfileSupplierTool(input: GetProfileSupplierInput) {
  const caller = await createTRPCaller()
  return caller.admin["profile-supplier"].getById(input)
}

export async function listGlassTypesTool(input: ListGlassTypesInput) {
  const caller = await createTRPCaller()
  return caller.admin["glass-type"].list({
    page: input.page,
    limit: input.limit,
    search: input.search,
    isActive: input.isActive,
  })
}

export async function getGlassTypeTool(input: GetGlassTypeInput) {
  const caller = await createTRPCaller()
  return caller.admin["glass-type"].getById(input)
}

export function getCatalogTools(): CatalogTool[] {
  return [
    {
      name: CATALOG_TOOL_NAMES.LIST_DESIGN_TEMPLATES,
      description:
        "Lists all design templates (OX, XX, XO, XXO, etc.) with optional search. Design templates define window panel patterns.",
      parameters: listDesignTemplatesInputSchema,
      execute: listDesignTemplatesTool,
    },
    {
      name: CATALOG_TOOL_NAMES.GET_DESIGN_TEMPLATE,
      description:
        "Gets a single design template by ID, including its panel configuration (pattern, frame settings).",
      parameters: getDesignTemplateInputSchema,
      execute: getDesignTemplateTool,
    },
    {
      name: CATALOG_TOOL_NAMES.LIST_PROFILE_SUPPLIERS,
      description:
        "Lists all profile suppliers (manufacturers like Extralum, Rehau, others) with optional search and active status filter.",
      parameters: listProfileSuppliersInputSchema,
      execute: listProfileSuppliersTool,
    },
    {
      name: CATALOG_TOOL_NAMES.GET_PROFILE_SUPPLIER,
      description:
        "Gets a single profile supplier by ID, including material type and pricing information.",
      parameters: getProfileSupplierInputSchema,
      execute: getProfileSupplierTool,
    },
    {
      name: CATALOG_TOOL_NAMES.LIST_GLASS_TYPES,
      description:
        "Lists all glass types (transparent, tempered, laminated, etc.) with optional search and active status filter.",
      parameters: listGlassTypesInputSchema,
      execute: listGlassTypesTool,
    },
    {
      name: CATALOG_TOOL_NAMES.GET_GLASS_TYPE,
      description: "Gets a single glass type by ID, including thickness and pricing information.",
      parameters: getGlassTypeInputSchema,
      execute: getGlassTypeTool,
    },
  ]
}
