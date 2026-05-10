"use client";

import { useChat } from "@ai-sdk/react";
import type { ChatStatus, UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { PersonaState } from "@/components/ai-elements/persona";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { api } from "@/trpc/react";

export interface ChatSessionMetadata {
  id: string;
  preview: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

interface ChatContextValue {
  sessions: ChatSessionMetadata[];
  selectedId: string | undefined;
  selectedSession: ChatSessionMetadata | undefined;
  setSelectedId: (id: string | undefined) => void;
  createChat: () => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  submitMessage: (message: PromptInputMessage) => Promise<void>;
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | null;
  isLoadingSessions: boolean;
  isFetchingSessions: boolean;
  hasSessionListError: boolean;
  isGenerating: boolean;
  currentState: PersonaState;
  stop: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const utils = api.useUtils();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [currentState, setCurrentState] = useState<PersonaState>("idle");

  const pendingMessageRef = useRef<PromptInputMessage | null>(null);
  const skipLoadRef = useRef(false);
  const sendMessageRef = useRef<
    ((message: PromptInputMessage) => Promise<void>) | null
  >(null);
  const lastLoadedSessionRef = useRef<string | null>(null);

  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    isFetching: isFetchingSessions,
    isError: hasSessionListError,
  } = api.admin.chat.list.useQuery();

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedId),
    [sessions, selectedId],
  );

  const chatById = api.admin.chat.byId.useQuery(
    { id: selectedId ?? "" },
    {
      enabled: Boolean(selectedId) && !skipLoadRef.current,
    },
  );

  const createSession = api.admin.chat.create.useMutation({
    onSuccess: ({ id }) => {
      setSelectedId(id);
      void utils.admin.chat.list.invalidate();
    },
    onError: () => {
      toast.error("No se pudo crear la sesión");
    },
  });

  const deleteSession = api.admin.chat.delete.useMutation({
    onSuccess: () => {
      void utils.admin.chat.list.invalidate();
      toast.success("Sesión eliminada");
    },
    onError: () => {
      toast.error("No se pudo eliminar la sesión");
    },
  });

  const { messages, status, error, sendMessage, stop, setMessages } = useChat({
    id: selectedId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: () => {
      void utils.admin.chat.list.invalidate();
      if (selectedId) {
        void chatById.refetch();
      }
    },
  });

  useEffect(() => {
    sendMessageRef.current = sendMessage as (
      message: PromptInputMessage,
    ) => Promise<void>;
  }, [sendMessage]);

  useEffect(() => {
    if (!selectedId) {
      lastLoadedSessionRef.current = null;
      return;
    }

    if (chatById.data && selectedId !== lastLoadedSessionRef.current) {
      lastLoadedSessionRef.current = selectedId;
      setMessages(chatById.data);
    }
  }, [chatById.data, selectedId, setMessages]);

  useEffect(() => {
    if (!selectedId) {
      lastLoadedSessionRef.current = null;
      setMessages([]);
      return;
    }

    if (skipLoadRef.current) {
      skipLoadRef.current = false;
      return;
    }

    if (selectedId !== lastLoadedSessionRef.current) {
      void chatById.refetch();
    }
  }, [chatById, selectedId, setMessages]);

  useEffect(() => {
    if (!selectedId || !pendingMessageRef.current) {
      return;
    }

    const pendingMessage = pendingMessageRef.current;
    pendingMessageRef.current = null;
    setCurrentState("thinking");

    sendMessageRef.current?.(pendingMessage).finally(() => {
      setCurrentState("idle");
    });
  }, [selectedId]);

  const createChat = useCallback(async () => {
    const latestSession = sessions[0];

    if (latestSession?.messageCount === 0) {
      toast.info("Ya existe una sesión vacía", {
        description: "Usá la sesión actual antes de crear una nueva.",
      });
      setSelectedId(latestSession.id);
      return;
    }

    await createSession.mutateAsync();
    toast.success("Nueva sesión creada");
  }, [createSession, sessions]);

  const deleteChat = useCallback(
    async (id: string) => {
      await deleteSession.mutateAsync({ id });

      if (selectedId === id) {
        setSelectedId(undefined);
      }
    },
    [deleteSession, selectedId],
  );

  const submitMessage = useCallback(
    async (message: PromptInputMessage) => {
      if (!message.text && !message.files?.length) {
        return;
      }

      if (!selectedId) {
        pendingMessageRef.current = message;
        skipLoadRef.current = true;
        await createSession.mutateAsync();
        return;
      }

      setCurrentState("thinking");

      await sendMessage(message).finally(() => {
        setCurrentState("idle");
      });
    },
    [createSession, selectedId, sendMessage],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      sessions,
      selectedId,
      selectedSession,
      setSelectedId,
      createChat,
      deleteChat,
      submitMessage,
      messages,
      status,
      error: error ?? null,
      isLoadingSessions,
      isFetchingSessions,
      hasSessionListError,
      isGenerating: status === "submitted" || status === "streaming",
      currentState,
      stop,
    }),
    [
      createChat,
      currentState,
      deleteChat,
      error,
      hasSessionListError,
      isFetchingSessions,
      isLoadingSessions,
      messages,
      selectedId,
      selectedSession,
      sessions,
      status,
      stop,
      submitMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }

  return context;
}
