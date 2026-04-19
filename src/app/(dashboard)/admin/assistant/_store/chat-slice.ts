import { create } from "zustand";

export interface ChatSessionMetadata {
  id: string;
  preview: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

interface ChatUIState {
  selectedId: string | undefined;
  setSelectedId: (id: string | undefined) => void;
  clearSelectedId: () => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  selectedId: undefined,
  setSelectedId: (selectedId) => set({ selectedId }),
  clearSelectedId: () => set({ selectedId: undefined }),
}));