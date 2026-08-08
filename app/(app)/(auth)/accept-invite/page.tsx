"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";

function AcceptInviteLogic() {
  const t = useTranslations("auth.acceptInvite");
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("id");

  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  // NEW: Add a ref to prevent double-firing
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (isPending) return;

    if (!inviteId) {
      router.push("/dashboard");
      return;
    }

    // SCENARIO 1: The user is NOT logged in.
    if (!session?.user) {
      router.push(`/login?inviteId=${inviteId}`);
      return;
    }

    // NEW: Prevent double-fire if we already started the accept process
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    // SCENARIO 2: The user IS logged in. Accept the invite.
    const accept = async () => {
      try {
        const { data, error: acceptError } =
          await authClient.organization.acceptInvitation({
            invitationId: inviteId,
          });

        if (acceptError) {
          setError(t("errorAccept"));
          return;
        }

        toast.success("Invitation accepted!");

        // Optionally set the new team as active immediately
        await authClient.organization.setActive({
          organizationId: data.invitation.organizationId,
        });

        // Use hard redirect to clear caches and load the new workspace
        window.location.href = "/dashboard";
      } catch (err) {
        setError(t("errorAccept"));
      }
    };

    accept();
  }, [session, isPending, inviteId, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-foreground text-xl font-bold">
          {t("invalidTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-primary text-primary-foreground mt-4 rounded-md px-4 py-2 text-sm font-medium"
        >
          {t("goToDashboard")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      <h1 className="text-foreground text-xl font-bold">
        {t("joiningTitle")}
      </h1>
      <p className="text-muted-foreground text-sm">
        {t("joiningSubtitle")}
      </p>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      {/* Suspense is required by Next.js when using useSearchParams() */}
      <Suspense
        fallback={<Loader2 className="text-primary h-8 w-8 animate-spin" />}
      >
        <AcceptInviteLogic />
      </Suspense>
    </div>
  );
}
