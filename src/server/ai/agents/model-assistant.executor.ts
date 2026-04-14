import {
  createModelCalibrationAgent,
  createModelCreationAgent,
} from "@/server/ai/agents/model-assistant.agents"
import type { RoutedIntent } from "@/server/ai/agents/model-assistant.router"
import { IntentMode } from "@/server/ai/agents/model-assistant.router"
import { modelCalibrationTools, modelCreationTools } from "@/server/ai/agents/model-assistant.tools"

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

function buildContextPrompt(userMessage: string, sessionContext?: SessionContext): string {
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
    default:
      throw new Error(`No executor for mode: ${mode}`)
  }
}

export function isExecutableMode(mode: string): boolean {
  return mode === IntentMode.CREATE_MODEL || mode === IntentMode.CALIBRATE_MODEL
}
