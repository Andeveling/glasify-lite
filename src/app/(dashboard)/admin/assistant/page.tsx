"use client"

import {
	Attachment,
	AttachmentPreview,
	AttachmentRemove,
	Attachments,
} from "@/components/ai-elements/attachments"
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
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
	usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot } from "lucide-react"

function PromptInputAttachmentsDisplay() {
  const attachments = usePromptInputAttachments()

  if (attachments.files.length === 0) {
    return null
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          onRemove={() => attachments.remove(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  )
}

export default function AssistantPage() {
  const { messages, status, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const onSubmit = (message: PromptInputMessage) => {
    if (!message.text && !message.files?.length) return
    sendMessage(message)
    return Promise.resolve()
  }

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
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={`${message.id}-part-${index}`}>
                            {(part as { text: string }).text}
                          </MessageResponse>
                        )
                      }
                      if ((part.type as string) === "image") {
                        return (
                          <img
                            key={`${message.id}-part-${index}`}
                            src={(part as unknown as { image: string }).image}
                            alt=""
                            className="max-h-60 rounded-md object-contain"
                          />
                        )
                      }
                      return null
                    })}
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
            <PromptInput globalDrop multiple onSubmit={onSubmit}>
              <PromptInputHeader>
                <PromptInputAttachmentsDisplay />
              </PromptInputHeader>
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
                <PromptInputSubmit status={status} />
              </PromptInputFooter>
            </PromptInput>
          </PromptInputProvider>
        </div>
      </div>
    </div>
  )
}
