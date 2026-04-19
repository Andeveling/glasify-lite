"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isFileUIPart, isTextUIPart } from "ai"
import { Bot } from "lucide-react"
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
import type { ChatSessionMetadata } from "../_hooks/use-chat-sessions"
import { WaitingDots } from "./WaitingDots"

interface ChatWindowProps {
  selectedId?: string
  session?: ChatSessionMetadata
}

export function ChatWindow({ selectedId, session }: ChatWindowProps) {
  const [currentState, setCurrentState] = useState<PersonaState>("idle")
  const { messages, status, error, sendMessage, stop, setMessages } = useChat({
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

  return (
    <div className="flex-1 flex flex-col rounded-lg border overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Bot className="size-5" />
        <h1 className="font-semibold">Asistente</h1>
        {selectedId && (
          <span className="ml-auto text-xs text-muted-foreground">
            {session?.preview ?? selectedId}
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
  )
}