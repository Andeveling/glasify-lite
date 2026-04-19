import type { UIMessage } from "ai"
import { generateId } from "ai"
import { existsSync, mkdirSync } from "fs"
import { readdir, readFile, stat, unlink, writeFile } from "fs/promises"
import path from "path"

export interface ChatSessionMetadata {
  id: string
  preview: string
  messageCount: number
  createdAt: number
  updatedAt: number
}

const CHAT_TTL_DAYS = 7

export async function createChat(): Promise<string> {
  const id = generateId()
  await writeFile(getChatFile(id), "[]")
  return id
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string
  messages: UIMessage[]
}): Promise<void> {
  const content = JSON.stringify(messages, null, 2)
  await writeFile(getChatFile(chatId), content)
}

function getChatFile(id: string): string {
  const chatDir = path.join(process.cwd(), ".chats")
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true })
  return path.join(chatDir, `${id}.json`)
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  return JSON.parse(await readFile(getChatFile(id), "utf-8"))
}

export async function listChats(): Promise<ChatSessionMetadata[]> {
  const chatDir = path.join(process.cwd(), ".chats")
  if (!existsSync(chatDir)) return []

  const files = await readdir(chatDir)
  const jsonFiles = files.filter((f) => f.endsWith(".json"))

  const fileInfos = await Promise.all(
    jsonFiles.map(async (f) => {
      const id = f.replace(/\.json$/, "")
      const filePath = getChatFile(id)
      const fileStat = await stat(filePath)
      return { id, filePath, fileStat }
    }),
  )

  const now = Date.now()
  const ttlMs = CHAT_TTL_DAYS * 24 * 60 * 60 * 1000

  const expired = fileInfos.filter((fi) => now - fi.fileStat.mtimeMs > ttlMs)
  const valid = fileInfos.filter((fi) => now - fi.fileStat.mtimeMs <= ttlMs)

  await Promise.all(expired.map((fi) => unlink(fi.filePath)))

  const chats = await Promise.all(
    valid.map(async (fi) => {
      const raw = await readFile(fi.filePath, "utf-8")
      const messages = JSON.parse(raw) as UIMessage[]
      const userMessage = messages.find((m) => m.role === "user")
      const textPart = userMessage?.parts.find(
        (p): p is { type: "text"; text: string } => p.type === "text",
      )
      const preview = textPart?.text ?? "Empty chat"
      return {
        id: fi.id,
        preview,
        messageCount: messages.length,
        createdAt: fi.fileStat.birthtimeMs,
        updatedAt: fi.fileStat.mtimeMs,
      }
    }),
  )

  return chats.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function deleteChat(id: string): Promise<boolean> {
  const filePath = getChatFile(id)
  try {
    await unlink(filePath)
    return true
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false
    throw err
  }
}
