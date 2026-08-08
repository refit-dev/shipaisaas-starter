import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AGENT_REGISTRY, AgentId } from "@/lib/ai/agents/registry";
import { DEFAULT_MODEL_ID, SupportedModelId } from "@/lib/ai/models";
import { Conversation } from "@/lib/db/schema/chat";

export type AssistantMode = "sidebar" | "widget" | "full_screen";
// Agent type from agents registry
export type Agent = (typeof AGENT_REGISTRY)[AgentId];

interface AssistantStore {
  isOpen: boolean;
  mode: AssistantMode;
  activeConversationId: string | null;
  activeConversation: (Conversation & { workflowRun: any }) | null;
  setIsOpen: (open: boolean) => void;
  setMode: (mode: AssistantMode) => void;
  isAssetsOpen: boolean;
  setIsAssetsOpen: (open: boolean) => void;
  toggle: () => void;
  setActiveConversationId: (id: string | null) => void;
  setActiveConversation: (
    conv: (Conversation & { workflowRun: any }) | null,
  ) => void;
  isChatListOpen: boolean;
  setIsChatListOpen: (open: boolean) => void;
  toggleChatList: () => void;
  selectedAgentId: AgentId;
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  setSelectedAgentId: (id: AgentId) => void;
  selectedModelId: SupportedModelId;
  setSelectedModelId: (id: SupportedModelId) => void;
  // Tool Approval State For Wokflow Runs
  toolApprovalStatus:
    | "idle"
    | "pending"
    | "processing"
    | "approved"
    | "rejected";
  setToolApprovalStatus: (
    status: "idle" | "pending" | "processing" | "approved" | "rejected",
  ) => void;
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
      isAssetsOpen: false,
      setIsAssetsOpen: (open) => set({ isAssetsOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setActiveConversation: (conversation) =>
        set({ activeConversation: conversation }),
      isChatListOpen: false,
      setIsChatListOpen: (open) => set({ isChatListOpen: open }),
      toggleChatList: () =>
        set((state) => ({ isChatListOpen: !state.isChatListOpen })),
      selectedAgentId: "general", // Let agent router decide by default
      setSelectedAgentId: (id) => set({ selectedAgentId: id }),
      selectedAgent: null,
      setSelectedAgent: (agent: Agent | null) => set({ selectedAgent: agent }),
      selectedModelId: DEFAULT_MODEL_ID,
      setSelectedModelId: (id) => set({ selectedModelId: id }),
      toolApprovalStatus: "idle",
      setToolApprovalStatus: (status) => set({ toolApprovalStatus: status }),
      resetAssistantStore: () =>
        set({
          isOpen: false,
          activeConversationId: null,
          activeConversation: null,
          selectedAgent: null,
        }),
    }),
    {
      name: "assistant-storage", // Saves the active chat ID automatically!
    },
  ),
);
