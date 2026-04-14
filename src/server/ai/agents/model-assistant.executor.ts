import { streamText } from "ai"
import {
  createModelCalibrationAgent,
  createModelCreationAgent,
} from "@/server/ai/agents/model-assistant.agents"
import type { RoutedIntent } from "@/server/ai/agents/model-assistant.router"
import { IntentMode } from "@/server/ai/agents/model-assistant.router"
import { modelCalibrationTools, modelCreationTools } from "@/server/ai/agents/model-assistant.tools"
import { createMinimaxProvider, getMinimaxModelId } from "@/server/ai/providers/minimax"

export interface ModeExecutorResult {
  response: string
  mode: string
  intent: {
    mode: string
    confidence: number
  }
}

export interface ModeExecutor {
  execute(
    userMessage: string,
    intent: RoutedIntent,
    sessionContext?: SessionContext,
  ): Promise<ModeExecutorResult>
}

export interface SessionContext {
  sessionId: string
  mode: string
  currentStep?: string | null
  currentModelId?: string | null
}

const MODEL_CREATION_INSTRUCTIONS = `You are Glasify Assistant, an AI helper for creating window and door models.

Your task is to guide the user through creating a new window model step by step.

Follow these steps:
1. Ask for the model name (e.g., "Ventana Corrediza 2 Hojas")
2. Ask for the design template (OX, XX, etc.) - use listDesignTemplates to show options
3. Ask for the profile supplier - use listProfileSuppliers to show options
4. Ask for dimensions (min/max width and height in mm)
5. Ask for compatible glass types - use listGlassTypes to show options
6. Ask for base price
7. Use createModel tool to create the model

Be friendly and helpful. Ask one question at a time. Always confirm details before creating.`

const MODEL_CALIBRATION_INSTRUCTIONS = `You are Glasify Assistant, an AI helper for calibrating window models with supplier-specific pricing.

Your task is to guide the user through adding pricing information to an existing model.

Follow these steps:
1. Ask which model to calibrate (or look up from session context)
2. Ask for the profile supplier (if not in context)
3. Ask for the bar length in meters
4. Ask for profile costs (per meter)
5. Ask for accessories and their costs
6. Use the appropriate tools to update the model's cost breakdown

Be friendly and helpful. Ask one question at a time.`

export function buildContextPrompt(userMessage: string, sessionContext?: SessionContext): string {
  if (!sessionContext) {
    return userMessage
  }

  const contextLines = [
    `[Session Context]` +
      ` session_id=${sessionContext.sessionId}` +
      ` mode=${sessionContext.mode}` +
      (sessionContext.currentStep ? ` current_step=${sessionContext.currentStep}` : ""),
    `(Use this context to continue the conversation naturally. Do not ask for information already provided.)`,
    "",
  ]

  return contextLines.join("\n") + userMessage
}

function createModelCreationExecutor(): ModeExecutor {
  const agent = createModelCreationAgent(modelCreationTools)

  return {
    async execute(userMessage, intent, sessionContext) {
      const augmentedPrompt = buildContextPrompt(userMessage, sessionContext)
      const result = await agent.generate({
        prompt: augmentedPrompt,
      })

      return {
        response: result.text,
        mode: intent.mode,
        intent: {
          mode: intent.mode,
          confidence: intent.confidence,
        },
      }
    },
  }
}

function createModelCalibrationExecutor(): ModeExecutor {
  const agent = createModelCalibrationAgent(modelCalibrationTools)

  return {
    async execute(userMessage, intent, sessionContext) {
      const augmentedPrompt = buildContextPrompt(userMessage, sessionContext)
      const result = await agent.generate({
        prompt: augmentedPrompt,
      })

      return {
        response: result.text,
        mode: intent.mode,
        intent: {
          mode: intent.mode,
          confidence: intent.confidence,
        },
      }
    },
  }
}

export function getModeExecutor(mode: IntentMode): ModeExecutor {
  switch (mode) {
    case IntentMode.CREATE_MODEL:
      return createModelCreationExecutor()
    case IntentMode.CALIBRATE_MODEL:
      return createModelCalibrationExecutor()
    case IntentMode.CREATE_QUOTE:
      return createQuoteExecutor()
    default:
      throw new Error(`Unknown mode: ${mode}`)
  }
}

function createQuoteExecutor(): ModeExecutor {
  return {
    async execute(userMessage, intent, sessionContext) {
      return {
        response:
          "La función de cotización asistida aún no está disponible. Puedo ayudarte a crear o calibrar el modelo primero.",
        mode: IntentMode.CREATE_QUOTE,
        intent: {
          mode: intent.mode,
          confidence: intent.confidence,
        },
      }
    },
  }
}

export function isExecutableMode(mode: string): boolean {
  return (
    mode === IntentMode.CREATE_MODEL ||
    mode === IntentMode.CALIBRATE_MODEL ||
    mode === IntentMode.CREATE_QUOTE
  )
}

function getProviderAndModel() {
  const provider = createMinimaxProvider()
  const modelId = getMinimaxModelId()
  return { provider, modelId }
}

interface StreamTextOptions {
  userMessage: string
  sessionContext?: SessionContext
  tools?: typeof modelCreationTools
  instructions?: string
}

export function createModelCreationStreamText({ userMessage, sessionContext }: StreamTextOptions) {
  const { provider, modelId } = getProviderAndModel()
  const augmentedPrompt = buildContextPrompt(userMessage, sessionContext)

  return streamText({
    model: provider.languageModel(modelId),
    system: MODEL_CREATION_INSTRUCTIONS,
    prompt: augmentedPrompt,
    tools: modelCreationTools,
  })
}

export function createModelCalibrationStreamText({
  userMessage,
  sessionContext,
}: StreamTextOptions) {
  const { provider, modelId } = getProviderAndModel()
  const augmentedPrompt = buildContextPrompt(userMessage, sessionContext)

  return streamText({
    model: provider.languageModel(modelId),
    system: MODEL_CALIBRATION_INSTRUCTIONS,
    prompt: augmentedPrompt,
    tools: modelCalibrationTools,
  })
}

export function createStreamTextResult(text: string, intent: RoutedIntent) {
  const { provider, modelId } = getProviderAndModel()

  return streamText({
    model: provider.languageModel(modelId),
    system: `You are Glasify Assistant. Respond with the provided text exactly.`,
    prompt: text,
  })
}

const QUOTE_INSTRUCTIONS = `You are Glasify Assistant, an AI helper for creating quotes for window and door models.

Your task is to guide the user through creating a price quote for selected models.

Follow these steps:
1. Identify which models the user wants to quote (from session context or ask)
2. Ask for quantities of each model if not specified
3. Ask for any customizations or options if needed
4. Provide a summary of the quote with pricing breakdown

Be friendly and helpful. Present the quote in a clear format with line items and total.`

export function createQuoteStreamText({ userMessage, sessionContext }: StreamTextOptions) {
  const { provider, modelId } = getProviderAndModel()
  const augmentedPrompt = buildContextPrompt(userMessage, sessionContext)

  return streamText({
    model: provider.languageModel(modelId),
    system: QUOTE_INSTRUCTIONS,
    prompt: augmentedPrompt,
    tools: modelCreationTools,
  })
}
