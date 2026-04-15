"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { DefaultChatTransport } from "ai"
import { useCallback, useEffect } from "react"

type ChatStatus = "submitted" | "streaming" | "ready" | "error"

interface UseModelAssistantChatOptions {
  sessionId: string | null
}

function chatMessagesKey(sessionId: string) {
  return ["chat-messages", sessionId] as const
}

async function fetchMessages(sessionId: string): Promise<UIMessage[]> {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`)
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`)
  }
  const data = await response.json()
  return (data.messages ?? []) as UIMessage[]
}

export function useModelAssistantChat({ sessionId }: UseModelAssistantChatOptions) {
  const queryClient = useQueryClient()
  const apiUrl = sessionId ? `/api/chat/sessions/${sessionId}/messages` : "/api/chat/sessions"

  const { data: initialMessages } = useQuery({
    queryKey: chatMessagesKey(sessionId!),
    queryFn: () => fetchMessages(sessionId!),
    enabled: !!sessionId,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const {
    messages,
    sendMessage: chatSendMessage,
    regenerate: chatRegenerate,
    error,
    setMessages,
    status,
  } = useChat({
    id: sessionId ?? undefined,
    messages: initialMessages,
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
  })

  // Sync query cache with live useChat messages after streaming
  useEffect(() => {
    if (sessionId && status === "ready" && messages.length > 0) {
      queryClient.setQueryData(chatMessagesKey(sessionId), messages)
    }
  }, [sessionId, status, messages, queryClient])

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
