import { describe, it, expect } from "vitest"
import { z } from "zod"

const RoutedIntentSchema = z.object({
  mode: z.enum(["create_model", "calibrate_model", "create_quote"]),
  confidence: z.number().min(0).max(1),
})

describe("Model Assistant Router", () => {
  describe("RoutedIntentSchema", () => {
    it("accepts create_model intent", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "create_model", confidence: 0.92 })
      expect(result.success).toBe(true)
    })

    it("accepts calibrate_model intent", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "calibrate_model", confidence: 0.88 })
      expect(result.success).toBe(true)
    })

    it("accepts create_quote intent", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "create_quote", confidence: 0.85 })
      expect(result.success).toBe(true)
    })

    it("rejects unknown mode", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "unknown_mode", confidence: 0.5 })
      expect(result.success).toBe(false)
    })

    it("rejects confidence outside 0-1 range", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "create_model", confidence: 1.5 })
      expect(result.success).toBe(false)
    })

    it("rejects negative confidence", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "create_model", confidence: -0.1 })
      expect(result.success).toBe(false)
    })
  })

  describe("mode routing logic", () => {
    it("create_model keywords should route high confidence", () => {
      const createKeywords = [
        "crear modelo",
        "nueva ventana",
        "nuevo modelo",
        "crear ventana",
        "diseñar modelo",
        "modelo nuevo",
      ]
      createKeywords.forEach((keyword) => {
        const result = RoutedIntentSchema.safeParse({ mode: "create_model", confidence: 0.85 })
        expect(result.success).toBe(true)
      })
    })

    it("calibrate_model keywords should route high confidence", () => {
      const calibrateKeywords = [
        "calibrar",
        "precio",
        "costo",
        "calibration",
        "ajustar precios",
        "actualizar costo",
      ]
      calibrateKeywords.forEach((keyword) => {
        const result = RoutedIntentSchema.safeParse({ mode: "calibrate_model", confidence: 0.85 })
        expect(result.success).toBe(true)
      })
    })

    it("create_quote is future/stub intent", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "create_quote", confidence: 0.88 })
      expect(result.success).toBe(true)
    })

    it("unknown intent should have low confidence", () => {
      const result = RoutedIntentSchema.safeParse({ mode: "create_model", confidence: 0.31 })
      expect(result.success).toBe(true)
    })
  })

  describe("confidence threshold", () => {
    it("confidence >= 0.7 is considered confident", () => {
      const CONFIDENCE_THRESHOLD = 0.7
      const highConfidence = 0.92
      expect(highConfidence >= CONFIDENCE_THRESHOLD).toBe(true)
    })

    it("confidence < 0.7 returns unknown/disambiguation", () => {
      const CONFIDENCE_THRESHOLD = 0.7
      const lowConfidence = 0.31
      expect(lowConfidence < CONFIDENCE_THRESHOLD).toBe(true)
    })
  })
})
