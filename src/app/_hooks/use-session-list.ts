"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ModelAssistantMode } from "@/server/services/model-assistant-session.service"
import { SESSION_LIST_KEY } from "./session-query-keys"

export interface AssistantSessionSummary {
  id: string
  mode: ModelAssistantMode
  currentStep: string
  currentModelId: string | null
  createdAt: string
  updatedAt: string
}

async function fetchSessions(): Promise<AssistantSessionSummary[]> {
  const response = await fetch("/api/chat/sessions")
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status}`)
  }
  const data = await response.json()
  return (data.sessions ?? []) as AssistantSessionSummary[]
}

async function deleteSessionRequest(sessionId: string): Promise<void> {
  const response = await fetch(`/api/chat/sessions/${sessionId}`, { method: "DELETE" })
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete session: ${response.status}`)
  }
}

export function useSessionList() {
  const queryClient = useQueryClient()

  const {
    data: sessions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: SESSION_LIST_KEY,
    queryFn: fetchSessions,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSessionRequest,
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: SESSION_LIST_KEY })
      const previous = queryClient.getQueryData<AssistantSessionSummary[]>(SESSION_LIST_KEY)
      queryClient.setQueryData<AssistantSessionSummary[]>(SESSION_LIST_KEY, (old) =>
        (old ?? []).filter((s) => s.id !== sessionId),
      )
      return { previous }
    },
    onError: (_err, _sessionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SESSION_LIST_KEY, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SESSION_LIST_KEY })
    },
  })

  return {
    sessions,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Error al cargar sesiones") : null,
    refresh: () => queryClient.invalidateQueries({ queryKey: SESSION_LIST_KEY }),
    deleteSession: (sessionId: string) => deleteMutation.mutateAsync(sessionId),
  }
}
