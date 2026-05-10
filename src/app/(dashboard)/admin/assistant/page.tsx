import { ChatWindow } from "./_components/chat-window"
import { SessionList } from "./_components/session-list"
import { ChatProvider } from "./_context/chat-context"

export default function AssistantPage() {
  return (
    <ChatProvider>
      <div className="flex gap-4 p-4" style={{ maxHeight: "92dvh" }}>
        <SessionList />
        <ChatWindow />
      </div>
    </ChatProvider>
  )
}
