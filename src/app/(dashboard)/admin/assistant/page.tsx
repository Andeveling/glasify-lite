"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isFileUIPart, isTextUIPart } from "ai"
import { Bot, Pointer } from "lucide-react"
import { useState } from "react"
import {
	Attachment,
	AttachmentPreview,
	AttachmentRemove,
	Attachments
} from "@/components/ai-elements/attachments"
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
import { WaitingDots } from "./_components/WaitingDots"




export default function AssistantPage() {
  const { messages, status, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
	})


	const [currentState, setCurrentState] = useState<PersonaState>("idle");


  const onSubmit = (message: PromptInputMessage) => {
		if (!message.text && !message.files?.length) return
    setCurrentState("thinking")
    sendMessage(message).then(() => setCurrentState("idle"))
    return Promise.resolve()
	}

  const seeDots = status === "submitted" || status === "streaming"

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
                        .filter(isTextUIPart)
                        .map((part) => part.text)
                        .join("")}
                    </MessageResponse>
                    <Attachments variant="grid">
                      {message.parts.filter(isFileUIPart).map((part, index) => (
                        <Attachment
                          key={`${message.id}-attachment-${index}`}
                          data={{ ...part, id: `${message.id}-attachment-${index}` }}
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
							{seeDots	 && <WaitingDots />}
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
              <PromptInputHeader>
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
