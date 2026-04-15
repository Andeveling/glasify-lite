"use client"

import type { FileUIPart } from "ai"
import { Bot, CopyIcon, RefreshCcwIcon } from "lucide-react"
import { type FormEvent, Fragment, useCallback, useState } from "react"
import { useChatSession } from "@/app/_components/chat-session-manager"
import { useModelAssistantChat } from "@/app/_hooks/use-model-assistant-chat"
import { useSessionList } from "@/app/_hooks/use-session-list"
import { Attachment, Attachments } from "@/components/ai-elements/attachments"
import { CodeBlock } from "@/components/ai-elements/code-block"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool"
import { AssistantSessionSidebar } from "./_components/assistant-session-sidebar"

function isTextPart(part: { type: string }): part is { type: "text"; text: string } {
  return part.type === "text"
}

function isToolPart(part: { type: string }) {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool"
}

export default function AssistantPage() {
  const {
    sessionId,
    isCreatingSession,
    isAuthenticated,
    session: _session,
    createSession,
    setActiveSessionId,
  } = useChatSession()

  const {
    messages,
    status,
    sendMessage,
    regenerate,
    retry: _retry,
    isLoading,
    error,
  } = useModelAssistantChat({ sessionId })

  const { sessions, isLoading: isLoadingSessions, deleteSession, refresh } = useSessionList()

  const [_input, setInput] = useState("")
  const [files, setFiles] = useState<(FileUIPart & { id: string })[]>([])

  const _handleFilesChange = useCallback((newFiles: (FileUIPart & { id: string })[]) => {
    setFiles(newFiles)
  }, [])

  const handleSubmit = async (message: PromptInputMessage, _event: FormEvent) => {
    if (message.text.trim() || message.files.length > 0) {
      await sendMessage({ text: message.text })
      setInput("")
      setFiles([])
    }
  }

  const handleSelectSession = useCallback(
    (selectedSessionId: string) => {
      setActiveSessionId(selectedSessionId)
    },
    [setActiveSessionId],
  )

  const handleNewSession = useCallback(async () => {
    await createSession()
    await refresh()
  }, [createSession, refresh])

  const handleDeleteSession = useCallback(
    async (sessionIdToDelete: string) => {
      await deleteSession(sessionIdToDelete)
      if (sessionIdToDelete === sessionId) {
        await createSession()
      }
    },
    [deleteSession, sessionId, createSession],
  )

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Debes iniciar sesión para usar el asistente.</p>
      </div>
    )
  }

  const hasAssistantParts = messages.some((m) => m.role === "assistant" && m.parts.length > 0)
  const showTypingIndicator = isLoading && !hasAssistantParts

  return (
    <div className="flex h-full overflow-hidden">
      <AssistantSessionSidebar
        sessions={sessions}
        activeSessionId={sessionId}
        isLoading={isLoadingSessions}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex flex-col flex-1 min-w-0 p-4">
        {isCreatingSession || !sessionId ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Preparando el asistente...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="size-6" />
              <h1 className="text-xl font-semibold">Asistente de Modelos</h1>
            </div>

            <div className="flex-1 rounded-lg border overflow-hidden flex flex-col">
              <Conversation key={sessionId}>
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
                          <MessageContent>
                            <MessageResponse>...</MessageResponse>
                          </MessageContent>
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
                                      <MessageAction
                                        onClick={() => regenerate()}
                                        label="Reintentar"
                                      >
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
                              // @ts-expect-error UIMessage parts have type: string which doesn't auto-discriminate ToolHeaderProps union
                              const { type, state, toolName, input, output, errorText } =
                                part as ToolPart

                              return (
                                <Message from={message.role} key={`${message.id}-${partIndex}`}>
                                  <Tool defaultOpen={state === "output-available"}>
                                    {/* @ts-expect-error same discriminator issue */}
                                    <ToolHeader
                                      type={type}
                                      state={state}
                                      toolName={type === "dynamic-tool" ? toolName : undefined}
                                    />
                                    <ToolContent>
                                      {input != null && (
                                        <CodeBlock
                                          code={JSON.stringify(input, null, 2)}
                                          language="json"
                                        />
                                      )}
                                      {(output || errorText) && (
                                        <ToolOutput
                                          output={output}
                                          toolName={
                                            type === "dynamic-tool"
                                              ? toolName
                                              : type.startsWith("tool-")
                                                ? type.slice(5)
                                                : undefined
                                          }
                                          errorText={errorText}
                                        />
                                      )}
                                    </ToolContent>
                                  </Tool>
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

              {files.length > 0 && (
                <div className="border-t p-2">
                  <Attachments variant="list">
                    {files.map((file) => (
                      <Attachment key={file.id} data={file} />
                    ))}
                  </Attachments>
                </div>
              )}

              {error && (
                <div className="border-t px-4 py-2 text-sm text-destructive">
                  Error: {error.message}
                </div>
              )}

              <div className="border-t p-4">
                <PromptInput onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
                  <PromptInputTextarea
                    placeholder="Escribí tu mensaje..."
                    disabled={status === "submitted" || status === "streaming"}
                    className="pr-12"
                  />
                  <PromptInputSubmit
                    status={
                      status === "submitted" || status === "streaming" ? "streaming" : "ready"
                    }
                    disabled={status === "submitted" || status === "streaming"}
                    className="absolute bottom-1 right-1"
                  />
                </PromptInput>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
