"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardHeader } from "@/components/dashboard/header";

const EXAMPLES = [
  {
    label: "LinkedIn carousel",
    prompt:
      "Search for the top 5 AI marketing trends in 2026, generate a content outline, and draft a LinkedIn carousel with 6 slides including a hook and call-to-action.",
  },
  {
    label: "Competitor pricing report",
    prompt:
      "Extract the pricing pages from 3 SaaS competitors in my niche, compare their plans side by side, and generate a structured competitive analysis report.",
  },
  {
    label: "Blog post + hero image",
    prompt:
      "Research the future of remote work, generate a 600-word blog post outline, write the full article, and generate a matching hero image.",
  },
  {
    label: "Weekly newsletter digest",
    prompt:
      "Search for the 5 most-discussed AI stories this week, summarize each in 2 sentences, and format them into a ready-to-send newsletter digest.",
  },
  {
    label: "Cold outreach list",
    prompt:
      "Find B2B SaaS companies that raised Series A funding in the last 90 days, extract each company's homepage value proposition, and summarize them into a one-sentence pitch for cold outreach.",
  },
  {
    label: "Instagram caption batch",
    prompt:
      "Search for trending topics in sustainable fashion this month, generate 5 content angles, and draft a ready-to-publish Instagram caption for each.",
  },
] as const;

export default function NewWorkflowPage() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      if (res.ok) {
        const { workflowId } = await res.json();
        router.push(`/dashboard/workflows/${workflowId}`);
      } else {
        toast.error("Failed to start workflow.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DashboardHeader
        heading="Create Workflow"
        text="Describe your goal and let the AI generate a step-by-step execution plan."
      />

      <div className="bg-card mt-8 w-full max-w-5xl rounded-xl border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Workflow Goal
            </label>

            {/* Example prompts */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setGoal(ex.prompt)}
                    className={`border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                      goal === ex.prompt
                        ? "border-foreground/40 text-foreground bg-muted"
                        : ""
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="e.g., Research the top 5 AI marketing trends for 2026, generate an outline, and draft a LinkedIn carousel sequence..."
              className="min-h-[150px] resize-none text-base"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-[0.8rem]">
              Be as specific as possible. The AI will break this down into
              verifiable steps.
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !goal.trim()}>
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 size-4" />
              )}
              Generate Plan
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
