import { useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/trpc/react"
import type { ChatSessionMetadata } from "../_store/chat-slice"
import { useChatUIStore } from "../_store/chat-slice"

export type { ChatSessionMetadata }

export function useChatSessions() {
  const utils = api.useUtils()
  const { selectedId, setSelectedId } = useChatUIStore()

  const { data: sessionList = [], isLoading, isFetching, isError } = api.admin.chat.list.useQuery()

  const createSession = api.admin.chat.create.useMutation({
    onSuccess: ({ id }) => {
      setSelectedId(id)
      void utils.admin.chat.list.invalidate()
      toast.success("Nueva sesión creada")
    },
    onError: () => {
      toast.error("No se pudo crear la sesión")
    },
  })

  const deleteSession = api.admin.chat.delete.useMutation({
    onSuccess: () => {
      void utils.admin.chat.list.invalidate()
      toast.success("Sesión eliminada")
    },
    onError: () => {
      toast.error("No se pudo eliminar la sesión")
    },
  })

  const createChat = useCallback(async () => {
    const lastSession = sessionList[0]
    if (lastSession?.messageCount === 0) {
      toast.info("Ya existe una sesión vacía", {
        description: "Usá la sesión actual antes de crear una nueva.",
      })
      setSelectedId(lastSession.id)
      return
    }
    await createSession.mutateAsync()
  }, [createSession, sessionList, setSelectedId])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteSession.mutateAsync({ id })
      if (selectedId === id) {
        setSelectedId(undefined)
      }
    },
    [selectedId, deleteSession, setSelectedId],
  )

  return {
    sessions: sessionList,
    selectedId,
    setSelectedId,
    createChat,
    handleDelete,
    isLoading,
    isFetching,
    isError,
  }
}
