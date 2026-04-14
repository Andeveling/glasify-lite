import { ToolLoopAgent } from "ai"
import type {
  ModelCalibrationTools,
  ModelCreationTools,
} from "@/server/ai/agents/model-assistant.tools"
import { createMinimaxProvider, getMinimaxModelId } from "@/server/ai/providers/minimax"

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

export function createModelCreationAgent(tools: ModelCreationTools) {
  const provider = createMinimaxProvider()
  const modelId = getMinimaxModelId()

  return new ToolLoopAgent({
    model: provider.languageModel(modelId),
    instructions: MODEL_CREATION_INSTRUCTIONS,
    tools,
  })
}

export function createModelCalibrationAgent(tools: ModelCalibrationTools) {
  const provider = createMinimaxProvider()
  const modelId = getMinimaxModelId()

  return new ToolLoopAgent({
    model: provider.languageModel(modelId),
    instructions: MODEL_CALIBRATION_INSTRUCTIONS,
    tools,
  })
}
