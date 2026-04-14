import { streamText } from "ai"
import { modelCreationTools } from "@/server/ai/agents/model-assistant.tools"
import { createMinimaxProvider, getMinimaxModelId } from "@/server/ai/providers/minimax"

export interface SessionContext {
  sessionId: string
  mode: string
  currentStep?: string | null
  currentModelId?: string | null
}

const ASSISTANT_INSTRUCTIONS = `You are Glasify Assistant, an AI helper for managing window and door models.

You can help with the following tasks — detect the user's intent from their message:

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

interface StreamTextOptions {
  userMessage: string
  sessionContext?: SessionContext
}

export function createModelAssistantStreamText({ userMessage, sessionContext }: StreamTextOptions) {
  const provider = createMinimaxProvider()
  const modelId = getMinimaxModelId()
  const augmentedPrompt = buildContextPrompt(userMessage, sessionContext)

  return streamText({
    model: provider.languageModel(modelId),
    system: ASSISTANT_INSTRUCTIONS,
    prompt: augmentedPrompt,
    tools: modelCreationTools,
  })
}
