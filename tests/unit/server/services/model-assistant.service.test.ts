import { describe, expect, it } from "vitest"
import {
  buildModelClonePayload,
  ensureModelCanBePublished,
  parseModelAssistantSessionContext,
  serializeModelAssistantSessionContext,
} from "@/server/services/model-assistant.service"

describe("model-assistant.service", () => {
  describe("buildModelClonePayload", () => {
    it("copies design and dimensions but resets pricing for a draft clone", () => {
      const payload = buildModelClonePayload({
        input: {
          newName: "Europa 2P",
          newProfileSupplierId: "supplier-2",
          sourceModelId: "model-1",
        },
        sourceModel: {
          accessoryPrice: 99,
          compatibleGlassTypeIds: '["glass-1","glass-2"]',
          costPerMmHeight: 0.5,
          costPerMmWidth: 0.4,
          designTemplateId: "design-ox",
          imageUrl: "/models/model-1.png",
          maxHeightMm: 2400,
          maxWidthMm: 2000,
          minHeightMm: 400,
          minWidthMm: 600,
          name: "VC Panama 2P",
          profileSupplierId: "supplier-1",
          status: "published",
          basePrice: 250,
        },
      })

      expect(payload).toEqual({
        accessoryPrice: 0,
        compatibleGlassTypeIds: '["glass-1","glass-2"]',
        costPerMmHeight: 0,
        costPerMmWidth: 0,
        designTemplateId: "design-ox",
        imageUrl: "/models/model-1.png",
        maxHeightMm: 2400,
        maxWidthMm: 2000,
        minHeightMm: 400,
        minWidthMm: 600,
        name: "Europa 2P",
        profileSupplierId: "supplier-2",
        status: "draft",
        basePrice: 0,
      })
    })
  })

  describe("ensureModelCanBePublished", () => {
    it("allows publishing when the model has at least one cost breakdown entry", () => {
      expect(() =>
        ensureModelCanBePublished({ costBreakdownCount: 1, modelName: "VC Panama 2P" }),
      ).not.toThrow()
    })

    it("rejects publishing when the model has no cost breakdown entries", () => {
      expect(() =>
        ensureModelCanBePublished({ costBreakdownCount: 0, modelName: "VC Panama 2P" }),
      ).toThrow("El modelo debe ser calibrado antes de publicarse")
    })
  })

  describe("session context serialization", () => {
    it("round-trips create session context", () => {
      const context = {
        glassTypeIds: ["glass-1"],
        name: "VC Panama 2P",
        designTemplateId: "design-ox",
        profileSupplierId: "supplier-1",
        dimensions: {
          maxHeightMm: 2400,
          maxWidthMm: 2000,
          minHeightMm: 400,
          minWidthMm: 600,
        },
      }

      const serialized = serializeModelAssistantSessionContext(context)
      const parsed = parseModelAssistantSessionContext(serialized)

      expect(parsed).toEqual(context)
    })

    it("round-trips calibrate session context", () => {
      const context = {
        accessories: [{ name: "Ruedas", quantity: 2 }],
        barLengthMeters: 5.8,
        modelId: "model-1",
        profiles: [{ name: "Marco", meters: 12 }],
        supplierId: "supplier-1",
      }

      const serialized = serializeModelAssistantSessionContext(context)
      const parsed = parseModelAssistantSessionContext(serialized)

      expect(parsed).toEqual(context)
    })
  })
})
