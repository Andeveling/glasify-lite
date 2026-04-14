import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import logger from "@/lib/logger"
import { getModeExecutor, isExecutableMode } from "@/server/ai/agents/model-assistant.executor"
import type { RoutedIntent } from "@/server/ai/agents/model-assistant.router"
import { IntentMode, isConfident, routeIntent } from "@/server/ai/agents/model-assistant.router"
import { auth } from "@/server/auth"
import { getModelAssistantSession } from "@/server/services/model-assistant-session.service"

const sendMessageSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1),
})

const CREATE_QUOTE_STUB = {
  message:
    "La función de cotización asistida aún no está disponible. Puedo ayudarte a crear o calibrar el modelo primero.",
  mode: IntentMode.CREATE_QUOTE,
}

function getDisambiguationResponse() {
  return {
    message:
      "Para ayudarte mejor, necesito saber si quieres crear un modelo nuevo o calibrar uno existente. ¿Qué te gustaría hacer?",
    mode: "unknown" as const,
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

    const { sessionId, message } = parsed.data

    const assistantSession = await getModelAssistantSession(sessionId)
    if (!assistantSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    const intent = await routeIntent(message)

    let response: { response: string; mode: string; intent: { mode: string; confidence: number } }

    if (!isConfident(intent)) {
      const disambiguation = getDisambiguationResponse()
      response = {
        response: disambiguation.message,
        mode: disambiguation.mode,
        intent: {
          mode: intent.mode,
          confidence: intent.confidence,
        },
      }
    } else if (!isExecutableMode(intent.mode)) {
      response = {
        response: CREATE_QUOTE_STUB.message,
        mode: intent.mode,
        intent: {
          mode: intent.mode,
          confidence: intent.confidence,
        },
      }
    } else {
      const executor = getModeExecutor(intent.mode)
      response = await executor.execute(message, intent, {
        sessionId,
        mode: assistantSession.mode,
        currentStep: assistantSession.currentStep,
        currentModelId: assistantSession.currentModelId,
      })
    }

    logger.info("Model assistant message processed", {
      sessionId,
      assistantMode: assistantSession.mode,
      currentStep: assistantSession.currentStep,
      messageLength: message.length,
      intentMode: intent.mode,
      confidence: intent.confidence,
    })

    return NextResponse.json({
      response: response.response,
      mode: response.mode,
      intent: response.intent,
    })
  } catch (error) {
    logger.error("Error processing model assistant message", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al procesar el mensaje" }, { status: 500 })
  }
}
