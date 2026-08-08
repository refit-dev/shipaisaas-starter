"use client";

import { useEffect, useState } from "react";
import { useAssistantStore } from "@/stores/assistantStore";
import { formatDistanceToNow } from "date-fns";
import { Bot, Loader2, MessageSquare, Plus, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Task = {
  id: string;
  title: string;
  type: "task" | "workflow";
  preview: string | null;
  lastMessageAt: string;
  lastMessageRole: "user" | "assistant" | null;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// TasksClient
// ---------------------------------------------------------------------------

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    setActiveConversation,
    setActiveConversationId,
    setMode,
    setIsOpen,
    activeConversationId,
  } = useAssistantStore();

  const activeId = activeConversationId ? activeConversationId : null;

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then(setTasks)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleOpen = (task: Task) => {
    setActiveConversationId(task.id.toString());
    setActiveConversation(task as any);
    setMode("sidebar");
    setIsOpen(true);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMode("sidebar");
    setIsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground size-4 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="messageSquare" />
        <EmptyPlaceholder.Title>No tasks yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          Start a conversation with the AI assistant to create your first task.
        </EmptyPlaceholder.Description>
        <Button
          className="mt-4 flex cursor-pointer items-center gap-2"
          onClick={handleNewChat}
        >
          <Plus className="size-4" />
          New task
        </Button>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="mt-6">
      {/* Column headers */}
      <div className="text-muted-foreground mb-1 hidden items-center gap-4 px-4 text-[11px] font-semibold tracking-widest uppercase sm:grid sm:grid-cols-[minmax(0,1fr)_100px_130px]">
        <span>Task</span>
        <span>Type</span>
        <span>Last activity</span>
      </div>

      <div className="divide-y overflow-hidden rounded-lg border">
        {tasks.map((task) => {
          const isActive = activeId === task.id;

          return (
            <button
              key={task.id}
              onClick={() => handleOpen(task)}
              className={cn(
                "group flex w-full min-w-0 cursor-pointer flex-col gap-2 px-4 py-3.5 text-left transition-colors sm:grid sm:grid-cols-[minmax(0,1fr)_100px_130px] sm:items-center sm:gap-4",
                isActive ? "bg-muted" : "bg-card hover:bg-muted/40",
              )}
            >
              {/* Title + preview */}
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="bg-primary size-1.5 shrink-0 rounded-full" />
                  )}
                  <p
                    className={cn(
                      "group-hover:text-primary truncate text-sm font-medium transition-colors",
                    )}
                  >
                    {task.title}
                  </p>
                </div>

                {task.preview && (
                  <div className="mt-0.5 flex items-start gap-1.5">
                    {task.lastMessageRole === "assistant" ? (
                      <Bot className="text-muted-foreground mt-0.5 size-3 shrink-0" />
                    ) : task.lastMessageRole === "user" ? (
                      <User className="text-muted-foreground mt-0.5 size-3 shrink-0" />
                    ) : null}
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {task.preview}
                    </p>
                  </div>
                )}
              </div>

              {/* Niche badge + date — stacked inline on mobile */}
              <div className="flex items-center justify-between sm:contents">
                <TypeBadge type={task.type} />

                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(task.lastMessageAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: "task" | "workflow" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
        type === "workflow"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      {type}
    </span>
  );
}
