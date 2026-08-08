"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNewWorkspace } from "@/actions/organizations";
import { ArrowRight, Building2, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    // 1. Create the org in the database
    const result = await createNewWorkspace(name);

    if (result.error || !result.teamId) {
      setError(result.error || "An unexpected error occurred.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Set this brand new org as the active session
      await authClient.organization.setActive({
        organizationId: result.teamId,
      });

      // 3. Redirect to your onboarding flow to fill in the rest of the details
      router.push("/onboarding");
    } catch (authError) {
      console.error("Failed to set active organization", authError);
      setError(
        "Workspace created, but failed to switch context. Please refresh.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md space-y-8 duration-500">
        <div className="space-y-2 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Create a Workspace
          </h1>
          <p className="text-muted-foreground text-sm">
            What should we call your new team or company?
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-foreground mb-3 text-sm leading-none font-medium"
              >
                Workspace Name
              </label>
              <input
                id="name"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              />
              {error && (
                <p className="text-destructive mt-2 text-sm font-medium">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-10 w-full items-center justify-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
