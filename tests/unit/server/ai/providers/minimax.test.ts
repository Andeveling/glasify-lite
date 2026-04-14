import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMinimaxProvider, getMinimaxModelId } from "@/server/ai/providers/minimax"

vi.mock("@/env", () => ({
  env: {
    MINIMAX_API_KEY: "test-key",
    MINIMAX_TEXT_MODEL_SPEED: "MiniMax-M2.7-highspeed",
  },
}))

describe("AI Provider", () => {
  describe("getMinimaxModelId", () => {
    it("returns the model ID from env var", () => {
      const modelId = getMinimaxModelId()
      expect(modelId).toBe("MiniMax-M2.7-highspeed")
    })
  })

  describe("createMinimaxProvider", () => {
    it("creates a provider with the configured model", () => {
      const provider = createMinimaxProvider()
      expect(provider).toBeDefined()
      expect(typeof provider.languageModel).toBe("function")
    })

    it("returns a language model for the configured model ID", () => {
      const provider = createMinimaxProvider()
      const model = provider.languageModel(getMinimaxModelId())
      expect(model).toBeDefined()
    })
  })
})
