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
  updateModelAssistantSession: vi.fn().mockResolvedValue({ id: "sess-123" }),
}))

vi.mock("@/server/services/model-assistant-message.service", () => ({
  getMessagesBySession: vi.fn().mockResolvedValue([]),
  saveMessage: vi.fn().mockResolvedValue(undefined),
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

vi.mock("@/server/ai/providers/minimax", () => ({
  createMinimaxProvider: vi.fn().mockReturnValue({
    languageModel: vi.fn().mockReturnValue({}),
  }),
  getMinimaxModelId: vi.fn().mockReturnValue("minimax-model"),
}))

vi.mock("@/server/ai/agents/model-assistant.tools", () => ({
  modelCreationTools: [],
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

describe("POST /api/chat/sessions/[sessionId]/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("authentication", () => {
    it("returns 401 when not authenticated", async () => {
      const { auth } = await import("@/server/auth")
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "hola" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe("No autenticado")
    })
  })

  describe("streaming response", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )

      vi.mocked(auth.api.getSession).mockResolvedValue(mockAuthenticatedSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)

      createAgentStreamMock.mockClear()
    })

    it("calls createAgentStream with the user message and session context", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "crear una ventana corrediza" }),
        headers: { "Content-Type": "application/json" },
      })

      await POST(mockRequest)

      expect(createAgentStreamMock).toHaveBeenCalledOnce()
      expect(createAgentStreamMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: "crear una ventana corrediza",
          sessionContext: expect.objectContaining({
            sessionId: "sess-123",
            mode: "create_model",
          }),
        }),
      )
    })

    it("returns 200 on successful stream", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "calibrar el modelo VC Panama" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
    })

    it("uses session context with currentModelId when set", async () => {
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )
      vi.mocked(getModelAssistantSession).mockResolvedValue({
        ...mockAssistantSession,
        mode: "calibrate_model" as const,
        currentModelId: "model-abc",
        currentStep: "pricing",
      })

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "el costo es 50 por metro" }),
        headers: { "Content-Type": "application/json" },
      })

      await POST(mockRequest)

      expect(createAgentStreamMock).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionContext: expect.objectContaining({
            mode: "calibrate_model",
            currentModelId: "model-abc",
            currentStep: "pricing",
          }),
        }),
      )
    })

    it("calls updateModelAssistantSession with sessionUpdates when agent resolves them", async () => {
      const { updateModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )

      const sessionUpdates = {
        currentStep: "model_created",
        currentModelId: "model-abc",
      }
      createAgentStreamMock.mockReturnValueOnce({
        streamResponse: new Response(),
        waitForCompletion: vi.fn().mockResolvedValue(sessionUpdates),
      })

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "crear el modelo" }),
        headers: { "Content-Type": "application/json" },
      })

      await POST(mockRequest)

      expect(updateModelAssistantSession).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "sess-123",
          currentStep: "model_created",
          currentModelId: "model-abc",
        }),
      )
    })
  })

  describe("validation", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )

      vi.mocked(auth.api.getSession).mockResolvedValue(mockAuthenticatedSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)
    })

    it("returns 400 when sessionId is missing", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ message: "hola" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Datos inválidos")
    })

    it("returns 400 when message is missing", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Datos inválidos")
    })

    it("returns 400 when sessionId is empty string", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "", message: "hola" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it("returns 400 when message is empty string", async () => {
      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it("returns 404 when assistant session does not exist", async () => {
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )
      vi.mocked(getModelAssistantSession).mockResolvedValue(null)

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-999/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-999", message: "hola" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(404)
    })
  })
})
