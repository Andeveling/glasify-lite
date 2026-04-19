import { loadChat } from "@/lib/chat/chat-store"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const messages = await loadChat(id)
  return Response.json(messages)
}
