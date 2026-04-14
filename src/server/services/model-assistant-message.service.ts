import type { UIMessage } from "ai"
import { db } from "@/server/db"

export async function saveMessage(sessionId: string, message: UIMessage): Promise<void> {
  await db.modelAssistantMessage.create({
    data: {
      sessionId,
      messageId: message.id,
      role: message.role,
      partsJson: JSON.stringify(message.parts ?? []),
    },
  })
}

export async function getMessagesBySession(sessionId: string): Promise<UIMessage[]> {
  const messages = await db.modelAssistantMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  })

  return messages.map((m) => ({
    id: m.messageId,
    role: m.role as UIMessage["role"],
    parts: JSON.parse(m.partsJson) as UIMessage["parts"],
  }))
}
