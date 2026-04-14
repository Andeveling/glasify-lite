import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { routeIntent, isConfident, IntentMode } from "@/server/ai/agents/model-assistant.router"
import type { RoutedIntent } from "@/server/ai/agents/model-assistant.router"

vi.mock("@/server/ai/agents/model-assistant.router", () => ({
  routeIntent: vi.fn(),
  isConfident: vi.fn(),
  IntentMode: {
    CREATE_MODEL: "create_model",
    CALIBRATE_MODEL: "calibrate_model",
    CREATE_QUOTE: "create_quote",
  },
}))

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
  updateModelAssistantSession: vi.fn(),
  createModelAssistantSession: vi.fn(),
  deleteModelAssistantSession: vi.fn(),
  ModelAssistantMode: {
    CREATE_MODEL: "create_model",
    CALIBRATE_MODEL: "calibrate_model",
    CREATE_QUOTE: "create_quote",
  },
}))

const {
  createModelCreationStreamText,
  createModelCalibrationStreamText,
  createQuoteStreamText,
  createStreamTextResult,
  mockToUIMessageStreamResponse,
} = vi.hoisted(() => {
  const mockToUIMessageStreamResponse = vi.fn(() => new Response())

  const createMockResult = (text) => {
    const inner = { text }
    return {
      text,
      toUIMessageStreamResponse: mockToUIMessageStreamResponse,
      then: (resolve) => resolve(inner),
      catch: () => inner,
      finally: () => inner,
    }
  }

  return {
    createModelCreationStreamText: vi.fn(() => createMockResult("AI response")),
    createModelCalibrationStreamText: vi.fn(() => createMockResult("AI response calibrate")),
    createQuoteStreamText: vi.fn(() => createMockResult("AI response quote")),
    createStreamTextResult: vi.fn(() => createMockResult("disambiguation text")),
    mockToUIMessageStreamResponse,
  }
})

vi.mock("@/server/ai/agents/model-assistant.executor", () => ({
  getModeExecutor: vi.fn(),
  isExecutableMode: vi.fn(),
  createModelCreationStreamText,
  createModelCalibrationStreamText,
  createQuoteStreamText,
  createStreamTextResult,
}))

vi.mock("@/server/ai/providers/minimax", () => ({
  createMinimaxProvider: vi.fn().mockReturnValue({
    languageModel: vi.fn().mockReturnValue({}),
  }),
  getMinimaxModelId: vi.fn().mockReturnValue("minimax-model"),
}))

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

  describe("intent routing", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { getModeExecutor, isExecutableMode } = await import("@/server/ai/agents/model-assistant.executor")

      vi.mocked(auth.api.getSession).mockResolvedValue({
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
      })
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)
      vi.mocked(isExecutableMode).mockReturnValue(true)
      vi.mocked(getModeExecutor).mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          response: "AI response",
          mode: "create_model",
          intent: { mode: "create_model", confidence: 0.92 },
        }),
      })

      createModelCreationStreamText.mockClear()
      createModelCalibrationStreamText.mockClear()
      createQuoteStreamText.mockClear()
    })

    it("returns disambiguation response for low confidence intent", async () => {
      const lowConfidenceIntent: RoutedIntent = {
        mode: IntentMode.CREATE_MODEL,
        confidence: 0.4,
      }

      vi.mocked(routeIntent).mockResolvedValue(lowConfidenceIntent)
      vi.mocked(isConfident).mockReturnValue(false)

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "ayuda con ventanas" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.response).toContain("necesito saber")
      expect(data.mode).toBe("unknown")
    })

    it("returns create_model stub for high confidence create_model intent", async () => {
      const createModelIntent: RoutedIntent = {
        mode: IntentMode.CREATE_MODEL,
        confidence: 0.92,
      }

      vi.mocked(routeIntent).mockResolvedValue(createModelIntent)
      vi.mocked(isConfident).mockReturnValue(true)

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "crear una ventana corrediza 2 hojas" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.response).toContain("AI response")
      expect(data.mode).toBe("create_model")
      expect(data.intent.mode).toBe("create_model")
      expect(data.intent.confidence).toBe(0.92)
    })

    it("returns calibrate_model stub for high confidence calibrate_model intent", async () => {
      const calibrateIntent: RoutedIntent = {
        mode: IntentMode.CALIBRATE_MODEL,
        confidence: 0.88,
      }

      vi.mocked(routeIntent).mockResolvedValue(calibrateIntent)
      vi.mocked(isConfident).mockReturnValue(true)

      const { getModeExecutor } = await import("@/server/ai/agents/model-assistant.executor")
      vi.mocked(getModeExecutor).mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          response: "AI response calibrate",
          mode: "calibrate_model",
          intent: { mode: "calibrate_model", confidence: 0.88 },
        }),
      })

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "calibrar el modelo VC Panama" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.response).toContain("AI response calibrate")
      expect(data.mode).toBe("calibrate_model")
      expect(data.intent.mode).toBe("calibrate_model")
      expect(data.intent.confidence).toBe(0.88)
    })

    it("returns create_quote streaming response for high confidence create_quote intent", async () => {
      const quoteIntent: RoutedIntent = {
        mode: IntentMode.CREATE_QUOTE,
        confidence: 0.85,
      }

      vi.mocked(routeIntent).mockResolvedValue(quoteIntent)
      vi.mocked(isConfident).mockReturnValue(true)

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId: "sess-123", message: "cotizame 10 ventanas VC Panama" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.response).toContain("AI response quote")
      expect(data.mode).toBe("create_quote")
      expect(data.intent.mode).toBe("create_quote")
      expect(data.intent.confidence).toBe(0.85)
    })
  })

  describe("SSE streaming", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import(
        "@/server/services/model-assistant-session.service"
      )

      vi.mocked(auth.api.getSession).mockResolvedValue({
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
      })
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)

      createModelCreationStreamText.mockClear()
      createModelCalibrationStreamText.mockClear()
      createQuoteStreamText.mockClear()
      createStreamTextResult.mockClear()
      mockToUIMessageStreamResponse.mockClear()
    })

    it("calls toUIMessageStreamResponse for create_model when Accept: text/event-stream", async () => {
      vi.mocked(routeIntent).mockResolvedValue({
        mode: IntentMode.CREATE_MODEL,
        confidence: 0.92,
      })
      vi.mocked(isConfident).mockReturnValue(true)

      const { POST } = await import(
        "@/app/api/chat/sessions/[sessionId]/messages/route"
      )

      const request = new NextRequest(
        "http://localhost/api/chat/sessions/sess-123/messages",
        {
          method: "POST",
          body: JSON.stringify({ sessionId: "sess-123", message: "crear ventana corrediza" }),
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        },
      )

      const response = await POST(request)

      expect(createModelCreationStreamText).toHaveBeenCalledOnce()
      expect(mockToUIMessageStreamResponse).toHaveBeenCalledOnce()
      expect(response.status).toBe(200)
    })

    it("calls toUIMessageStreamResponse for calibrate_model when Accept: text/event-stream", async () => {
      vi.mocked(routeIntent).mockResolvedValue({
        mode: IntentMode.CALIBRATE_MODEL,
        confidence: 0.88,
      })
      vi.mocked(isConfident).mockReturnValue(true)

      const { POST } = await import(
        "@/app/api/chat/sessions/[sessionId]/messages/route"
      )

      const request = new NextRequest(
        "http://localhost/api/chat/sessions/sess-123/messages",
        {
          method: "POST",
          body: JSON.stringify({ sessionId: "sess-123", message: "calibrar VC Panama" }),
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        },
      )

      const response = await POST(request)

      expect(createModelCalibrationStreamText).toHaveBeenCalledOnce()
      expect(mockToUIMessageStreamResponse).toHaveBeenCalledOnce()
      expect(response.status).toBe(200)
    })

    it("calls toUIMessageStreamResponse for create_quote when Accept: text/event-stream", async () => {
      vi.mocked(routeIntent).mockResolvedValue({
        mode: IntentMode.CREATE_QUOTE,
        confidence: 0.85,
      })
      vi.mocked(isConfident).mockReturnValue(true)

      const { POST } = await import(
        "@/app/api/chat/sessions/[sessionId]/messages/route"
      )

      const request = new NextRequest(
        "http://localhost/api/chat/sessions/sess-123/messages",
        {
          method: "POST",
          body: JSON.stringify({ sessionId: "sess-123", message: "cotizame 10 ventanas VC Panama" }),
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        },
      )

      const response = await POST(request)

      expect(createQuoteStreamText).toHaveBeenCalledOnce()
      expect(mockToUIMessageStreamResponse).toHaveBeenCalledOnce()
      expect(response.status).toBe(200)
    })

    it("calls toUIMessageStreamResponse for disambiguation when low confidence with Accept: text/event-stream", async () => {
      vi.mocked(routeIntent).mockResolvedValue({
        mode: IntentMode.CREATE_MODEL,
        confidence: 0.3,
      })
      vi.mocked(isConfident).mockReturnValue(false)

      const { POST } = await import(
        "@/app/api/chat/sessions/[sessionId]/messages/route"
      )

      const request = new NextRequest(
        "http://localhost/api/chat/sessions/sess-123/messages",
        {
          method: "POST",
          body: JSON.stringify({ sessionId: "sess-123", message: "ayuda" }),
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        },
      )

      const response = await POST(request)

      expect(createStreamTextResult).toHaveBeenCalledOnce()
      expect(mockToUIMessageStreamResponse).toHaveBeenCalledOnce()
      expect(response.status).toBe(200)
    })

    it("does NOT call toUIMessageStreamResponse when Accept header is absent", async () => {
      vi.mocked(routeIntent).mockResolvedValue({
        mode: IntentMode.CREATE_MODEL,
        confidence: 0.92,
      })
      vi.mocked(isConfident).mockReturnValue(true)

      const { POST } = await import(
        "@/app/api/chat/sessions/[sessionId]/messages/route"
      )

      const request = new NextRequest(
        "http://localhost/api/chat/sessions/sess-123/messages",
        {
          method: "POST",
          body: JSON.stringify({ sessionId: "sess-123", message: "crear ventana" }),
          headers: { "Content-Type": "application/json" },
        },
      )

      const response = await POST(request)

      expect(mockToUIMessageStreamResponse).not.toHaveBeenCalled()
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.response).toContain("AI response")
    })
  })

  describe("validation", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")
      const { getModeExecutor, isExecutableMode } = await import("@/server/ai/agents/model-assistant.executor")

      vi.mocked(auth.api.getSession).mockResolvedValue({
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
      })
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)
      vi.mocked(isExecutableMode).mockReturnValue(true)
      vi.mocked(getModeExecutor).mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          response: "AI response",
          mode: "create_model",
          intent: { mode: "create_model", confidence: 0.92 },
        }),
      })
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
  })
})