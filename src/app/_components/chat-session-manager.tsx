"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import type { ModelAssistantMode } from "@/server/services/model-assistant-session.service"

interface ChatSessionInfo {
  mode: ModelAssistantMode
  currentStep: string
  currentModelId: string | null
}

interface UseChatSessionOptions {
  defaultMode?: ModelAssistantMode
}

export function useChatSession({ defaultMode = "create_model" }: UseChatSessionOptions = {}) {
  const { data: session } = useSession()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSessionInfo | null>(null)

  const fetchSession = useCallback(async (sid: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sid}`)
      if (response.ok) {
        const data = await response.json()
        setChatSession({
          mode: data.mode,
          currentStep: data.currentStep,
          currentModelId: data.currentModelId,
        })
      }
    } catch {
      // Session fetch failed silently
    }
  }, [])

  const createSession = useCallback(
    async (mode: ModelAssistantMode = defaultMode) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      setIsCreatingSession(true)

      try {
        const response = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            mode,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to create session: ${response.status}`)
        }

        const data = await response.json()
        setSessionId(data.sessionId)
        setChatSession({
          mode,
          currentStep: "initial",
          currentModelId: null,
        })
        return data.sessionId
      } finally {
        setIsCreatingSession(false)
      }
    },
    [session?.user?.id, defaultMode],
  )

  const setActiveSessionId = useCallback(
    (sid: string) => {
      setSessionId(sid)
      fetchSession(sid)
    },
    [fetchSession],
  )

  useEffect(() => {
    if (session?.user?.id && !sessionId && !isCreatingSession) {
      createSession(defaultMode)
    }
  }, [session?.user?.id, sessionId, isCreatingSession, createSession, defaultMode])

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId)
    }
  }, [sessionId, fetchSession])

  return {
    sessionId,
    isCreatingSession,
    createSession,
    setActiveSessionId,
    isAuthenticated: !!session?.user,
    session: chatSession,
  }
}
