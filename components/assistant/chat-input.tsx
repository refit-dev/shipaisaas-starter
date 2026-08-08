"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Agent, useAssistantStore } from "@/stores/assistantStore";
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Mic,
  Paperclip,
  Plus,
  Search,
  Upload,
  Workflow,
  X,
} from "lucide-react";
import { nanoid } from "nanoid";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { AGENT_REGISTRY } from "@/lib/ai/agents/registry";
import { SUPPORTED_MODELS, SupportedModelId } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { WorkflowRunningState } from "./workflow-running-state";

export interface ChatInputHandle {
  clearFiles: () => void;
}

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
  onFilesChange?: (files: UploadedFile[]) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  url?: string;
  uploading?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileEmoji(type: string) {
  if (type.startsWith("image/")) return "🖼";
  if (type === "application/pdf") return "📄";
  if (type.startsWith("text/")) return "📝";
  return "📎";
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
function ChatInput({
  input,
  handleInputChange,
  onSubmit,
  isLoading,
  placeholder = "Ask me anything or type / to use a specific agent…",
  onFilesChange,
}, ref) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"root" | "agents" | "files">(
    "root",
  );
  const [agentSearch, setAgentSearch] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const {
    mode,
    selectedAgent,
    setSelectedAgent,
    activeConversation,
    isOpen,
    selectedModelId,
    setSelectedModelId,
  } = useAssistantStore();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "54px"; // reset to min on mount
  }, []);

  // Reset height when chat opens
  useEffect(() => {
    if (!isOpen) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "54px";
  }, [isOpen]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px"; // collapse first to get accurate scrollHeight
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  useEffect(() => {
    if (transcript && listening) {
      handleInputChange({
        target: { value: transcript },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
  }, [transcript, listening, handleInputChange]);

  useEffect(() => {
    if (!dropdownOpen) {
      const t = setTimeout(() => {
        setActivePanel("root");
        setAgentSearch("");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (input.startsWith("/") && !input.includes(" ")) {
      setDropdownOpen(true);
      setActivePanel("agents");
      setAgentSearch(input.slice(1));
    }
  }, [input]);

  const filteredAgents = Object.values(AGENT_REGISTRY).filter(
    (a) =>
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.id.includes(agentSearch.toLowerCase()),
  );

  function toggleRecording() {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) onSubmit();
    }
  }

  function selectAgent(agent: Agent) {
    setSelectedAgent(agent);
    handleInputChange({
      target: { value: "/" + agent.id + " " },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    setDropdownOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function clearAgent() {
    setSelectedAgent(null);
    if (input.startsWith("/")) {
      handleInputChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
  }

  function clearFiles() {
    setUploadedFiles([]);
    onFilesChange?.([]);
  }

  useImperativeHandle(ref, () => ({ clearFiles }));

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      id: `${f.name}-${nanoid()}`,
      name: f.name,
      size: f.size,
      type: f.type,
      file: f,
      uploading: true,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    onFilesChange?.([...uploadedFiles, ...newFiles]);

    newFiles.forEach((uf) => {
      const fd = new FormData();
      fd.append("file", uf.file);
      fetch("/api/upload", { method: "POST", body: fd })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then(({ url }: { url: string }) => {
          setUploadedFiles((prev) => {
            const next = prev.map((f) =>
              f.id === uf.id ? { ...f, url, uploading: false } : f,
            );
            setTimeout(() => onFilesChange?.(next), 0);
            return next;
          });
        })
        .catch((err) => {
          console.error("[Upload] Failed:", err);
          setUploadedFiles((prev) => {
            const next = prev.map((f) =>
              f.id === uf.id ? { ...f, uploading: false } : f,
            );
            setTimeout(() => onFilesChange?.(next), 0);
            return next;
          });
        });
    });
  }

  function removeFile(id: string) {
    setUploadedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      setTimeout(() => onFilesChange?.(next), 0);
      return next;
    });
  }

  // Shared item style — uses theme tokens instead of white/X
  const itemCls =
    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] text-[13.5px] " +
    "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer select-none";

  const iconWrapCls =
    "flex items-center justify-center w-7 h-7 rounded-lg shrink-0";

  if (
    activeConversation?.workflowRun &&
    activeConversation.workflowRun.status !== "completed"
  ) {
    return (
      <WorkflowRunningState
        status={activeConversation.workflowRun?.status}
        workflowTitle={activeConversation.workflowRun?.workflow?.title}
        workflowId={activeConversation.workflowRun?.workflowId}
        currentStepIndex={activeConversation.workflowRun?.currentStepIndex}
        currentStepDescription={
          activeConversation.workflowRun?.currentStepDescription
        }
        totalSteps={activeConversation.workflowRun?.totalSteps}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={`p-3 ${mode === "full_screen" ? "px-2 md:px-4 lg:px-32" : ""}`}
      >
        <div className="bg-card focus-within:border-border relative flex flex-col gap-2 rounded-[18px] border p-2.5 transition-all">
          {/* File pills */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {uploadedFiles.map((f) => (
                <div
                  key={f.id}
                  className="bg-muted text-muted-foreground flex max-w-[200px] items-center gap-1.5 rounded-lg border px-2 py-1 text-xs"
                >
                  <span className="text-[13px] leading-none">
                    {fileEmoji(f.type)}
                  </span>
                  <span className="flex-1 truncate">{f.name}</span>
                  {f.uploading ? (
                    <Loader2 size={10} className="text-primary shrink-0 animate-spin" />
                  ) : (
                    <span className="text-muted-foreground/50 shrink-0">
                      {formatBytes(f.size)}
                    </span>
                  )}
                  <button
                    onClick={() => removeFile(f.id)}
                    className="text-muted-foreground/50 hover:text-foreground ml-0.5 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Active agent badge */}
          {selectedAgent && (
            <div className="px-1">
              <span className="border-accent bg-accent/20 text-accent-foreground inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs">
                <span className="font-mono font-medium">
                  /{selectedAgent.id}
                </span>
                <button
                  onClick={clearAgent}
                  className="text-accent-foreground/60 hover:text-accent-foreground transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            </div>
          )}

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            placeholder={
              selectedAgent ? `${selectedAgent.description}…` : placeholder
            }
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            disabled={isLoading}
            className="text-foreground placeholder:text-muted-foreground max-h-[180px] min-h-[54px] w-full resize-none overflow-y-auto border-0 bg-transparent px-1.5 py-1 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Plus dropdown */}
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-8 rounded-[10px]",
                          dropdownOpen && "bg-muted",
                        )}
                      >
                        <Plus size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Add Files
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="bg-popover z-99 w-[240px] rounded-2xl border p-1.5 shadow-lg"
                >
                  {/* ROOT */}
                  {activePanel === "root" && (
                    <>
                      <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-[10px] font-medium tracking-widest uppercase">
                        Add to message
                      </DropdownMenuLabel>

                      <button
                        onClick={() => setActivePanel("agents")}
                        className={itemCls}
                      >
                        <span className={cn(iconWrapCls, "bg-muted")}>
                          <span className="text-foreground text-base leading-none font-bold">
                            /
                          </span>
                        </span>
                        <span className="flex-1 text-left">Agents</span>
                        {selectedAgent && (
                          <span className="text-accent-foreground max-w-[72px] truncate font-mono text-[11px]">
                            /{selectedAgent.id}
                          </span>
                        )}
                        <ChevronRight
                          size={13}
                          className="text-muted-foreground shrink-0"
                        />
                      </button>

                      <button
                        onClick={() => setActivePanel("files")}
                        className={itemCls}
                      >
                        <span className={cn(iconWrapCls, "bg-muted")}>
                          <Paperclip size={13} className="text-primary" />
                        </span>
                        <span className="flex-1 text-left">Files</span>
                        {uploadedFiles.length > 0 && (
                          <span className="bg-primary/15 text-primary rounded-full px-1.5 py-0.5 text-[11px]">
                            {uploadedFiles.length}
                          </span>
                        )}
                        <ChevronRight
                          size={13}
                          className="text-muted-foreground shrink-0"
                        />
                      </button>
                    </>
                  )}

                  {/* AGENTS */}
                  {activePanel === "agents" && (
                    <>
                      <div className="flex items-center gap-1.5 px-1 pb-1.5">
                        <button
                          onClick={() => {
                            setActivePanel("root");
                            setAgentSearch("");
                          }}
                          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1 transition-colors"
                        >
                          <ChevronRight size={13} className="rotate-180" />
                        </button>
                        <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
                          Agents
                        </span>
                      </div>

                      <div className="border-border bg-muted mx-0.5 mb-1.5 flex items-center gap-2 rounded-xl border px-2.5 py-1.5">
                        <Search
                          size={12}
                          className="text-muted-foreground shrink-0"
                        />
                        <input
                          autoFocus
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                          placeholder="Search or type /agent…"
                          className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-[13px] outline-none"
                        />
                        {agentSearch && (
                          <button
                            onClick={() => setAgentSearch("")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>

                      <div className="max-h-[220px] overflow-y-auto">
                        {filteredAgents.length === 0 ? (
                          <p className="text-muted-foreground py-4 text-center text-[12px]">
                            No agents found
                          </p>
                        ) : (
                          filteredAgents.map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => selectAgent(agent)}
                              className={cn(
                                "hover:bg-muted flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] transition-colors",
                                selectedAgent?.id === agent.id && "bg-accent",
                              )}
                            >
                              <span className="text-accent-foreground w-[84px] shrink-0 truncate text-left font-mono text-[12px]">
                                /{agent.id}
                              </span>
                              <span className="min-w-0 flex-1 text-left">
                                <span className="text-foreground block text-[13px] leading-tight">
                                  {agent.name}
                                </span>
                                <span className="text-muted-foreground block truncate text-[11px]">
                                  {agent.description}
                                </span>
                              </span>
                              {selectedAgent?.id === agent.id && (
                                <span className="bg-accent-foreground h-1.5 w-1.5 shrink-0 rounded-full" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}

                  {/* FILES */}
                  {activePanel === "files" && (
                    <>
                      <div className="flex items-center gap-1.5 px-1 pb-1.5">
                        <button
                          onClick={() => setActivePanel("root")}
                          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1 transition-colors"
                        >
                          <ChevronRight size={13} className="rotate-180" />
                        </button>
                        <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
                          Files
                        </span>
                      </div>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          handleFiles(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "mx-0.5 mb-1.5 cursor-pointer rounded-xl border border-dashed",
                          "flex flex-col items-center justify-center gap-1.5 py-5 transition-colors",
                          dragOver
                            ? "border-primary/50 bg-primary/10"
                            : "border-border bg-muted/50 hover:border-border hover:bg-muted",
                        )}
                      >
                        <Upload
                          size={16}
                          className={
                            dragOver ? "text-primary" : "text-muted-foreground"
                          }
                        />
                        <p className="text-muted-foreground text-center text-[12px] leading-tight">
                          Drop files or{" "}
                          <span className="text-foreground underline underline-offset-2">
                            browse
                          </span>
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleFiles(e.target.files);
                          e.target.value = "";
                        }}
                      />

                      {uploadedFiles.length > 0 ? (
                        <div className="max-h-[160px] space-y-0.5 overflow-y-auto">
                          {uploadedFiles.map((f) => (
                            <div
                              key={f.id}
                              className="group hover:bg-muted flex items-center gap-2 rounded-[9px] px-2.5 py-1.5"
                            >
                              <span className="shrink-0 text-[13px]">
                                {fileEmoji(f.type)}
                              </span>
                              <span className="text-foreground flex-1 truncate text-[12.5px]">
                                {f.name}
                              </span>
                              <span className="text-muted-foreground shrink-0 text-[11px]">
                                {formatBytes(f.size)}
                              </span>
                              <button
                                onClick={() => removeFile(f.id)}
                                className="text-muted-foreground/50 hover:text-foreground shrink-0 opacity-0 transition-colors group-hover:opacity-100"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground py-2 text-center text-[11px]">
                          No files attached yet
                        </p>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Slash shortcut */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDropdownOpen(true);
                      setActivePanel("agents");
                    }}
                    className="size-8 rounded-[10px]"
                  >
                    /
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Slash commands
                </TooltipContent>
              </Tooltip>

              {/* Model selector */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 gap-1 rounded-[10px] px-2 text-xs"
                      >
                        <span className="max-w-[72px] truncate">
                          {SUPPORTED_MODELS.find(
                            (m) => m.id === selectedModelId,
                          )?.label ?? "Model"}
                        </span>
                        <ChevronDown size={11} className="text-muted-foreground shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Select AI model
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="z-99 w-[200px]"
                >
                  <DropdownMenuLabel className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                    AI Model
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SUPPORTED_MODELS.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() =>
                        setSelectedModelId(model.id as SupportedModelId)
                      }
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span>{model.label}</span>
                        <span className="text-muted-foreground text-[10px] capitalize">
                          {model.provider}
                        </span>
                      </div>
                      {selectedModelId === model.id && (
                        <Check size={12} className="text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {activeConversation?.workflowRun && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(
                          `/dashboard/workflows/${activeConversation?.workflowRun?.workflowId}`,
                        )
                      }
                      className="size-8 rounded-[10px]"
                    >
                      <Workflow size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Open workflow
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Mic + Send */}
            <div className="flex items-center gap-1">
              {mounted && browserSupportsSpeechRecognition && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleRecording}
                      className={cn(
                        "relative size-8 rounded-[10px] transition-all",
                        listening
                          ? "text-destructive hover:bg-destructive/10 animate-pulse"
                          : "",
                      )}
                    >
                      <Mic size={15} />
                      {listening && (
                        <span className="border-destructive/50 absolute inset-[-2px] animate-ping rounded-xl border" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {listening ? "Stop recording" : "Voice input"}
                  </TooltipContent>
                </Tooltip>
              )}

              <Button
                type="button"
                onClick={onSubmit}
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 size-8 rounded-[10px] transition-all disabled:opacity-30"
              >
                <ArrowUp
                  size={14}
                  className={cn(isLoading && "animate-spin")}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});
ChatInput.displayName = "ChatInput";
