import { useCallback } from "react";

import type { ChatSessionMetadata } from "../_store/chat-slice";
import { api } from "@/trpc/react";
import { useChatUIStore } from "../_store/chat-slice";

export type { ChatSessionMetadata };

export function useChatSessions() {
  const utils = api.useUtils();
  const { selectedId, setSelectedId } = useChatUIStore();

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

  const createChat = useCallback(async () => {
    const res = await fetch("/api/chat", { method: "POST" });
    if (res.ok) {
      const { id }: { id: string } = await res.json();
      setSelectedId(id);
      void utils.admin.chat.list.invalidate();
    }
  }, [utils, setSelectedId]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("¿Eliminar esta sesión?")) return;
      await deleteSession.mutateAsync({ id });
      if (selectedId === id) {
        setSelectedId(undefined);
      }
    },
    [selectedId, deleteSession, setSelectedId],
  );

  return {
    sessions: sessionList,
    selectedId,
    setSelectedId,
    createChat,
    handleDelete,
    isLoading,
    isFetching,
    isError,
  };
}