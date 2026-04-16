import { createAgentStream } from "@/server/ai/agents/model-assistant.agents"
import { modelCreationTools } from "@/server/ai/agents/model-assistant.tools"

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages }: { messages: any[] } = await req.json()

  const userMessage = messages[messages.length - 1]?.content ?? ""

  const { streamResponse } = createAgentStream({
    userMessage,
    tools: modelCreationTools,
  })

  return streamResponse
}
