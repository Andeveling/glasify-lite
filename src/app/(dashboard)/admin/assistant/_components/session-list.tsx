"use client";

import { Loader2, MessageSquare, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { ChatSessionMetadata } from "../_hooks/use-chat-sessions";

interface SessionListProps {
  sessions: ChatSessionMetadata[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
}

export function SessionList({
  sessions,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  isLoading,
  isFetching,
  isError,
}: SessionListProps) {
  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-2">
      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 rounded-lg border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="size-4" />
        Nuevo chat
      </button>

      <div className="flex-1 overflow-y-auto rounded-lg border">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">Cargando sesiones...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-4 gap-2 text-destructive">
            <span className="text-sm">Error al cargar sesiones</span>
          </div>
        ) : sessions.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No hay sesiones
          </p>
        ) : (
          <>
            <ul className="p-1">
              {sessions.map((session) => (
                <li key={session.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                      selectedId === session.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{session.preview}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{session.messageCount} msgs</span>
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
            {isFetching && (
              <div className="flex items-center justify-center p-2 gap-1 text-xs text-muted-foreground border-t">
                <RefreshCw className="size-3 animate-spin" />
                <span>Actualizando...</span>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
