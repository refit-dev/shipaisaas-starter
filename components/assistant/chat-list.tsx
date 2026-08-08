"use client";

import { useEffect, useState } from "react";
import { useAssistantStore } from "@/stores/assistantStore";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import { Conversation } from "@/lib/db/schema/chat";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // State to control which conversation the alert dialog targets
  const [chatToDelete, setChatToDelete] = useState<Conversation | null>(null);

  const {
    activeConversationId,
    setActiveConversationId,
    setActiveConversation,
    setIsChatListOpen,
  } = useAssistantStore();

  useEffect(() => {
    fetchConversations();
  }, [activeConversationId]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelect = (conv: Conversation) => {
    setActiveConversationId(conv.id.toString());
    setActiveConversation(conv as any);
    setIsChatListOpen(false);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setActiveConversation(null);
    setIsChatListOpen(false);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/chat/conversations?id=${chatToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        // 1. Remove it from the local list UI instantly
        setConversations((prev) =>
          prev.filter((c) => c.id !== chatToDelete.id),
        );

        // 2. If they deleted the chat they are currently viewing, clear the screen!
        if (activeConversationId === chatToDelete.id.toString()) {
          setActiveConversationId(null);
          setActiveConversation(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    } finally {
      setIsDeleting(false);
      setChatToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-background absolute inset-x-0 top-0 bottom-0 z-40 flex flex-col border-t shadow-lg">
        <div className="border-b p-4">
          <Button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2"
          >
            <Plus className="size-4" />
            New Conversation
          </Button>
        </div>

        <ScrollArea className="flex-1 p-2">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">
              No conversations yet.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  role="button"
                  onClick={() => handleSelect(conv)}
                  className={cn(
                    "group hover:bg-muted/50 relative flex w-full items-center justify-between overflow-hidden rounded-md px-3 py-2 text-sm transition-colors",
                    activeConversationId === conv.id.toString() && "bg-muted",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center overflow-hidden pr-2">
                    <MessageSquare className="mr-3 size-4 shrink-0 opacity-50" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{conv.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* 3 Dots Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        onClick={(e) => e.stopPropagation()} // Stop row click
                      >
                        <MoreHorizontal className="text-muted-foreground size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-99 w-40">
                      {/* Space for future items like 'Rename' */}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive flex cursor-pointer items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop row click
                          setChatToDelete(conv); // Trigger the modal
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={!!chatToDelete}
        onOpenChange={() => setChatToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation{" "}
              <strong>&quot;{chatToDelete?.title}&quot;</strong> and remove its data from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault(); // Prevent modal from closing immediately
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
