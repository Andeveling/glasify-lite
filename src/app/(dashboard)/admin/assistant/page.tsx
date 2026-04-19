"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isFileUIPart, isTextUIPart } from "ai"
import { Bot, MessageSquare, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Attachment, AttachmentPreview, Attachments } from "@/components/ai-elements/attachments"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import { Persona, type PersonaState } from "@/components/ai-elements/persona"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { api } from "@/trpc/react"
import { type RouterOutputs } from "@/trpc/react"
import { WaitingDots } from "./_components/WaitingDots"

type ChatSessionMetadata = RouterOutputs["admin"]["chat"]["list"][number]

export default function AssistantPage() {
  const [sessions, setSessions] = useState<ChatSessionMetadata[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [currentState, setCurrentState] = useState<PersonaState>("idle")

  const utils = api.useUtils()
  const { data: sessionList = [] } = api.admin.chat.list.useQuery()
  const deleteSession = api.admin.chat.delete.useMutation({
    onSuccess: () => {
      void utils.admin.chat.list.invalidate()
    },
  })

  const { messages, status, error, sendMessage, regenerate, stop, setMessages } = useChat({
    id: selectedId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const isGenerating = status === "submitted" || status === "streaming"

  const loadChat = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/chat/${id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    },
    [setMessages],
  )

  const createChat = useCallback(async () => {
    const res = await fetch("/api/chat", { method: "POST" })
    if (res.ok) {
      const { id }: { id: string } = await res.json()
      setSelectedId(id)
      setMessages([])
      void utils.admin.chat.list.invalidate()
    }
  }, [utils, setMessages])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("¿Eliminar esta sesión?")) return
      await deleteSession.mutateAsync({ id })
      if (selectedId === id) {
        setSelectedId(undefined)
        setMessages([])
      }
      void utils.admin.chat.list.invalidate()
    },
    [selectedId, deleteSession, setMessages, utils],
  )

  useEffect(() => {
    if (sessionList) {
      setSessions(sessionList)
    }
  }, [sessionList])

  useEffect(() => {
    if (selectedId) {
      loadChat(selectedId)
    } else {
      setMessages([])
    }
  }, [selectedId, loadChat, setMessages])

  const onSubmit = (message: PromptInputMessage) => {
    if (!message.text && !message.files?.length) return
    setCurrentState("thinking")
    sendMessage(message).then(() => setCurrentState("idle"))
    return Promise.resolve()
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="flex h-full gap-4 p-4">
      <aside className="w-64 shrink-0 flex flex-col gap-2">
        <button
          type="button"
          onClick={createChat}
          className="flex items-center gap-2 rounded-lg border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Nuevo chat
        </button>

        <div className="flex-1 overflow-y-auto rounded-lg border">
          {sessions.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No hay sesiones</p>
          ) : (
            <ul className="p-1">
              {sessions.map((session) => (
                <li key={session.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => setSelectedId(session.id)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                      selectedId === session.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{session.preview}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{session.messageCount} msgs</span>
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(session.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col rounded-lg border overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Bot className="size-5" />
          <h1 className="font-semibold">Asistente</h1>
          {selectedId && (
            <span className="ml-auto text-xs text-muted-foreground">
              {sessions.find((s) => s.id === selectedId)?.preview ?? selectedId}
            </span>
          )}
        </div>

        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="size-12" />}
                title="Asistente IA"
                description={
                  selectedId ? "Esta sesión está vacía." : "Seleccioná una sesión o creá una nueva."
                }
              />
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    <MessageResponse>
                      {message.parts
                        .filter(isTextUIPart)
                        .map((part) => part.text)
                        .join("")}
                    </MessageResponse>
                    <Attachments variant="grid">
                      {message.parts.filter(isFileUIPart).map((part, index) => (
                        <Attachment
                          key={`${message.id}-attachment-${index}`}
                          data={{
                            ...part,
                            id: `${message.id}-attachment-${index}`,
                          }}
                        >
                          <AttachmentPreview />
                        </Attachment>
                      ))}
                    </Attachments>
                  </MessageContent>
                </Message>
              ))
            )}
            <div className="flex justify-between">
              <Persona className="size-14 animate-pulse" state={currentState} variant="glint" />
              {isGenerating && <WaitingDots />}
            </div>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {error && (
          <div className="border-t px-4 py-2 text-sm text-destructive">Error: {error.message}</div>
        )}

        <div className="border-t p-4">
          <PromptInputProvider>
            <PromptInput globalDrop multiple onSubmit={onSubmit}>
              <PromptInputHeader />
              <PromptInputBody>
                <PromptInputTextarea placeholder="Escribí tu mensaje..." />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                      <PromptInputActionAddScreenshot />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                </PromptInputTools>
                <PromptInputSubmit status={status} onStop={isGenerating ? stop : undefined} />
              </PromptInputFooter>
            </PromptInput>
          </PromptInputProvider>
        </div>
      </div>
    </div>
  )
}
