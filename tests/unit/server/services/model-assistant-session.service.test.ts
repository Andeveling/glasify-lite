import { describe, it, expect, vi, beforeEach } from "vitest"
import { ModelAssistantMode } from "@/server/services/model-assistant-session.service"

vi.mock("@/server/services/model-assistant-session.service", () => ({
  createModelAssistantSession: vi.fn(),
  getModelAssistantSession: vi.fn(),
  updateModelAssistantSession: vi.fn(),
  deleteModelAssistantSession: vi.fn(),
  ModelAssistantMode: {
    CREATE_MODEL: "create_model",
    CALIBRATE_MODEL: "calibrate_model",
    CREATE_QUOTE: "create_quote",
  },
}))

describe("Model Assistant Session Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("ModelAssistantMode", () => {
    it("exports create_model mode", () => {
      expect(ModelAssistantMode.CREATE_MODEL).toBe("create_model")
    })

    it("exports calibrate_model mode", () => {
      expect(ModelAssistantMode.CALIBRATE_MODEL).toBe("calibrate_model")
    })

    it("exports create_quote mode", () => {
      expect(ModelAssistantMode.CREATE_QUOTE).toBe("create_quote")
    })
  })
})
