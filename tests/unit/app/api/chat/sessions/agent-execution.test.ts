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

vi.mock("@/server/ai/tools/model-tools", () => ({
  getModelTools: vi.fn(),
  MODEL_TOOL_NAMES: {
    CREATE_MODEL: "create_model",
    UPDATE_MODEL: "update_model",
    CLONE_MODEL: "clone_model",
    PUBLISH_MODEL: "publish_model",
    LIST_MODELS: "list_models",
    GET_MODEL: "get_model",
  },
  createModelTool: vi.fn(),
  listModelsTool: vi.fn(),
  getModelTool: vi.fn(),
}))

vi.mock("@/server/ai/tools/catalog-tools", () => ({
  getCatalogTools: vi.fn(),
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

const {
  createModelCreationStreamText,
  createModelCalibrationStreamText,
  createQuoteStreamText,
} = vi.hoisted(() => {
  const createMockResult = (text) => {
    const result = { text, toUIMessageStreamResponse: () => new Response() }
    return {
      then: (resolve) => resolve(result),
      catch: () => result,
      finally: () => result,
    }
  }

  return {
    createModelCreationStreamText: vi.fn(() => createMockResult("Voy a ayudarte a crear el modelo")),
    createModelCalibrationStreamText: vi.fn(() => createMockResult("Voy a ayudarte a calibrar el modelo")),
    createQuoteStreamText: vi.fn(() => createMockResult("Voy a ayudarte a crear la cotización")),
  }
})

vi.mock("@/server/ai/agents/model-assistant.executor", () => ({
  getModeExecutor: vi.fn(),
  isExecutableMode: vi.fn(),
  createModelCreationStreamText,
  createModelCalibrationStreamText,
  createQuoteStreamText,
  createStreamTextResult: vi.fn(),
}))

const mockSession = {
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

describe("Model Assistant Agent Execution", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("create_model mode", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)
      createModelCreationStreamText.mockClear()
    })

    it("should execute create_model agent with user message", async () => {
      const { routeIntent, isConfident, IntentMode } = await import("@/server/ai/agents/model-assistant.router")

      const intent: RoutedIntent = {
        mode: IntentMode.CREATE_MODEL,
        confidence: 0.92,
      }
      vi.mocked(routeIntent).mockResolvedValue(intent)
      vi.mocked(isConfident).mockReturnValue(true)

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
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.mode).toBe("create_model")
      expect(data.intent.mode).toBe("create_model")
      expect(data.intent.confidence).toBe(0.92)
      expect(data.response).toBeDefined()
      expect(typeof data.response).toBe("string")
      expect(data.response.length).toBeGreaterThan(0)
    })
  })

  describe("calibrate_model mode", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue({
        ...mockAssistantSession,
        mode: "calibrate_model" as const,
        currentModelId: "model-123",
      })
      createModelCalibrationStreamText.mockClear()
    })

    it("should execute calibrate_model agent with user message", async () => {
      const { routeIntent, isConfident, IntentMode } = await import("@/server/ai/agents/model-assistant.router")

      const intent: RoutedIntent = {
        mode: IntentMode.CALIBRATE_MODEL,
        confidence: 0.88,
      }
      vi.mocked(routeIntent).mockResolvedValue(intent)
      vi.mocked(isConfident).mockReturnValue(true)

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
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.mode).toBe("calibrate_model")
      expect(data.intent.mode).toBe("calibrate_model")
      expect(data.intent.confidence).toBe(0.88)
      expect(data.response).toBeDefined()
      expect(typeof data.response).toBe("string")
      expect(data.response.length).toBeGreaterThan(0)
    })
  })

  describe("create_quote mode (streaming)", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue({
        ...mockAssistantSession,
        mode: "create_quote" as const,
      })
      createQuoteStreamText.mockClear()
    })

    it("should execute create_quote agent via streaming", async () => {
      const { routeIntent, isConfident, IntentMode } = await import("@/server/ai/agents/model-assistant.router")

      const intent: RoutedIntent = {
        mode: IntentMode.CREATE_QUOTE,
        confidence: 0.85,
      }
      vi.mocked(routeIntent).mockResolvedValue(intent)
      vi.mocked(isConfident).mockReturnValue(true)

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "sess-123",
          message: "cotizame 10 ventanas VC Panama",
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.mode).toBe("create_quote")
      expect(data.response).toContain("cotización")
    })
  })

  describe("disambiguation", () => {
    beforeEach(async () => {
      const { auth } = await import("@/server/auth")
      const { getModelAssistantSession } = await import("@/server/services/model-assistant-session.service")

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(getModelAssistantSession).mockResolvedValue(mockAssistantSession)
    })

    it("should ask for clarification on low confidence", async () => {
      const { routeIntent, isConfident, IntentMode } = await import("@/server/ai/agents/model-assistant.router")

      const intent: RoutedIntent = {
        mode: IntentMode.CREATE_MODEL,
        confidence: 0.4,
      }
      vi.mocked(routeIntent).mockResolvedValue(intent)
      vi.mocked(isConfident).mockReturnValue(false)

      const { POST } = await import("@/app/api/chat/sessions/[sessionId]/messages/route")

      const mockRequest = new NextRequest("http://localhost/api/chat/sessions/sess-123/messages", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "sess-123",
          message: "ayuda con ventanas",
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.mode).toBe("unknown")
      expect(data.response).toContain("necesito saber")
    })
  })
})