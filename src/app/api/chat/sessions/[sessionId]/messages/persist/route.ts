import type { UIMessage } from "ai"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import logger from "@/lib/logger"
import { auth } from "@/server/auth"
import { saveMessage } from "@/server/services/model-assistant-message.service"

const persistMessageSchema = z.object({
  message: z.object({
    id: z.string().min(1),
    role: z.enum(["user", "assistant", "system"]),
    parts: z.array(z.object({ type: z.string() }).passthrough()),
  }),
})

type RouteParams = { params: Promise<{ sessionId: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { sessionId } = await params

    const body = await request.json()
    const parsed = persistMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const message: UIMessage = {
      id: parsed.data.message.id,
      role: parsed.data.message.role,
      parts: parsed.data.message.parts as UIMessage["parts"],
    }

    await saveMessage(sessionId, message)

    logger.info("Message persisted via persist endpoint", {
      sessionId,
      messageId: parsed.data.message.id,
      role: parsed.data.message.role,
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error("Error persisting message", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json({ error: "Error al persistir el mensaje" }, { status: 500 })
  }
}
