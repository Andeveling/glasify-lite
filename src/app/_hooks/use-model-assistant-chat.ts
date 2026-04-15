"use client"

import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { DefaultChatTransport } from "ai"
import { useCallback, useEffect, useRef } from "react"

type ChatStatus = "submitted" | "streaming" | "ready" | "error"

interface UseModelAssistantChatOptions {
  sessionId: string | null
}

async function persistMessage(sessionId: string, message: UIMessage): Promise<void> {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages/persist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
    if (!response.ok) {
      console.error("[useModelAssistantChat] Failed to persist message:", response.status)
    }
  } catch (err) {
    console.error("[useModelAssistantChat] Error persisting message:", err)
  }
}

export function useModelAssistantChat({ sessionId }: UseModelAssistantChatOptions) {
  const apiUrl = sessionId ? `/api/chat/sessions/${sessionId}/messages` : "/api/chat/sessions"
  const messagesRef = useRef<UIMessage[]>([])

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
            messages,
          },
        }
      },
    }),
    onFinish: ({ message }) => {
      if (sessionId && message.role === "assistant") {
        void persistMessage(sessionId, message)
      }
    },
  })

  messagesRef.current = messages as UIMessage[]

  useEffect(() => {
    if (!sessionId) return

    const controller = new AbortController()

    fetch(`/api/chat/sessions/${sessionId}/messages`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages: UIMessage[] } | null) => {
        if (data?.messages && data.messages.length > 0 && messagesRef.current.length === 0) {
          setMessages(data.messages)
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [sessionId, setMessages])

  const sendMessage = useCallback(
    async (input: { text: string }) => {
      if (!sessionId) {
        throw new Error("No session ID provided")
      }

      if (!input.text.trim()) {
        return
      }

      await chatSendMessage({ text: input.text })
    },
    [sessionId, chatSendMessage],
  )

  const regenerate = useCallback(async () => {
    if (messagesRef.current.length < 2) return
    await chatRegenerate()
  }, [chatRegenerate])

  const retry = useCallback(async () => {
    await chatRegenerate()
  }, [chatRegenerate])

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
