import { describe, it, expect } from "vitest"
import { z } from "zod"

const MODEL_TOOL_NAMES = {
  CREATE_MODEL: "create_model",
  UPDATE_MODEL: "update_model",
  CLONE_MODEL: "clone_model",
  PUBLISH_MODEL: "publish_model",
  LIST_MODELS: "list_models",
  GET_MODEL: "get_model",
} as const

const createModelInputSchema = z.object({
  name: z.string().describe("Model name (e.g., Ventana Corrediza PVC)"),
  designTemplateId: z.string().cuid().optional().nullable().describe("Design template ID for SVG visualization"),
  profileSupplierId: z.string().cuid().optional().nullable().describe("Profile supplier (manufacturer) ID"),
  minWidthMm: z.number().int().min(100).max(10000).describe("Minimum width in millimeters"),
  maxWidthMm: z.number().int().min(100).max(10000).describe("Maximum width in millimeters"),
  minHeightMm: z.number().int().min(100).max(10000).describe("Minimum height in millimeters"),
  maxHeightMm: z.number().int().min(100).max(10000).describe("Maximum height in millimeters"),
  compatibleGlassTypeIds: z.array(z.string().cuid()).min(1).describe("Array of compatible GlassType IDs"),
  basePrice: z.number().nonnegative().describe("Base price in tenant currency"),
  costPerMmWidth: z.number().nonnegative().default(0).describe("Additional cost per millimeter of width"),
  costPerMmHeight: z.number().nonnegative().default(0).describe("Additional cost per millimeter of height"),
  accessoryPrice: z.number().nonnegative().optional().nullable().describe("Optional flat accessory fee"),
  status: z.enum(["draft", "published"]).default("draft").describe("Model status"),
})

const cloneModelInputSchema = z.object({
  sourceModelId: z.string().cuid().describe("ID of the source model to clone"),
  newName: z.string().min(2).max(100).describe("Name for the new cloned model"),
  newProfileSupplierId: z.string().cuid().describe("New profile supplier ID for the cloned model"),
})

const publishModelInputSchema = z.object({
  modelId: z.string().cuid().describe("ID of the model to publish"),
})

describe("Model Tools", () => {
  describe("MODEL_TOOL_NAMES", () => {
    it("exports all expected tool names", () => {
      expect(MODEL_TOOL_NAMES.CREATE_MODEL).toBe("create_model")
      expect(MODEL_TOOL_NAMES.UPDATE_MODEL).toBe("update_model")
      expect(MODEL_TOOL_NAMES.CLONE_MODEL).toBe("clone_model")
      expect(MODEL_TOOL_NAMES.PUBLISH_MODEL).toBe("publish_model")
      expect(MODEL_TOOL_NAMES.LIST_MODELS).toBe("list_models")
      expect(MODEL_TOOL_NAMES.GET_MODEL).toBe("get_model")
    })
  })

  describe("schema validation", () => {
    it("create_model schema accepts valid input", () => {
      const result = createModelInputSchema.safeParse({
        name: "VC Panama 2P",
        designTemplateId: "cld123abcde123456789",
        profileSupplierId: "cld456abcde123456789",
        minWidthMm: 600,
        maxWidthMm: 2000,
        minHeightMm: 400,
        maxHeightMm: 2200,
        compatibleGlassTypeIds: ["cld789abcde123456789"],
        basePrice: 100,
        costPerMmWidth: 0,
        costPerMmHeight: 0,
        status: "draft",
      })
      expect(result.success).toBe(true)
    })

    it("create_model schema rejects missing required fields", () => {
      const result = createModelInputSchema.safeParse({
        name: "VC Panama 2P",
      })
      expect(result.success).toBe(false)
    })

    it("clone_model schema accepts valid input", () => {
      const result = cloneModelInputSchema.safeParse({
        sourceModelId: "cld123abcde123456789",
        newName: "Europa 2P",
        newProfileSupplierId: "cld456abcde123456789",
      })
      expect(result.success).toBe(true)
    })

    it("clone_model schema rejects missing fields", () => {
      const result = cloneModelInputSchema.safeParse({
        sourceModelId: "cld123abcde123456789",
      })
      expect(result.success).toBe(false)
    })

    it("publish_model schema accepts valid input", () => {
      const result = publishModelInputSchema.safeParse({ modelId: "cld123abcde123456789" })
      expect(result.success).toBe(true)
    })

    it("publish_model schema rejects missing modelId", () => {
      const result = publishModelInputSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
