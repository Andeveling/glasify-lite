"use client"

import { Bot, CopyIcon, RefreshCcwIcon } from "lucide-react"
import { type FormEvent, Fragment, useState } from "react"
import { useChatSession } from "@/app/_components/chat-session-manager"
import { useModelAssistantChat } from "@/app/_hooks/use-model-assistant-chat"
import {
  Conversation,
  ConversationContent,
  ConversationContextBar,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageErrorInline,
  MessageResponse,
  ToolCallCard,
  TypingIndicator,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputAttachments,
  AttachmentPreview,
} from "@/components/ai-elements/prompt-input"
import type { UIMessage } from "ai"

interface ToolCallPart {
  type: string
  toolName?: string
  state?: string
  input?: unknown
  output?: unknown
}

function isTextPart(part: UIMessage["parts"][number]): part is { type: "text"; text: string } {
  return part.type === "text"
}

function isToolPart(part: UIMessage["parts"][number]) {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool"
}

export default function AssistantPage() {
  const { sessionId, isCreatingSession, isAuthenticated, session } = useChatSession()
  const { messages, status, sendMessage, regenerate, retry, isLoading, error } =
    useModelAssistantChat({ sessionId })
  const [input, setInput] = useState("")
  const { files, remove, clear, inputRef, handleFileChange } = usePromptInputAttachments()

  const handleSubmit = async (message: PromptInputMessage, _event: FormEvent) => {
    if (message.text.trim() || files.length > 0) {
      await sendMessage({ text: message.text })
      setInput("")
      clear()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Debes iniciar sesión para usar el asistente.</p>
      </div>
    )
  }

  if (isCreatingSession || !sessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Preparando el asistente...</p>
      </div>
    )
  }

  const hasAssistantParts = messages.some((m) => m.role === "assistant" && m.parts.length > 0)
  const showTypingIndicator = isLoading && !hasAssistantParts

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="size-6" />
          <h1 className="text-xl font-semibold">Asistente de Modelos</h1>
        </div>

        <div className="flex-1 rounded-lg border overflow-hidden flex flex-col">
          <Conversation>
            {session && (
              <ConversationContextBar
                mode={session.mode}
                currentStep={session.currentStep}
                currentModelId={session.currentModelId}
              />
            )}
            <ConversationContent>
              {messages.length === 0 && !showTypingIndicator ? (
                <ConversationEmptyState
                  icon={<Bot className="size-12" />}
                  title="Asistente de Modelos"
                  description="Creá o calibrá modelos de ventanas y puertas. ¿Qué te gustaría hacer?"
                />
              ) : (
                <>
                  {showTypingIndicator && (
                    <Message from="assistant">
                      <TypingIndicator isAnimating={true} />
                    </Message>
                  )}
                  {messages.map((message, messageIndex) => (
                    <Fragment key={message.id}>
                      {message.parts.map((part, partIndex) => {
                        if (isTextPart(part)) {
                          const isLastMessage = messageIndex === messages.length - 1

                          return (
                            <Fragment key={`${message.id}-${partIndex}`}>
                              <Message from={message.role}>
                                <MessageContent>
                                  <MessageResponse>{part.text}</MessageResponse>
                                </MessageContent>
                              </Message>
                              {message.role === "assistant" && isLastMessage && (
                                <MessageActions>
                                  <MessageAction onClick={() => regenerate()} label="Reintentar">
                                    <RefreshCcwIcon className="size-3" />
                                  </MessageAction>
                                  <MessageAction
                                    onClick={() => navigator.clipboard.writeText(part.text)}
                                    label="Copiar"
                                  >
                                    <CopyIcon className="size-3" />
                                  </MessageAction>
                                </MessageActions>
                              )}
                            </Fragment>
                          )
                        }

                        if (isToolPart(part)) {
                          const toolPart = part as ToolCallPart
                          const toolName =
                            toolPart.type === "dynamic-tool"
                              ? (toolPart.toolName ?? "unknown")
                              : toolPart.type.replace("tool-", "")
                          const state =
                            toolPart.state === "output-available"
                              ? "output-available"
                              : toolPart.state === "input-streaming"
                                ? "input-streaming"
                                : "input-available"

                          return (
                            <Message from={message.role} key={`${message.id}-${partIndex}`}>
                              <MessageContent>
                                <ToolCallCard
                                  toolName={toolName}
                                  state={state}
                                  input={toolPart.input as Record<string, unknown> | undefined}
                                  output={
                                    toolPart.state === "output-available" && toolPart.output
                                      ? (toolPart.output as Record<string, unknown>)
                                      : undefined
                                  }
                                />
                              </MessageContent>
                            </Message>
                          )
                        }

                        return null
                      })}
                    </Fragment>
                  ))}
                </>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t">
            <AttachmentPreview files={files} onRemove={remove} />
            {error && <MessageErrorInline message={error.message} onRetry={retry} />}
          </div>

          <PromptInput
            value={input}
            onSubmit={handleSubmit}
            className="mt-4 mb-4 w-full max-w-2xl mx-auto"
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
            <PromptInputTextarea
              value={input}
              placeholder="Escribí tu mensaje..."
              onChange={(e) => setInput(e.currentTarget.value)}
              disabled={status === "submitted" || status === "streaming"}
              className="pr-12"
            />
            <PromptInputSubmit
              status={status === "submitted" || status === "streaming" ? "streaming" : "ready"}
              disabled={
                (!input.trim() && files.length === 0) ||
                status === "submitted" ||
                status === "streaming"
              }
              className="absolute bottom-1 right-1"
            />
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
