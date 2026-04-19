"use client";

import { ChatWindow } from "./_components/chat-window";
import { SessionList } from "./_components/session-list";
import { useChatSessions } from "./_hooks/use-chat-sessions";

export default function AssistantPage() {
  const {
    sessions,
    selectedId,
    setSelectedId,
    createChat,
    handleDelete,
    isLoading,
    isFetching,
    isError,
  } = useChatSessions();

  const selectedSession = sessions.find((s) => s.id === selectedId);

  return (
    <div className="flex h-full gap-4 p-4">
      <SessionList
        sessions={sessions}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={createChat}
        onDelete={handleDelete}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
      />
      <ChatWindow selectedId={selectedId} session={selectedSession} />
    </div>
  );
}
