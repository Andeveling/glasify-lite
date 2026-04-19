"use client";

import { useCallback, useEffect, useState } from "react";

import type { RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/react";

export type ChatSessionMetadata = RouterOutputs["admin"]["chat"]["list"][number];

export function useChatSessions() {
  const utils = api.useUtils();
  const {
    data: sessionList = [],
    isLoading,
    isFetching,
    isError,
  } = api.admin.chat.list.useQuery();
  const deleteSession = api.admin.chat.delete.useMutation({
    onSuccess: () => {
      void utils.admin.chat.list.invalidate();
    },
  });

  const [sessions, setSessions] = useState<ChatSessionMetadata[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const createChat = useCallback(async () => {
    const res = await fetch("/api/chat", { method: "POST" });
    if (res.ok) {
      const { id }: { id: string } = await res.json();
      setSelectedId(id);
      void utils.admin.chat.list.invalidate();
    }
  }, [utils]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("¿Eliminar esta sesión?")) return;
      await deleteSession.mutateAsync({ id });
      if (selectedId === id) {
        setSelectedId(undefined);
      }
    },
    [selectedId, deleteSession],
  );

  useEffect(() => {
    if (sessionList) {
      setSessions(sessionList);
    }
  }, [sessionList]);

  return {
    sessions,
    selectedId,
    setSelectedId,
    createChat,
    handleDelete,
    isLoading,
    isFetching,
    isError,
  };
}
