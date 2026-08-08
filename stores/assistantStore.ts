import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_MODEL_ID, SupportedModelId } from "@/lib/ai/models";
import { Conversation } from "@/lib/db/schema/chat";

export type AssistantMode = "sidebar" | "widget" | "full_screen";

interface AssistantStore {
  isOpen: boolean;
  mode: AssistantMode;
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  setIsOpen: (open: boolean) => void;
  setMode: (mode: AssistantMode) => void;
  toggle: () => void;
  setActiveConversationId: (id: string | null) => void;
  setActiveConversation: (conv: Conversation | null) => void;
  isChatListOpen: boolean;
  setIsChatListOpen: (open: boolean) => void;
  toggleChatList: () => void;
  selectedModelId: SupportedModelId;
  setSelectedModelId: (id: SupportedModelId) => void;
  resetAssistantStore: () => void;
}

export const useAssistantStore = create<AssistantStore>()(
  persist(
    (set) => ({
      isOpen: false,
      mode: "widget",
      activeConversationId: null,
      activeConversation: null,
      setIsOpen: (open) => set({ isOpen: open }),
      setMode: (mode) => set({ mode }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setActiveConversation: (conversation) =>
        set({ activeConversation: conversation }),
      isChatListOpen: false,
      setIsChatListOpen: (open) => set({ isChatListOpen: open }),
      toggleChatList: () =>
        set((state) => ({ isChatListOpen: !state.isChatListOpen })),
      selectedModelId: DEFAULT_MODEL_ID,
      setSelectedModelId: (id) => set({ selectedModelId: id }),
      resetAssistantStore: () =>
        set({
          isOpen: false,
          activeConversationId: null,
          activeConversation: null,
        }),
    }),
    {
      name: "assistant-storage", // Saves the active chat ID automatically!
    },
  ),
);
