"use client";

import { AssistantMode, useAssistantStore } from "@/stores/assistantStore";
import {
  Expand,
  MessageSquareText,
  PanelRight,
  Shrink,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

import { ChatInterface } from "./chat-interface";
import { ChatList } from "./chat-list";

export function AssistantContainer() {
  const { isOpen, mode, setIsOpen, toggle, setMode, isChatListOpen } =
    useAssistantStore();

  const onSetMode = (mode: AssistantMode) => {
    setMode(mode);
  };

  const { isDesktop } = useMediaQuery();
  const effectiveMode = !isDesktop ? "full_screen" : mode;

  const contentMarkup = (
    <>
      <AssistantHeader
        showClose={true}
        mode={mode}
        onClose={() => setIsOpen(false)}
        onSetMode={onSetMode}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatInterface />
        </div>

        {/* Chat list overlay */}
        <div
          className={cn(
            "transition duration-100",
            isChatListOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <ChatList />
        </div>
      </div>
    </>
  );

  if (effectiveMode === "sidebar" || effectiveMode === "full_screen") {
    const modeClassName =
      effectiveMode === "full_screen"
        ? "fixed top-0 bottom-0 right-0 z-[99] w-full lg:w-[calc(100vw-var(--sidebar-width,260px)-10px)]"
        : "w-full lg:w-[400px] border-l";

    return (
      <>
        <aside
          className={cn(
            "bg-background sticky top-0 z-99 h-screen shrink-0 transition-all duration-300 ease-in-out",
            isOpen ? modeClassName : "w-0 overflow-hidden border-none",
          )}
        >
          <div className="flex h-screen flex-col">{contentMarkup}</div>
        </aside>

        <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-4">
          {!isOpen && (
            <Button
              size="icon"
              rounded="full"
              className="bg-primary size-14 shadow-lg transition-transform hover:scale-110"
              onClick={toggle}
            >
              <Sparkles className="size-6 fill-white" />
            </Button>
          )}
        </div>
      </>
    );
  }

  // Widget mode
  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-4">
      <div
        className={cn(
          "bg-background animate-in fade-in zoom-in-95 absolute bottom-0 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border shadow-2xl transition duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {contentMarkup}
      </div>
      {!isOpen && (
        <Button
          size="icon"
          rounded="full"
          className="bg-primary size-14 shadow-lg transition-transform hover:scale-110"
          onClick={toggle}
        >
          <Sparkles className="size-6 fill-white" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssistantHeader
// ---------------------------------------------------------------------------

function AssistantHeader({
  showClose,
  onClose,
  onSetMode,
  mode,
}: {
  showClose?: boolean;
  onClose?: () => void;
  onSetMode: (mode: AssistantMode) => void;
  mode: AssistantMode;
}) {
  const { activeConversation, toggleChatList, isChatListOpen } =
    useAssistantStore();
  const { isDesktop } = useMediaQuery();
  const effectiveMode = !isDesktop ? "full_screen" : mode;

  return (
    <div
      className={cn(
        "z-99 flex h-14 shrink-0 items-center justify-between px-4",
        mode !== "full_screen" && "border-b",
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-2 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8 shrink-0", isChatListOpen && "bg-muted")}
          onClick={toggleChatList}
        >
          <MessageSquareText size={16} />
        </Button>

        <span className="text-muted-foreground truncate text-xs font-medium">
          {activeConversation?.title || "New Chat"}
        </span>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Only show mode switchers on desktop */}
        {isDesktop && (
          <>
            {effectiveMode === "full_screen" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSetMode("widget")}
                className="size-8"
              >
                <Shrink size={16} />
              </Button>
            )}
            {effectiveMode === "sidebar" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSetMode("full_screen")}
                className="size-8"
              >
                <Expand size={16} />
              </Button>
            )}
            {effectiveMode === "widget" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSetMode("sidebar")}
                className="size-8"
              >
                <PanelRight size={16} />
              </Button>
            )}
          </>
        )}

        {showClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
