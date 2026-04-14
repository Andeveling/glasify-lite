import { z } from "zod"
import { db } from "@/server/db"

export const ModelAssistantMode = {
  CREATE_MODEL: "create_model",
  CALIBRATE_MODEL: "calibrate_model",
  CREATE_QUOTE: "create_quote",
} as const

export type ModelAssistantMode = (typeof ModelAssistantMode)[keyof typeof ModelAssistantMode]

const sessionDimensionsSchema = z.object({
  minWidthMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  maxHeightMm: z.number(),
})

const sessionProfileSchema = z.object({
  name: z.string(),
  meters: z.number(),
})

const sessionAccessorySchema = z.object({
  name: z.string(),
  quantity: z.number(),
})

export const modelAssistantSessionContextSchema = z
  .object({
    name: z.string().optional(),
    designTemplateId: z.string().optional(),
    profileSupplierId: z.string().optional(),
    dimensions: sessionDimensionsSchema.optional(),
    glassTypeIds: z.array(z.string()).optional(),
    modelId: z.string().optional(),
    supplierId: z.string().optional(),
    barLengthMeters: z.number().optional(),
    profiles: z.array(sessionProfileSchema).optional(),
    accessories: z.array(sessionAccessorySchema).optional(),
  })
  .passthrough()

export type ModelAssistantSessionContext = z.infer<typeof modelAssistantSessionContextSchema>

function serializeModelAssistantSessionContext(context: ModelAssistantSessionContext): string {
  return JSON.stringify(context)
}

function parseModelAssistantSessionContext(value: string): ModelAssistantSessionContext | null {
  try {
    const parsed = JSON.parse(value) as unknown

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      Object.keys(parsed).length === 0
    ) {
      return null
    }

    const result = modelAssistantSessionContextSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

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
    context: parseModelAssistantSessionContext(session.contextJson),
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
    context: parseModelAssistantSessionContext(session.contextJson),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}

export async function listModelAssistantSessionsByUser(userId: string) {
  const sessions = await db.modelAssistantSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      mode: true,
      currentStep: true,
      currentModelId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return sessions.map((s) => ({
    id: s.id,
    mode: s.mode as ModelAssistantMode,
    currentStep: s.currentStep,
    currentModelId: s.currentModelId,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }))
}

export async function deleteModelAssistantSession(sessionId: string) {
  await db.modelAssistantSession.delete({
    where: { id: sessionId },
  })
}
