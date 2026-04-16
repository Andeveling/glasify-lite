"use client"

import { Bot } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"
import { useCallback, useState } from "react"

function ChatInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(
    async (message: { text: string; files: any[] }) => {
      if (!message.text.trim()) return
      setIsLoading(true)
      try {
        await onSend(message.text)
      } finally {
        setIsLoading(false)
      }
    },
    [onSend],
  )

  return (
    <PromptInput onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
      <PromptInputTextarea placeholder="Escribí tu mensaje..." className="pr-12" />
      <PromptInputSubmit
        status={isLoading ? "streaming" : "ready"}
        disabled={isLoading}
        className="absolute bottom-1 right-1"
      />
    </PromptInput>
  )
}

export default function AssistantPage() {
  const { messages, status, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage({ text })
    },
    [sendMessage],
  )

  const isLoading = status === "submitted" || status === "streaming"

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center gap-2">
        <Bot className="size-6" />
        <h1 className="text-xl font-semibold">Asistente</h1>
      </div>

      <div className="flex-1 rounded-lg border overflow-hidden flex flex-col">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="size-12" />}
                title="Asistente IA"
                description="Escribí un mensaje para comenzar la conversación."
              />
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    <MessageResponse>
                      {message.parts
                        .filter((part) => part.type === "text")
                        .map((part) => (part as { type: "text"; text: string }).text)
                        .join("")}
                    </MessageResponse>
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {error && (
          <div className="border-t px-4 py-2 text-sm text-destructive">Error: {error.message}</div>
        )}

        <div className="border-t p-4">
          <PromptInputProvider>
            <ChatInput onSend={handleSend} />
          </PromptInputProvider>
        </div>
      </div>
    </div>
  )
}
