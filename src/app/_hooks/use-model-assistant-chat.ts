"use client"

import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { DefaultChatTransport } from "ai"
import { useEffect } from "react"

type ChatStatus = "submitted" | "streaming" | "ready" | "error"

interface UseModelAssistantChatOptions {
  sessionId: string | null
}

export function useModelAssistantChat({ sessionId }: UseModelAssistantChatOptions) {
  const apiUrl = sessionId ? `/api/chat/sessions/${sessionId}/messages` : "/api/chat/sessions"

  const {
    messages,
    sendMessage: chatSendMessage,
    regenerate: chatRegenerate,
    error,
    setMessages,
    status,
  } = useChat({
    id: sessionId ?? undefined,
    transport: new DefaultChatTransport({
      api: apiUrl,
      prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => {
        return {
          body: {
            id,
            trigger,
            messageId,
            message: messages[messages.length - 1],
          },
        }
      },
    }),
  })

  useEffect(() => {
    if (!sessionId) return

    const controller = new AbortController()

    fetch(`/api/chat/sessions/${sessionId}/messages`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages: UIMessage[] } | null) => {
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages)
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [sessionId, setMessages])

  const sendMessage = async (input: { text: string }) => {
    if (!sessionId) {
      throw new Error("No session ID provided")
    }

    if (!input.text.trim()) {
      return
    }

    await chatSendMessage({ text: input.text })
  }

  const regenerate = async () => {
    if (messages.length < 2) return
    await chatRegenerate()
  }

  const retry = async () => {
    await chatRegenerate()
  }

  const isLoading = status === "submitted" || status === "streaming"

  return {
    messages: messages as UIMessage[],
    status: status as ChatStatus,
    error: error ?? null,
    isLoading,
    sendMessage,
    regenerate,
    retry,
    setMessages,
  }
}
