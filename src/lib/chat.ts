import { convertToModelMessages, type InferAgentUIMessage, ToolLoopAgent, type UIMessage } from "ai"
import { minimax } from "vercel-minimax-ai-provider"
import { mockTool } from "./agents/_tools/mock"

const SYSTEM_INSTRUCTIONS =
  "Eres un asistente amigable que ayuda al usuario, cuando te pida que uses la tool de mock usala."

interface AgentDeps {
  modelId?: string
}

export function createAgent(_deps?: AgentDeps) {
  return new ToolLoopAgent({
    model: minimax(_deps?.modelId ?? "MiniMax-M2.7"),
    instructions: SYSTEM_INSTRUCTIONS,
    tools: {
      mock: mockTool,
    },
  })
}

export async function streamAgent({
  messages,
  agent,
}: {
  messages: UIMessage[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any
}) {
  return agent.stream({
    messages: await convertToModelMessages(messages),
  })
}

export type GlasifyAgent = InferAgentUIMessage<ReturnType<typeof createAgent>>
