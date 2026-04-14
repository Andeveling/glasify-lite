import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import logger from "@/lib/logger"
import { auth } from "@/server/auth"
import {
  createModelAssistantSession,
  listModelAssistantSessionsByUser,
  type ModelAssistantMode,
} from "@/server/services/model-assistant-session.service"

const createSessionSchema = z.object({
  userId: z.string().min(1),
  mode: z.enum(["create_model", "calibrate_model", "create_quote"]),
  currentModelId: z.string().optional(),
  currentStep: z.string().optional(),
})

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const sessions = await listModelAssistantSessionsByUser(session.user.id)

    return NextResponse.json({ sessions })
  } catch (error) {
    logger.error("Error listing model assistant sessions", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al listar las sesiones" }, { status: 500 })
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
    const parsed = createSessionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { userId, mode, currentModelId, currentStep } = parsed.data

    const result = await createModelAssistantSession({
      userId,
      mode: mode as (typeof ModelAssistantMode)[keyof typeof ModelAssistantMode],
      currentModelId,
      currentStep,
    })

    logger.info("Model assistant session created", {
      sessionId: result.id,
      userId,
      mode,
    })

    return NextResponse.json({ sessionId: result.id })
  } catch (error) {
    logger.error("Error creating model assistant session", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al crear la sesión" }, { status: 500 })
  }
}
