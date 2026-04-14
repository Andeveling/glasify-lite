import { randomUUID } from "node:crypto"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { UIMessage } from "ai"
import { z } from "zod"
import logger from "@/lib/logger"
import {
  buildContextPrompt,
  createModelAssistantStreamText,
} from "@/server/ai/agents/model-assistant.executor"
import { auth } from "@/server/auth"
import {
  saveMessage,
  getMessagesBySession,
} from "@/server/services/model-assistant-message.service"
import { getModelAssistantSession } from "@/server/services/model-assistant-session.service"

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

    const userUiMessage =
      typeof parsed.data.message !== "string" && parsed.data.message
        ? (parsed.data.message as UIMessage)
        : undefined

    if (userUiMessage?.id) {
      void saveMessage(sessionId, userUiMessage).catch(() => {})
    }

    const sessionContext = {
      sessionId,
      mode: assistantSession.mode,
      currentStep: assistantSession.currentStep,
      currentModelId: assistantSession.currentModelId,
    }

    const result = createModelAssistantStreamText({
      userMessage: message,
      sessionContext,
    })

    logger.info("Model assistant message processed", {
      sessionId,
      assistantMode: assistantSession.mode,
      currentStep: assistantSession.currentStep,
      messageLength: message.length,
    })

    void Promise.resolve(result.text).then((text) =>
      saveMessage(sessionId, {
        id: randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text }],
      }).catch(() => {}),
    )

    return originalMessages?.length
      ? result.toUIMessageStreamResponse({ originalMessages })
      : result.toUIMessageStreamResponse()
  } catch (error) {
    logger.error("Error processing model assistant message", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al procesar el mensaje" }, { status: 500 })
  }
}
