import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import logger from "@/lib/logger"
import { auth } from "@/server/auth"
import {
  deleteModelAssistantSession,
  getModelAssistantSession,
  modelAssistantSessionContextSchema,
  updateModelAssistantSession,
} from "@/server/services/model-assistant-session.service"

const updateSessionSchema = z.object({
  currentModelId: z.string().optional(),
  currentStep: z.string().optional(),
  context: modelAssistantSessionContextSchema.optional(),
})

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

    const result = await getModelAssistantSession(sessionId)

    if (!result) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error getting model assistant session", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al obtener la sesión" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { sessionId } = await params

    const existing = await getModelAssistantSession(sessionId)

    if (!existing) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Sin autorización" }, { status: 403 })
    }

    await deleteModelAssistantSession(sessionId)

    logger.info("Model assistant session deleted", { sessionId })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error("Error deleting model assistant session", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al eliminar la sesión" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { sessionId } = await params
    const body = await request.json()
    const parsed = updateSessionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { currentModelId, currentStep, context } = parsed.data

    const result = await updateModelAssistantSession({
      sessionId,
      currentModelId,
      currentStep,
      context,
    })

    logger.info("Model assistant session updated", {
      sessionId,
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error updating model assistant session", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al actualizar la sesión" }, { status: 500 })
  }
}
