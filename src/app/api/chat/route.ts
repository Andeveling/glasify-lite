import { createIdGenerator, type UIMessage } from "ai"
import { createAgent, streamAgent } from "@/lib/chat"
import { deleteChat, listChats, saveChat } from "./_util/chat-store"

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

export async function GET() {
  const chats = await listChats()
  return Response.json(chats)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return new Response("Missing id", { status: 400 })
  const result = await deleteChat(id)
  return Response.json(result)
}
