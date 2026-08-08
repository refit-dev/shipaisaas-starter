"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAssistantStore } from "@/stores/assistantStore";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Sparkles } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { ChatInput, ChatInputHandle, UploadedFile } from "./chat-input";
import { MessageItem } from "./message-item";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<UploadedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const { mode, activeConversationId } = useAssistantStore();
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const chatTransport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, init) => {
        // .getState() bypasses React closures, guaranteeing the latest values
        const { activeConversationId, selectedModelId } =
          useAssistantStore.getState();

        // Attach the conversation and model to the SDK's outgoing payload
        const parsedBody = JSON.parse((init?.body as string) || "{}");
        parsedBody.conversationId = activeConversationId;
        parsedBody.modelId = selectedModelId;

        const response = await fetch(url, {
          ...init,
          body: JSON.stringify(parsedBody),
        });

        // The server returns the conversation id it created on the first message
        const newChatId = response.headers.get("x-conversation-id");
        if (newChatId && !activeConversationId) {
          useAssistantStore.getState().setActiveConversationId(newChatId);
        }

        return response;
      },
    });
  }, []);

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: chatTransport,
    onFinish: () => setIsLoading(false),
  });

  // Load history whenever the active conversation changes
  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!activeConversationId) {
        setMessages([
          {
            id: "welcome-1",
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "👋 Hi! I'm your AI assistant. What can I help you with today?",
              },
            ],
          } as any,
        ]);
        return;
      }

      setIsFetchingHistory(true);
      try {
        const res = await fetch(`/api/chat/history?id=${activeConversationId}`);
        if (res.ok) {
          const historyData = await res.json();
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

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // Keep the view pinned to the newest message
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
              />
            ))}

            {(isLoading || status === "streaming") && status !== "error" && (
              <ThinkingState isLoading={isLoading} status={status} />
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
  isLoading,
  status,
}: {
  isLoading: boolean;
  status: string;
}) {
  let displayMessage = "Analyzing request...";

  if (isLoading && status !== "streaming") {
    displayMessage = "Sending your message...";
  } else if (status === "streaming") {
    displayMessage = "Generating response...";
  }

  return (
    <div className="text-muted-foreground flex animate-pulse items-center gap-2 px-12 text-xs italic transition-all duration-300">
      <Sparkles className="text-primary size-3 animate-spin" />
      {displayMessage}
    </div>
  );
}
