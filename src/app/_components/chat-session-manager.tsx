"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import type { ModelAssistantMode } from "@/server/services/model-assistant-session.service"
import { SESSION_LIST_KEY } from "@/app/_hooks/session-query-keys"
import type { AssistantSessionSummary } from "@/app/_hooks/use-session-list"

interface ChatSessionInfo {
  mode: ModelAssistantMode
  currentStep: string
  currentModelId: string | null
}

interface CreateSessionPayload {
  userId: string
  mode: ModelAssistantMode
}

interface UseChatSessionOptions {
  defaultMode?: ModelAssistantMode
}

async function fetchSessionById(sessionId: string): Promise<ChatSessionInfo> {
  const response = await fetch(`/api/chat/sessions/${sessionId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch session: ${response.status}`)
  }
  const data = await response.json()
  return {
    mode: data.mode,
    currentStep: data.currentStep,
    currentModelId: data.currentModelId,
  } as ChatSessionInfo
}

async function fetchSessionList(): Promise<AssistantSessionSummary[]> {
  const response = await fetch("/api/chat/sessions")
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status}`)
  }
  const data = await response.json()
  return (data.sessions ?? []) as AssistantSessionSummary[]
}

async function createSessionRequest(payload: CreateSessionPayload): Promise<string> {
  const response = await fetch("/api/chat/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`)
  }
  const data = await response.json()
  return data.sessionId as string
}

export function useChatSession({ defaultMode = "create_model" }: UseChatSessionOptions = {}) {
  const { data: authSession } = useSession()
  const queryClient = useQueryClient()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  const { data: sessionList = [] } = useQuery({
    queryKey: SESSION_LIST_KEY,
    queryFn: fetchSessionList,
    enabled: !!authSession?.user?.id && !bootstrapped,
  })

  const sessionQuery = useQuery({
    queryKey: ["chat-session", sessionId],
    queryFn: () => fetchSessionById(sessionId!),
    enabled: !!sessionId,
  })

  const createSessionMutation = useMutation({
    mutationFn: createSessionRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SESSION_LIST_KEY })
    },
  })

  const createSession = useCallback(
    async (mode: ModelAssistantMode = defaultMode) => {
      if (!authSession?.user?.id) {
        throw new Error("User not authenticated")
      }
      const newSessionId = await createSessionMutation.mutateAsync({
        userId: authSession.user.id,
        mode,
      })
      setSessionId(newSessionId)
      setBootstrapped(true)
      return newSessionId
    },
    [authSession?.user?.id, defaultMode, createSessionMutation],
  )

  const setActiveSessionId = useCallback((sid: string) => {
    setSessionId(sid)
    setBootstrapped(true)
  }, [])

  useEffect(() => {
    if (!authSession?.user?.id || bootstrapped || createSessionMutation.isPending) return

    const [latestSession] = sessionList
    if (latestSession) {
      setSessionId(latestSession.id)
      setBootstrapped(true)
    } else if (sessionList !== undefined) {
      void createSession(defaultMode)
    }
  }, [
    authSession?.user?.id,
    bootstrapped,
    createSessionMutation.isPending,
    sessionList,
    createSession,
    defaultMode,
  ])

  return {
    sessionId,
    isCreatingSession: createSessionMutation.isPending,
    createSession,
    setActiveSessionId,
    isAuthenticated: !!authSession?.user,
    session: sessionQuery.data ?? null,
  }
}
