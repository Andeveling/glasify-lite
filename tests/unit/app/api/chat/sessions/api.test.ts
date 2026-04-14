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

describe("Chat Sessions API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("POST /api/chat/sessions", () => {
    it("creates a session with create_model mode", async () => {
      const { createModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { createModelAssistantSession: mockCreate } = vi.mocked({ createModelAssistantSession })

      mockCreate.mockResolvedValue({ id: "sess-123" })

      const result = await mockCreate({
        userId: "user-1",
        mode: ModelAssistantMode.CREATE_MODEL,
      })

      expect(result.id).toBe("sess-123")
      expect(mockCreate).toHaveBeenCalledWith({
        userId: "user-1",
        mode: "create_model",
      })
    })

    it("creates a session with calibrate_model mode", async () => {
      const { createModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { createModelAssistantSession: mockCreate } = vi.mocked({ createModelAssistantSession })

      mockCreate.mockResolvedValue({ id: "sess-456" })

      const result = await mockCreate({
        userId: "user-1",
        mode: ModelAssistantMode.CALIBRATE_MODEL,
      })

      expect(result.id).toBe("sess-456")
    })

    it("creates a session with full context including modelId, supplierId, barLengthMeters, profiles and accessories", async () => {
      const { createModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { createModelAssistantSession: mockCreate } = vi.mocked({ createModelAssistantSession })

      mockCreate.mockResolvedValue({ id: "sess-789" })

      const fullContext = {
        name: "Ventana Corrediza",
        modelId: "model-abc",
        supplierId: "supplier-xyz",
        barLengthMeters: 2.5,
        profiles: [{ name: "Marco", meters: 5 }],
        accessories: [{ name: "Clip", quantity: 10 }],
      }

      const result = await mockCreate({
        userId: "user-1",
        mode: ModelAssistantMode.CREATE_MODEL,
        context: fullContext,
      })

      expect(result.id).toBe("sess-789")
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ context: fullContext }),
      )
    })
  })

  describe("GET /api/chat/sessions/[sessionId]", () => {
    it("retrieves an existing session", async () => {
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { getModelAssistantSession: mockGet } = vi.mocked({ getModelAssistantSession })

      const mockSession = {
        id: "sess-123",
        userId: "user-1",
        mode: "create_model" as const,
        currentModelId: null,
        currentStep: "initial",
        context: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockGet.mockResolvedValue(mockSession)

      const result = await mockGet("sess-123")

      expect(result?.id).toBe("sess-123")
      expect(result?.mode).toBe("create_model")
    })

    it("returns null for non-existent session", async () => {
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { getModelAssistantSession: mockGet } = vi.mocked({ getModelAssistantSession })

      mockGet.mockResolvedValue(null)

      const result = await mockGet("non-existent")

      expect(result).toBeNull()
    })
  })

  describe("PATCH /api/chat/sessions/[sessionId]", () => {
    it("updates session currentStep", async () => {
      const { updateModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { updateModelAssistantSession: mockUpdate } = vi.mocked({ updateModelAssistantSession })

      const mockSession = {
        id: "sess-123",
        userId: "user-1",
        mode: "create_model" as const,
        currentModelId: null,
        currentStep: "select_template",
        context: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUpdate.mockResolvedValue(mockSession)

      const result = await mockUpdate({
        sessionId: "sess-123",
        currentStep: "select_template",
      })

      expect(result.currentStep).toBe("select_template")
    })

    it("updates session with full context including modelId, supplierId, barLengthMeters, profiles and accessories", async () => {
      const { updateModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { updateModelAssistantSession: mockUpdate } = vi.mocked({ updateModelAssistantSession })

      const mockSession = {
        id: "sess-123",
        userId: "user-1",
        mode: "create_model" as const,
        currentModelId: null,
        currentStep: "initial",
        context: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const fullContext = {
        name: "Ventana Corrediza",
        modelId: "model-abc",
        supplierId: "supplier-xyz",
        barLengthMeters: 2.5,
        profiles: [{ name: "Marco", meters: 5 }],
        accessories: [{ name: "Clip", quantity: 10 }],
      }

      mockUpdate.mockResolvedValue({ ...mockSession, context: fullContext })

      const result = await mockUpdate({
        sessionId: "sess-123",
        context: fullContext,
      })

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ context: fullContext }),
      )
      expect(result.context).toEqual(fullContext)
    })
  })
})
