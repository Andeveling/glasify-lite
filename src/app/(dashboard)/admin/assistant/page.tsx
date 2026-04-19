"use client";

import { ChatWindow } from "./_components/chat-window";
import { SessionList } from "./_components/session-list";
import { useChatSessions } from "./_hooks/use-chat-sessions";

export default function AssistantPage() {
  const {
    sessions,
    createChat,
    handleDelete,
    isLoading,
    isFetching,
    isError,
  } = useChatSessions();

  return (
    <div className="flex h-full gap-4 p-4">
      <SessionList
        sessions={sessions}
        onCreate={createChat}
        onDelete={handleDelete}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
      />
      <ChatWindow sessions={sessions} />
    </div>
  );
}