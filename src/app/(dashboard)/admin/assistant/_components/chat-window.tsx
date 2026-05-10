"use client"

import type { UIMessage } from "ai"
import { isFileUIPart, isTextUIPart } from "ai"
import { Bot } from "lucide-react"
import { Attachment, AttachmentPreview, Attachments } from "@/components/ai-elements/attachments"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import { Persona } from "@/components/ai-elements/persona"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatContext } from "../_context/chat-context"
import { WaitingDots } from "./WaitingDots"

type MessageListProps = {
  messages: UIMessage[]
}

function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <ConversationEmptyState
        icon={<Bot className="size-12" />}
        title="Asistente IA"
        description="Esta sesión está vacía."
      />
    )
  }

  return (
    <>
      {messages.map((message) => (
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
      ))}
    </>
  )
}

export function ChatWindow() {
  const {
    currentState,
    error,
    isGenerating,
    messages,
    selectedId,
    selectedSession,
    status,
    stop,
    submitMessage,
  } = useChatContext()

  const handleSubmit = (message: PromptInputMessage) => submitMessage(message)

  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Bot className="size-5" />
        <h1 className="font-semibold">Asistente</h1>
        {selectedId && (
          <span className="ml-auto text-xs text-muted-foreground">
            {selectedSession?.preview ?? selectedId}
          </span>
        )}
      </div>

      <Conversation>
        <ScrollArea className="h-full">
          <ConversationContent>
            <MessageList messages={messages} />
            <div className="flex justify-between">
              <Persona className="size-14 animate-pulse" state={currentState} variant="glint" />
              {isGenerating && <WaitingDots />}
            </div>
          </ConversationContent>
        </ScrollArea>
        <ConversationScrollButton />
      </Conversation>

      {error && (
        <div className="border-t px-4 py-2 text-sm text-destructive">Error: {error.message}</div>
      )}

      <div className="border-t p-4">
        <PromptInputProvider>
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
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
