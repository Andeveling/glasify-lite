import { convertToModelMessages, ToolLoopAgent, tool, type UIMessage } from "ai"
import { minimax } from "vercel-minimax-ai-provider"
import { z } from "zod"

const mockTool = tool({
  description: "Returns a mock response for testing",
  inputSchema: z.object({
    message: z.string().describe("The message to echo back"),
  }),
  execute: async ({ message }) => {
    return { echo: message, timestamp: Date.now() }
  },
})

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
