"use client"

import { useCallback, useEffect, useState } from "react"
import type { ModelAssistantMode } from "@/server/services/model-assistant-session.service"

export interface AssistantSessionSummary {
  id: string
  mode: ModelAssistantMode
  currentStep: string
  currentModelId: string | null
  createdAt: string
  updatedAt: string
}

export function useSessionList() {
  const [sessions, setSessions] = useState<AssistantSessionSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat/sessions")

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`)
      }

      const data = await response.json()
      setSessions(data.sessions ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar sesiones")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteSession = useCallback(
    async (sessionId: string) => {
      const previous = sessions
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))

      try {
        const response = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: "DELETE",
        })

        if (!response.ok && response.status !== 204) {
          setSessions(previous)
          throw new Error(`Failed to delete session: ${response.status}`)
        }
      } catch (err) {
        setSessions(previous)
        setError(err instanceof Error ? err.message : "Error al eliminar la sesión")
      }
    },
    [sessions],
  )

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    isLoading,
    error,
    refresh: fetchSessions,
    deleteSession,
  }
}
