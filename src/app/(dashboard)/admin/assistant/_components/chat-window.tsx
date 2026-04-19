"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport, isFileUIPart, isTextUIPart } from "ai";
import { Bot } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Attachment,
  AttachmentPreview,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Persona, type PersonaState } from "@/components/ai-elements/persona";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import { useChatSessions } from "../_hooks/use-chat-sessions";
import { useChatUIStore } from "../_store/chat-slice";
import { WaitingDots } from "./WaitingDots";

type MessageListProps = {
  messages: UIMessage[];
};

function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <ConversationEmptyState
        icon={<Bot className="size-12" />}
        title="Asistente IA"
        description="Esta sesión está vacía."
      />
    );
  }

  return (
    <>
      {messages.map((message) => (
        <Message key={message.id} from={message.role}>
          <MessageContent>
            <MessageResponse>
              {message.parts
                .filter(isTextUIPart)
                .map((part) => part.text)
                .join("")}
            </MessageResponse>
            <Attachments variant="grid">
              {message.parts.filter(isFileUIPart).map((part, index) => (
                <Attachment
                  key={`${message.id}-attachment-${index}`}
                  data={{
                    ...part,
                    id: `${message.id}-attachment-${index}`,
                  }}
                >
                  <AttachmentPreview />
                </Attachment>
              ))}
            </Attachments>
          </MessageContent>
        </Message>
      ))}
    </>
  );
}

export function ChatWindow() {
  const { sessions } = useChatSessions();
  const { selectedId, setSelectedId } = useChatUIStore();
  const utils = api.useUtils();
  const [currentState, setCurrentState] = useState<PersonaState>("idle");

  const pendingMessageRef = useRef<PromptInputMessage | null>(null);
  const skipLoadRef = useRef(false);
  const sendMessageRef = useRef<typeof sendMessage | null>(null);

  const chatById = api.admin.chat.byId.useQuery(
    { id: selectedId },
    {
      enabled: !!selectedId && !skipLoadRef.current,
    },
  );

  const createSession = api.admin.chat.create.useMutation({
    onSuccess: ({ id }) => {
      setSelectedId(id);
      void utils.admin.chat.list.invalidate();
    },
  });

  const { messages, status, error, sendMessage, stop, setMessages } = useChat({
    id: selectedId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: () => {
      void utils.admin.chat.list.invalidate();
      void chatById.refetch();
    },
  });

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const isGenerating = status === "submitted" || status === "streaming";

  const lastLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (chatById.data && selectedId && selectedId !== lastLoadedRef.current) {
      lastLoadedRef.current = selectedId;
      setMessages(chatById.data);
    } else if (!selectedId) {
      lastLoadedRef.current = null;
    }
  }, [selectedId, chatById.data, setMessages]);

  useEffect(() => {
    if (selectedId) {
      if (skipLoadRef.current) {
        skipLoadRef.current = false;
        return;
      }
      if (selectedId !== lastLoadedRef.current) {
        void chatById.refetch();
      }
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, chatById.refetch, setMessages]);

  useEffect(() => {
    if (!selectedId || !pendingMessageRef.current) return;
    const msg = pendingMessageRef.current;
    pendingMessageRef.current = null;
    setCurrentState("thinking");
    sendMessageRef.current?.(msg).then(() => setCurrentState("idle"));
  }, [selectedId]);

  const onSubmit = (message: PromptInputMessage) => {
    if (!message.text && !message.files?.length) return;

    if (!selectedId) {
      pendingMessageRef.current = message;
      skipLoadRef.current = true;
      createSession.mutate();
      return Promise.resolve();
    }

    setCurrentState("thinking");
    sendMessage(message).then(() => setCurrentState("idle"));
    return Promise.resolve();
  };

  const selectedSession = sessions.find((s) => s.id === selectedId);

  return (
    <div className="flex-1 flex flex-col rounded-lg border overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Bot className="size-5" />
        <h1 className="font-semibold">Asistente</h1>
        {selectedId && (
          <span className="ml-auto text-xs text-muted-foreground">
            {selectedSession?.preview ?? selectedId}
          </span>
        )}
      </div>

      <Conversation>
        <ScrollArea className="h-full">
          <ConversationContent>
            <MessageList messages={messages} />
            <div className="flex justify-between">
              <Persona
                className="size-14 animate-pulse"
                state={currentState}
                variant="glint"
              />
              {isGenerating && <WaitingDots />}
            </div>
          </ConversationContent>
        </ScrollArea>
        <ConversationScrollButton />
      </Conversation>

      {error && (
        <div className="border-t px-4 py-2 text-sm text-destructive">
          Error: {error.message}
        </div>
      )}

      <div className="border-t p-4">
        <PromptInputProvider>
          <PromptInput globalDrop multiple onSubmit={onSubmit}>
            <PromptInputHeader />
            <PromptInputBody>
              <PromptInputTextarea placeholder="Escribí tu mensaje..." />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                    <PromptInputActionAddScreenshot />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <PromptInputSubmit
                status={status}
                onStop={isGenerating ? stop : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  );
}
