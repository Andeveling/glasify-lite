import { generateText, Output } from "ai"
import { z } from "zod"
import { createMinimaxProvider, getMinimaxModelId } from "@/server/ai/providers/minimax"

export const IntentMode = {
  CREATE_MODEL: "create_model",
  CALIBRATE_MODEL: "calibrate_model",
  CREATE_QUOTE: "create_quote",
} as const

export type IntentMode = (typeof IntentMode)[keyof typeof IntentMode]

export const routeSchema = z.object({
  mode: z.enum([IntentMode.CREATE_MODEL, IntentMode.CALIBRATE_MODEL, IntentMode.CREATE_QUOTE]),
  confidence: z.number().min(0).max(1),
})

export type RoutedIntent = z.infer<typeof routeSchema>

const ROUTER_PROMPT = `You are an intent classifier for a window model assistant called "Glasify Assistant".

Classify the user message into ONE of these three intents:

1. **create_model** - User wants to create a NEW window/door model from scratch. Keywords: crear modelo, nueva ventana, nuevo modelo, crear ventana, diseñar modelo, ventana corrediza, puerta, modelo nuevo, diseño

2. **calibrate_model** - User wants to calibrate/update pricing of an EXISTING model. Keywords: calibrar, precio, costo, ajustar precio, actualizar costo, calibración, agregar costo, cambiar precio, modificar modelo

3. **create_quote** - User wants to generate a QUOTE for specific window configurations. Keywords: cotizar, cotización, cotizame, presupuesto, generar quote, precio total

Return a JSON object with:
- mode: the intent ("create_model", "calibrate_model", or "create_quote")
- confidence: a number between 0 and 1 indicating how confident you are in this classification

IMPORTANT: If the message is ambiguous or doesn't clearly match any intent, classify as "create_model" with low confidence (0.3-0.5).

Examples:
- "Quiero crear una ventana corrediza 2 hojas" → {"mode": "create_model", "confidence": 0.92}
- "Ayuda con ventanas" → {"mode": "create_model", "confidence": 0.35}
- "Calibrar el modelo VC Panama" → {"mode": "calibrate_model", "confidence": 0.88}
- "Cotizame 10 ventanas VC Panama" → {"mode": "create_quote", "confidence": 0.85}
- "Agregar precios al modelo Europa" → {"mode": "calibrate_model", "confidence": 0.80}`

const CONFIDENCE_THRESHOLD = 0.7

export async function routeIntent(userMessage: string): Promise<RoutedIntent> {
  const provider = createMinimaxProvider()
  const modelId = getMinimaxModelId()

  const result = await generateText({
    model: provider.languageModel(modelId),
    output: Output.object({
      schema: routeSchema,
    }),
    prompt: `${ROUTER_PROMPT}\n\nUser message: "${userMessage}"`,
  })

  const intent = result.output

  if (!intent) {
    return {
      mode: IntentMode.CREATE_MODEL,
      confidence: 0.3,
    }
  }

  return intent
}

export function isConfident(intent: RoutedIntent): boolean {
  return intent.confidence >= CONFIDENCE_THRESHOLD
}

export function requiresDisambiguation(intent: RoutedIntent): boolean {
  return intent.confidence < CONFIDENCE_THRESHOLD
}
