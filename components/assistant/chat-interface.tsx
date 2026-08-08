"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAssistantStore } from "@/stores/assistantStore";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { Loader2, Sparkles } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { ChatInput, ChatInputHandle, UploadedFile } from "./chat-input";
import { MessageItem } from "./message-item";

const mutationTools = [
  "generate_content",
  "update_social_profile",
  "delete_draft",
];

export const TOOL_STATUS_MESSAGES: Record<string, string> = {
  web_search: "Searching the web for the latest info...",
  generate_image: "Designing a custom image... hang on...",
  format_social_post: "Formatting your engaging post...",
  generate_reel_script: "Structuring your reel script...",
  format_reel: "Packaging your reel content...",
  generate_script_outline: "Outlining your script acts...",
  format_script: "Writing the full script narration...",
  generate_thumbnail_concept: "Generating thumbnail design concepts...",
  extract_receipt_data: "Reading receipt image...",
  read_document: "Fetching and parsing document...",
  analyze_legal_document: "Analyzing legal document...",
  send_analysis_email: "Sending analysis to client...",
};

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<UploadedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  // const activeConversationId = useAssistantStore(
  //   (state) => state.activeConversationId,
  // );
  const { mode, activeConversationId, activeConversation } =
    useAssistantStore();
  // const selectedAgentId = useAssistantStore((state) => state.selectedAgentId);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const chatTransport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/assistant/router",
      fetch: async (url, init) => {
        // .getState() bypasses React closures, guaranteeing we always have the latest ID
        // const currentId = useAssistantStore.getState().activeConversationId;
        const { activeConversationId, selectedAgent, selectedModelId } =
          useAssistantStore.getState(); // ✅ always fresh
        // --- A. INJECT THE DYNAMIC BODY ---
        // We intercept the SDK's outgoing payload to attach the ID
        const parsedBody = JSON.parse((init?.body as string) || "{}");
        parsedBody.conversationId = activeConversationId;
        parsedBody.agentId = selectedAgent?.id;
        parsedBody.modelId = selectedModelId;

        // --- B. MAKE THE REQUEST ---
        const response = await fetch(url, {
          ...init,
          body: JSON.stringify(parsedBody),
        });

        // --- C. INTERCEPT THE HEADERS (The old onResponse logic) ---
        const newChatId = response.headers.get("x-conversation-id");

        if (newChatId && !activeConversationId) {
          // Instantly write the new ID directly to the Zustand store and localStorage
          useAssistantStore.getState().setActiveConversationId(newChatId);
        }

        // You must return the raw response so the SDK can process the stream!
        return response;
      },
    });
  }, []);

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    addToolApprovalResponse,
  } = useChat({
    transport: chatTransport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onFinish: (options) => {
      setIsLoading(false);
      if (shouldRefresh) {
        // Trigger global data fetchers here
        setShouldRefresh(false);
      }
    },
    onToolCall: ({ toolCall }) => {
      if (mutationTools.includes(toolCall.toolName)) {
        setShouldRefresh(true);
      }
    },
  });

  // 2. Fetch history when the active conversation changes
  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      // 1. No Active Conversation -> Show Welcome Message
      const welcomeMessage = {
        id: "welcome-1",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "👋 Hi! I'm your Content Engine. How can I help you grow your brand today?",
          },
        ],
      };

      if (!activeConversationId) {
        setMessages([welcomeMessage as any]);
        return;
      }

      // 2. Active Conversation Exists -> Fetch History
      setIsFetchingHistory(true);
      try {
        const res = await fetch(
          `/api/assistant/history?id=${activeConversationId}`,
        );
        if (res.ok) {
          const historyData = await res.json();
          // Prevent setting state if the component unmounted while fetching
          if (isMounted) {
            setMessages(historyData.messages);
            useAssistantStore
              .getState()
              .setActiveConversation(historyData.conversation);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) setIsFetchingHistory(false);
      }
    }

    loadHistory();

    // Cleanup function to prevent race conditions if the user clicks around quickly
    return () => {
      isMounted = false;
    };

    // 👇 FIX: ONLY depend on activeConversationId. Remove setMessages to break the loop!
  }, [activeConversationId]);

  // Poll for new messages while a workflow run is active
  useEffect(() => {
    const run = activeConversation?.workflowRun;
    if (!run) return;
    if (run.status === "completed" || run.status === "failed") return;
    if (!activeConversationId) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/assistant/history?id=${activeConversationId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
        useAssistantStore.getState().setActiveConversation(data.conversation);
      } catch (err) {
        console.error("Workflow poll failed:", err);
      }
    };

    // Update tool approval status based on the workflow run status
    if (run.status === "awaiting_approval") {
      useAssistantStore.getState().setToolApprovalStatus("pending");
    } else if (run.status === "approved") {
      useAssistantStore.getState().setToolApprovalStatus("approved");
    }

    const intervalId = setInterval(poll, 3000);
    return () => clearInterval(intervalId);
  }, [activeConversationId, activeConversation?.workflowRun?.status]);

  // 👇 FIX: Derive the active tool using the new 'tool-' prefix and flattened state
  const lastMessage = messages[messages.length - 1];
  const activeToolPart =
    lastMessage?.role === "assistant"
      ? lastMessage.parts?.find((part) => {
          // 1. Must be a tool part
          if (!part.type.startsWith("tool-")) return false;

          // 2. Must be actively streaming or gathering input (not finished/error)
          const state = (part as any).state;
          return state === "input-streaming" || state === "input-available";
        })
      : null;

  // Extract the tool name by removing the 'tool-' prefix
  const activeTool = activeToolPart
    ? activeToolPart.type.replace("tool-", "")
    : null;

  useEffect(() => {
    if (isFetchingHistory) return;
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      });
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [isFetchingHistory]);

  const handleSend = () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const readyFiles = currentFiles.filter((f) => f.url && !f.uploading);
    let text = input;
    if (readyFiles.length > 0) {
      text += readyFiles
        .map((f) =>
          f.type.startsWith("image/")
            ? `\n\n![image](${f.url})`
            : `\n\n[Attached document: ${f.url}]`,
        )
        .join("");
    }

    sendMessage({ text });
    setInput("");
    chatInputRef.current?.clearFiles();
  };

  const handleWorkflowToolApproval = ({
    id,
    approved,
  }: {
    id: string;
    approved: boolean;
  }) => {
    // Set local approval status to "processing" to disable buttons and show a spinner
    useAssistantStore.getState().setToolApprovalStatus("processing");
    // Call workflow tool approval endpoint
    fetch("/api/workflows/tool-approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId: activeConversation?.workflowRun?.workflowId,
        runId: activeConversation?.workflowRun?.id,
        conversationId: activeConversation?.id,
        stepIndex: activeConversation?.workflowRun?.currentStepIndex,
        action: approved ? "approve" : "reject",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to send tool approval response");
        }
      })
      .catch((err) => {
        console.error("Error sending tool approval response:", err);
      })
      .finally(() => {
        // Reset approval status to "idle" after the response is sent
        useAssistantStore.getState().setToolApprovalStatus("idle");
      });
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col overflow-hidden">
      {isFetchingHistory ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="flex-1 px-4">
          <div
            ref={containerRef}
            className={`flex flex-col gap-6 py-6 ${mode === "full_screen" ? "px-2 md:px-4 lg:px-32" : ""}`}
          >
            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                isLastMessage={index === messages.length - 1}
                status={status}
                addToolApprovalResponse={
                  activeConversation?.workflowRun &&
                  activeConversation.workflowRun.status !== "completed"
                    ? handleWorkflowToolApproval
                    : addToolApprovalResponse
                }
              />
            ))}

            {/* Pass the derived activeTool down */}
            {(isLoading || status === "streaming") && status !== "error" && (
              <ThinkingState
                activeTool={activeTool}
                isLoading={isLoading}
                status={status}
              />
            )}

            {status === "error" && error && (
              <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-lg border p-3 text-xs">
                Connection Error: {error.message}
              </div>
            )}

            <div ref={scrollRef} className="h-4" />
          </div>
        </ScrollArea>
      )}

      <ChatInput
        ref={chatInputRef}
        input={input}
        handleInputChange={(e) => setInput(e.target.value)}
        onSubmit={handleSend}
        isLoading={isLoading}
        onFilesChange={setCurrentFiles}
      />
    </div>
  );
}

function ThinkingState({
  activeTool,
  isLoading,
  status,
}: {
  activeTool: string | null;
  isLoading: boolean;
  status: string;
}) {
  let displayMessage = "Analyzing request...";

  if (isLoading && status !== "streaming") {
    displayMessage = "Sending your message...";
  } else if (activeTool && TOOL_STATUS_MESSAGES[activeTool]) {
    displayMessage = TOOL_STATUS_MESSAGES[activeTool];
  } else if (activeTool) {
    displayMessage = `Using tool: ${activeTool}...`;
  } else if (status === "streaming") {
    displayMessage = "Generating response...";
  }

  return (
    <div className="text-muted-foreground flex animate-pulse items-center gap-2 px-12 text-xs italic transition-all duration-300">
      <Sparkles className="size-3 animate-spin text-indigo-500" />
      {displayMessage}
    </div>
  );
}
