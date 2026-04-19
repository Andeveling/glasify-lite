import { ChatWindow } from "./_components/chat-window"
import { SessionList } from "./_components/session-list"

export default function AssistantPage() {
  return (
    <div className="flex h-full gap-4 p-4">
      <SessionList />
      <ChatWindow />
    </div>
  )
}
