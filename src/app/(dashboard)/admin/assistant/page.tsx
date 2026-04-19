import { ChatWindow } from "./_components/chat-window";
import { SessionList } from "./_components/session-list";

export default function AssistantPage() {
  return (
    <div
      className="flex  gap-4 p-4"
      style={{
        maxHeight: "92dvh",
      }}
    >
      <SessionList />
      <ChatWindow />
    </div>
  );
}
