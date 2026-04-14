"use client"

import type { AssistantSessionSummary } from "@/app/_hooks/use-session-list"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ModelAssistantMode } from "@/server/services/model-assistant-session.service"
import { Bot, MessageSquarePlus, Trash2 } from "lucide-react"

const MODE_LABELS: Record<ModelAssistantMode, string> = {
  create_model: "Crear modelo",
  calibrate_model: "Calibrar modelo",
  create_quote: "Crear presupuesto",
}

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
interface AssistantSessionSidebarProps {
  sessions: AssistantSessionSummary[]
  activeSessionId: string | null
  isLoading: boolean
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
}

export function AssistantSessionSidebar({
  sessions,
  activeSessionId,
  isLoading,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: AssistantSessionSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r w-64 shrink-0">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="size-4" />
          <span className="text-sm font-medium">Sesiones</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onNewSession}
          title="Nueva sesión"
        >
          <MessageSquarePlus className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-3 text-xs text-muted-foreground">Cargando sesiones...</div>
        ) : sessions.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">No hay sesiones previas.</div>
        ) : (
          <ul className="py-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm group flex items-start justify-between gap-2 hover:bg-primary/60 transition-colors cursor-pointer",
                    activeSessionId === session.id && "bg-primary/80",
                  )}
                  onClick={() => onSelectSession(session.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelectSession(session.id)
                  }}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium truncate">{MODE_LABELS[session.mode]}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatSessionDate(session.updatedAt)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    title="Eliminar sesión"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}
