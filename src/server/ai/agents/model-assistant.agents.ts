import { randomUUID } from "node:crypto"
import { type Agent, createAgentUIStreamResponse, ToolLoopAgent } from "ai"
import type { ModelCreationTools } from "@/server/ai/agents/model-assistant.tools"
import { createMinimaxProvider, getMinimaxModelId } from "@/server/ai/providers/minimax"

type SessionUpdates = {
  currentStep?: string
  currentModelId?: string
  context?: Partial<{
    name: string
    designTemplateId: string
    profileSupplierId: string
    dimensions: { minWidthMm: number; maxWidthMm: number; minHeightMm: number; maxHeightMm: number }
    glassTypeIds: string[]
    modelId: string
    supplierId: string
    barLengthMeters: number
    profiles: Array<{ name: string; meters: number }>
    accessories: Array<{ name: string; quantity: number }>
  }>
}

const ASSISTANT_INSTRUCTIONS = `You are Glasify Assistant, an AI helper for managing window and door models.

You can help with the following tasks — detect the user's intent from your message:

## Creating a new model
When the user wants to create a new window or door model from scratch:
1. Ask for the model name (e.g., "Ventana Corrediza 2 Hojas")
2. Ask for the design template (OX, XX, etc.) - use listDesignTemplates to show options
3. Ask for the profile supplier - use listProfileSuppliers to show options
4. Ask for dimensions (min/max width and height in mm)
5. Ask for compatible glass types - use listGlassTypes to show options
6. Ask for base price
7. Use createModel tool to create the model

## Calibrating an existing model
When the user wants to add or update pricing information on an existing model:
1. Identify which model to calibrate — use listModels to search, or ask the user
2. Ask for the profile supplier (if not in context)
3. Ask for the bar length in meters
4. Ask for profile costs (per meter)
5. Ask for accessories and their costs
6. Use updateModel to save the cost breakdown

## Cloning a model
When the user wants to copy a model for a different supplier, use cloneModel.

## Publishing a model
When the user wants to publish a draft model, use publishModel.

Be friendly and helpful. Ask one question at a time. Always confirm details before creating or modifying.`

export interface SessionContext {
  sessionId: string
  mode: string
  currentStep?: string | null
  currentModelId?: string | null
}

export function buildContextPrompt(userMessage: string, sessionContext?: SessionContext): string {
  if (!sessionContext) {
    return userMessage
  }

  const contextLines = [
    `[Session Context]` +
      ` session_id=${sessionContext.sessionId}` +
      ` mode=${sessionContext.mode}` +
      (sessionContext.currentStep ? ` current_step=${sessionContext.currentStep}` : "") +
      (sessionContext.currentModelId ? ` current_model_id=${sessionContext.currentModelId}` : ""),
    `(Use this context to continue the conversation naturally. Do not ask for information already provided.)`,
    "",
  ]

  return contextLines.join("\n") + userMessage
}

export function createModelAssistantAgent(tools: ModelCreationTools) {
  const provider = createMinimaxProvider()
  const modelId = getMinimaxModelId()

  return new ToolLoopAgent({
    model: provider.languageModel(modelId),
    instructions: ASSISTANT_INSTRUCTIONS,
    tools,
  })
}

export function extractSessionUpdates(
  results: Map<string, { name: string; output: unknown }>,
): SessionUpdates {
  const updates: SessionUpdates = {}

  for (const [, entry] of results) {
    if (entry.name === "createModel" && typeof entry.output === "object" && entry.output !== null) {
      const output = entry.output as { id?: string }
      if (output.id) {
        updates.currentModelId = output.id
      }
    }
    if (entry.name === "publishModel") {
      updates.currentStep = "published"
    }
  }

  return updates
}

type AssistantMessageCapture = {
  text: string
}

export function createAgentStream(opts: {
  userMessage: string
  sessionContext?: SessionContext
  tools: ModelCreationTools
}): {
  streamResponse: Response
  waitForCompletion: () => Promise<SessionUpdates & { assistantMessage?: AssistantMessageCapture }>
} {
  const { userMessage, sessionContext, tools } = opts
  const augmentedPrompt = buildContextPrompt(userMessage, sessionContext)
  const agent = createModelAssistantAgent(tools)

  const toolResultsMap = new Map<string, { name: string; output: unknown }>()
  let finalAssistantText = ""

  const streamResponse = createAgentUIStreamResponse({
    agent: agent as unknown as Agent,
    uiMessages: [
      {
        id: randomUUID(),
        role: "user",
        parts: [{ type: "text" as const, text: augmentedPrompt }],
      },
    ],
    onStepFinish: ({ toolResults, text, finishReason }) => {
      for (const tr of toolResults) {
        toolResultsMap.set(tr.toolName, { name: tr.toolName, output: tr.output })
      }
      if (finishReason === "stop" && text) {
        finalAssistantText = text
      }
    },
  })

  return {
    streamResponse: streamResponse as unknown as Response,
    waitForCompletion: () => {
      const sessionUpdates = extractSessionUpdates(toolResultsMap)
      return Promise.resolve({
        ...sessionUpdates,
        assistantMessage: finalAssistantText ? { text: finalAssistantText } : undefined,
      })
    },
  }
}

export type { SessionUpdates }
