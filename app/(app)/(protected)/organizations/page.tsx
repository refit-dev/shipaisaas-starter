"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Loader2, Plus } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function SyncWorkspace() {
  const router = useRouter();

  // Use the correct hook
  const { data: orgList, isPending } = authClient.useListOrganizations();

  // Track which organization the user clicked so we can show a localized loader
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelect = async (orgId: string) => {
    setSelectingId(orgId);
    try {
      // 1. Set the cookie explicitly based on user choice
      await authClient.organization.setActive({ organizationId: orgId });

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to set active organization", error);
      setSelectingId(null);
    }
  };

  // 1. Initial Loading State
  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your workspaces...
          </p>
        </div>
      </div>
    );
  }

  // 2. Hide UI momentarily if the useEffect is about to redirect them
  if (!orgList || orgList.length === 0) return null;

  // 3. The Picker UI
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md space-y-8 duration-500">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm">
            Select a workspace to continue to your dashboard.
          </p>
        </div>

        {/* Workspace List Card */}
        <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
          <div className="space-y-2">
            {orgList.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelect(org.id)}
                disabled={selectingId !== null}
                className="hover:border-border hover:bg-accent focus-visible:ring-ring flex w-full items-center justify-between rounded-lg border border-transparent p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground text-sm font-medium">
                      {org.name}
                    </p>
                    {/* Fallback to ID if slug isn't exposed in this specific hook's payload */}
                    <p className="text-muted-foreground text-xs">
                      /{(org as any).slug || org.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                {selectingId === org.id ? (
                  <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="text-muted-foreground h-5 w-5" />
                )}
              </button>
            ))}
          </div>

          {/* Create New Action */}
          <div className="border-border mt-4 border-t pt-4">
            <button
              onClick={() => router.push("/organizations/new")}
              disabled={selectingId !== null}
              className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring flex w-full items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Plus className="h-4 w-4" />
              Create a new workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
