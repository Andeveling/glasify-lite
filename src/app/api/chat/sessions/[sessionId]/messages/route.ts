import { randomUUID } from "node:crypto"
import type { UIMessage } from "ai"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import logger from "@/lib/logger"
import { createAgentStream } from "@/server/ai/agents/model-assistant.agents"
import { modelCreationTools } from "@/server/ai/agents/model-assistant.tools"
import { auth } from "@/server/auth"
import {
  getMessagesBySession,
  saveMessage,
} from "@/server/services/model-assistant-message.service"
import {
  getModelAssistantSession,
  updateModelAssistantSession,
} from "@/server/services/model-assistant-session.service"

const uiMessageSchema = z
  .object({
    id: z.string().min(1).optional(),
    role: z.string().min(1),
    parts: z.array(z.object({ type: z.string() }).passthrough()),
  })
  .passthrough()

const sendMessageSchema = z
  .object({
    sessionId: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    message: z.union([z.string().min(1), uiMessageSchema]).optional(),
    messages: z.array(uiMessageSchema).optional(),
    trigger: z.string().optional(),
    messageId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.sessionId && !value.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sessionId"],
        message: "sessionId o id es requerido",
      })
    }

    if (!value.message && (!value.messages || value.messages.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message: "message o messages es requerido",
      })
    }
  })

function extractTextFromUIMessage(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text",
    )
    .map((part) => part.text)
    .join("\n")
    .trim()
}

function extractLatestUserMessageText(messages: UIMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")
  return latestUserMessage ? extractTextFromUIMessage(latestUserMessage) : ""
}

type RouteParams = { params: Promise<{ sessionId: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { sessionId } = await params
    const messages = await getMessagesBySession(sessionId)

    return NextResponse.json({ messages })
  } catch (error) {
    logger.error("Error fetching model assistant messages", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al obtener los mensajes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const sessionId = parsed.data.sessionId ?? parsed.data.id

    if (!sessionId) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const originalMessages = parsed.data.messages as UIMessage[] | undefined
    const message =
      typeof parsed.data.message === "string"
        ? parsed.data.message
        : parsed.data.message
          ? extractTextFromUIMessage(parsed.data.message as UIMessage)
          : originalMessages
            ? extractLatestUserMessageText(originalMessages)
            : ""

    if (!message) {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 })
    }

    const assistantSession = await getModelAssistantSession(sessionId)
    if (!assistantSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    const sessionContext = {
      sessionId,
      mode: assistantSession.mode,
      currentStep: assistantSession.currentStep,
      currentModelId: assistantSession.currentModelId,
    }

    const userMessageId =
      typeof parsed.data.message !== "string" && parsed.data.message
        ? (parsed.data.message as UIMessage).id
        : undefined

    const result = createAgentStream({
      userMessage: message,
      sessionContext,
      tools: modelCreationTools,
    })

    logger.info("Model assistant message processed", {
      sessionId,
      assistantMode: assistantSession.mode,
      currentStep: assistantSession.currentStep,
      messageLength: message.length,
    })

    // Consume the stream fully to extract response text and session updates
    const [sessionUpdates, assistantText] = await Promise.all([
      result.waitForCompletion(),
      result.getFullText(),
    ])

    // Persist user message
    if (userMessageId) {
      void saveMessage(sessionId, {
        id: userMessageId,
        role: "user",
        parts: [{ type: "text", text: message }],
      }).catch((err) =>
        logger.error("Failed to persist user message", {
          error: err instanceof Error ? err.message : String(err),
        }),
      )
    }

    // Persist assistant response
    if (assistantText) {
      void saveMessage(sessionId, {
        id: randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: assistantText }],
      }).catch((err) =>
        logger.error("Failed to persist assistant message", {
          error: err instanceof Error ? err.message : String(err),
        }),
      )
    }

    if (
      sessionUpdates &&
      (sessionUpdates.currentStep || sessionUpdates.currentModelId || sessionUpdates.context)
    ) {
      await updateModelAssistantSession({ sessionId, ...sessionUpdates }).catch((err) =>
        logger.error("Failed to persist session updates", {
          error: err instanceof Error ? err.message : String(err),
        }),
      )
    }

    return result.streamResponse
  } catch (error) {
    logger.error("Error processing model assistant message", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al procesar el mensaje" }, { status: 500 })
  }
}
