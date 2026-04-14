import { createMinimax } from "vercel-minimax-ai-provider"
import { env } from "@/env"

export function getMinimaxModelId(): string {
  return env.MINIMAX_TEXT_MODEL || "MiniMax-M2.7"
}

export function createMinimaxProvider() {
  return createMinimax({
    apiKey: env.MINIMAX_API_KEY,
  })
}
