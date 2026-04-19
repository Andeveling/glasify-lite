import { createIdGenerator, type UIMessage } from "ai"
import { createAgent, streamAgent } from "@/lib/chat"
import { saveChat } from "@/lib/chat/chat-store"

export const maxDuration = 30

export async function POST(request: Request) {
  const body = await request.json()

  const { messages, id }: { id: string; messages: UIMessage[] } = body

  const agent = createAgent()
  const result = await streamAgent({ messages, agent })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({
      prefix: "msg",
      size: 16,
    }),
    onFinish: ({ messages }) => {
      saveChat({ chatId: id, messages })
    },
  })
}
