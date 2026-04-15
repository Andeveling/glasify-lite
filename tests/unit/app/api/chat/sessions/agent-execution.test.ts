import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("@/server/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/lib/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/server/services/model-assistant-session.service", () => ({
  getModelAssistantSession: vi.fn(),
}))

vi.mock("@/server/services/model-assistant-message.service", () => ({
  saveMessage: vi.fn().mockResolvedValue(undefined),
  getMessagesBySession: vi.fn().mockResolvedValue([]),
}))

vi.mock("@/server/ai/tools/model-tools", () => ({
  createModelTool: vi.fn(),
  updateModelTool: vi.fn(),
  cloneModelTool: vi.fn(),
  publishModelTool: vi.fn(),
  listModelsTool: vi.fn(),
  getModelTool: vi.fn(),
}))

vi.mock("@/server/ai/tools/catalog-tools", () => ({
  listDesignTemplatesTool: vi.fn(),
  getDesignTemplateTool: vi.fn(),
  listProfileSuppliersTool: vi.fn(),
  getProfileSupplierTool: vi.fn(),
  listGlassTypesTool: vi.fn(),
  getGlassTypeTool: vi.fn(),
}))

vi.mock("@/server/ai/providers/minimax", () => ({
  createMinimaxProvider: vi.fn().mockReturnValue({
    languageModel: vi.fn().mockReturnValue({}),
  }),
  getMinimaxModelId: vi.fn().mockReturnValue("minimax-model"),
}))

const { createAgentStreamMock, mockStreamResponse } = vi.hoisted(() => {
  const mockStreamResponse = vi.fn(() => new Response())

  const createAgentStreamMock = (sessionUpdates = {}) => {
    const waitForCompletion = vi.fn(() => Promise.resolve(sessionUpdates))
    return {
      streamResponse: mockStreamResponse(),
      waitForCompletion,
    }
  }

  return {
    createAgentStreamMock: vi.fn((opts) => createAgentStreamMock(opts)),
    mockStreamResponse,
  }
})

vi.mock("@/server/ai/agents/model-assistant.agents", () => ({
  createAgentStream: createAgentStreamMock,
}))

const mockAuthenticatedSession = {
  session: {
    id: "session-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    userId: "user-1",
    token: "token-123",
  },
  user: {
    id: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    email: "test@example.com",
    emailVerified: true,
    name: "Test User",
    role: "admin",
  },
}

const mockAssistantSession = {
  id: "sess-123",
  userId: "user-1",
  mode: "create_model" as const,
  currentModelId: null,
  currentStep: "initial",
  context: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("Model Assistant Agent Execution (Unified)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("create model flow", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )

      vi.mocked(auth.api.getSession).mockResolvedValue(mockAuthenticatedSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)
    })

    it("routes 'crear ventana corrediza' to the unified agent", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "sess-123",
          message: "crear una ventana corrediza 2 hojas con perfil Extralum",
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      expect(createAgentStreamMock).toHaveBeenCalledOnce()
      expect(createAgentStreamMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: "crear una ventana corrediza 2 hojas con perfil Extralum",
        }),
      )
    })
  })

  describe("calibrate model flow", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )

      vi.mocked(auth.api.getSession).mockResolvedValue(mockAuthenticatedSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue({
        ...mockAssistantSession,
        mode: "calibrate_model" as const,
        currentModelId: "model-123",
      })
    })

    it("routes 'calibrar modelo Europa' to the unified agent with correct context", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "sess-123",
          message: "calibrar el modelo Europa con precios de Rehau",
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      expect(createAgentStreamMock).toHaveBeenCalledOnce()
      expect(createAgentStreamMock).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionContext: expect.objectContaining({
            mode: "calibrate_model",
            currentModelId: "model-123",
          }),
        }),
      )
    })
  })

  describe("any message type", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )

      vi.mocked(auth.api.getSession).mockResolvedValue(mockAuthenticatedSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)
    })

    it("routes ambiguous message to unified agent", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "ayuda con ventanas" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      expect(createAgentStreamMock).toHaveBeenCalledOnce()
    })
  })
})
