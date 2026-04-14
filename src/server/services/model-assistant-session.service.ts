import { z } from "zod"
import { db } from "@/server/db"
import {
  parseModelAssistantSessionContext,
  serializeModelAssistantSessionContext,
} from "@/server/services/model-assistant.service"

export const ModelAssistantMode = {
  CREATE_MODEL: "create_model",
  CALIBRATE_MODEL: "calibrate_model",
  CREATE_QUOTE: "create_quote",
} as const

export type ModelAssistantMode = (typeof ModelAssistantMode)[keyof typeof ModelAssistantMode]

export const modelAssistantSessionContextSchema = z.union([
  z.object({
    name: z.string(),
    designTemplateId: z.string(),
    profileSupplierId: z.string(),
    dimensions: z.object({
      minWidthMm: z.number(),
      maxWidthMm: z.number(),
      minHeightMm: z.number(),
      maxHeightMm: z.number(),
    }),
    glassTypeIds: z.array(z.string()),
  }),
  z.object({
    modelId: z.string(),
    supplierId: z.string(),
    barLengthMeters: z.number(),
    profiles: z.array(
      z.object({
        name: z.string(),
        meters: z.number(),
      }),
    ),
    accessories: z.array(
      z.object({
        name: z.string(),
        quantity: z.number(),
      }),
    ),
  }),
])

export type ModelAssistantSessionContext = z.infer<typeof modelAssistantSessionContextSchema>

export type CreateSessionInput = {
  userId: string
  mode: ModelAssistantMode
  currentModelId?: string
  currentStep?: string
  context?: ModelAssistantSessionContext
}

export type UpdateSessionInput = {
  sessionId: string
  currentModelId?: string
  currentStep?: string
  context?: ModelAssistantSessionContext
}

export async function createModelAssistantSession(
  input: CreateSessionInput,
): Promise<{ id: string }> {
  const session = await db.modelAssistantSession.create({
    data: {
      userId: input.userId,
      mode: input.mode,
      currentModelId: input.currentModelId,
      currentStep: input.currentStep ?? "initial",
      contextJson: input.context ? serializeModelAssistantSessionContext(input.context) : "{}",
    },
  })

  return { id: session.id }
}

export async function getModelAssistantSession(sessionId: string) {
  const session = await db.modelAssistantSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    return null
  }

  return {
    id: session.id,
    userId: session.userId,
    mode: session.mode as ModelAssistantMode,
    currentModelId: session.currentModelId,
    currentStep: session.currentStep,
    context: session.contextJson ? parseModelAssistantSessionContext(session.contextJson) : null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}

export async function updateModelAssistantSession(input: UpdateSessionInput) {
  const updateData: {
    currentModelId?: string
    currentStep?: string
    contextJson?: string
  } = {}

  if (input.currentModelId !== undefined) {
    updateData.currentModelId = input.currentModelId
  }

  if (input.currentStep !== undefined) {
    updateData.currentStep = input.currentStep
  }

  if (input.context !== undefined) {
    updateData.contextJson = serializeModelAssistantSessionContext(input.context)
  }

  const session = await db.modelAssistantSession.update({
    where: { id: input.sessionId },
    data: updateData,
  })

  return {
    id: session.id,
    userId: session.userId,
    mode: session.mode as ModelAssistantMode,
    currentModelId: session.currentModelId,
    currentStep: session.currentStep,
    context: session.contextJson ? parseModelAssistantSessionContext(session.contextJson) : null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}

export async function deleteModelAssistantSession(sessionId: string) {
  await db.modelAssistantSession.delete({
    where: { id: sessionId },
  })
}
