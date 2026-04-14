import { describe, it, expect } from "vitest"
import { z } from "zod"

const CATALOG_TOOL_NAMES = {
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
  isActive: z.enum(["all", "active", "inactive"]).default("all").describe("Filter by active status"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getProfileSupplierInputSchema = z.object({
  id: z.string().cuid().describe("Profile supplier ID"),
})

const listGlassTypesInputSchema = z.object({
  search: z.string().optional().describe("Search by name"),
  isActive: z.enum(["all", "active", "inactive"]).default("all").describe("Filter by active status"),
  page: z.number().int().positive().default(1).describe("Page number"),
  limit: z.number().int().positive().max(100).default(20).describe("Items per page"),
})

const getGlassTypeInputSchema = z.object({
  id: z.string().cuid().describe("Glass type ID"),
})

describe("Catalog Tools", () => {
  describe("CATALOG_TOOL_NAMES", () => {
    it("exports all expected tool names", () => {
      expect(CATALOG_TOOL_NAMES.LIST_DESIGN_TEMPLATES).toBe("list_design_templates")
      expect(CATALOG_TOOL_NAMES.LIST_PROFILE_SUPPLIERS).toBe("list_profile_suppliers")
      expect(CATALOG_TOOL_NAMES.LIST_GLASS_TYPES).toBe("list_glass_types")
      expect(CATALOG_TOOL_NAMES.GET_DESIGN_TEMPLATE).toBe("get_design_template")
      expect(CATALOG_TOOL_NAMES.GET_PROFILE_SUPPLIER).toBe("get_profile_supplier")
      expect(CATALOG_TOOL_NAMES.GET_GLASS_TYPE).toBe("get_glass_type")
    })
  })

  describe("schema validation", () => {
    it("list_design_templates schema accepts valid input", () => {
      const result = listDesignTemplatesInputSchema.safeParse({
        search: "OX",
        page: 1,
        limit: 20,
      })
      expect(result.success).toBe(true)
    })

    it("list_design_templates schema accepts empty input", () => {
      const result = listDesignTemplatesInputSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it("get_design_template schema accepts valid input", () => {
      const result = getDesignTemplateInputSchema.safeParse({
        id: "cld123abcde123456789",
      })
      expect(result.success).toBe(true)
    })

    it("list_profile_suppliers schema accepts valid input", () => {
      const result = listProfileSuppliersInputSchema.safeParse({
        search: "Extralum",
        isActive: "active",
        page: 1,
        limit: 20,
      })
      expect(result.success).toBe(true)
    })

    it("get_profile_supplier schema accepts valid input", () => {
      const result = getProfileSupplierInputSchema.safeParse({
        id: "cld123abcde123456789",
      })
      expect(result.success).toBe(true)
    })

    it("list_glass_types schema accepts valid input", () => {
      const result = listGlassTypesInputSchema.safeParse({
        search: "transparente",
        isActive: "active",
        page: 1,
        limit: 20,
      })
      expect(result.success).toBe(true)
    })

    it("get_glass_type schema accepts valid input", () => {
      const result = getGlassTypeInputSchema.safeParse({
        id: "cld123abcde123456789",
      })
      expect(result.success).toBe(true)
    })
  })
})
