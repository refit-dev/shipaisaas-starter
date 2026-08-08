"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";

type Mode = "password" | "magic-link";

export function SignUpForm() {
  const t       = useTranslations("auth.signup");
  const tCommon = useTranslations("common");

  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect  = searchParams.get("redirect");
  const priceId   = searchParams.get("priceId");
  const inviteId  = searchParams.get("inviteId");

  const [mode, setMode]                     = useState<Mode>("password");
  const [error, setError]                   = useState<string | null>(null);
  const [isEmailPending, setIsEmailPending]   = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [magicLinkSent, setMagicLinkSent]     = useState(false);
  const [magicLinkEmail, setMagicLinkEmail]   = useState("");

  const isAnyPending = isEmailPending || isGooglePending;

  const getCallbackUrl = () => {
    let url = redirect || "/onboarding";
    if (priceId) url += `?priceId=${priceId}`;
    return url;
  };

  const switchMode = (next: Mode) => { setMode(next); setError(null); };

  async function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsEmailPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email    = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name     = formData.get("name") as string;

    const { error: signUpError } = await authClient.signUp.email({ email, password, name });

    if (signUpError) {
      setError(t("errorGeneral"));
      setIsEmailPending(false);
      return;
    }

    if (inviteId) {
      const { error: inviteError } = await authClient.organization.acceptInvitation({ invitationId: inviteId });
      if (inviteError) console.error("Failed to accept invitation:", inviteError);
    }

    router.push(`/verify-email?email=${email}&redirect=${encodeURIComponent(getCallbackUrl())}`);
  }

  async function onMagicLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsEmailPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email    = formData.get("email") as string;

    const { error: mlError } = await authClient.signIn.magicLink({ email, callbackURL: getCallbackUrl() });

    if (mlError) {
      setError(t("errorGeneral"));
      setIsEmailPending(false);
      return;
    }

    setMagicLinkEmail(email);
    setMagicLinkSent(true);
    setIsEmailPending(false);
  }

  const handleGoogleSignIn = async () => {
    setIsGooglePending(true);
    await authClient.signIn.social({ provider: "google", callbackURL: redirect || "/dashboard" });
  };

  if (magicLinkSent) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {t("checkInbox")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("magicLinkSentTo", { email: magicLinkEmail })}
          </p>
        </div>

        <div className="border border-dashed border-border bg-background grid gap-4 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <Mail className="text-primary size-5" />
            </div>
            <p className="text-muted-foreground max-w-xs text-center text-sm">
              {t("magicLinkExpiry")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setMagicLinkSent(false); setMagicLinkEmail(""); }}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full cursor-pointer")}
          >
            {t("backToSignUp")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {mode === "magic-link" ? t("subtitleMagicLink") : t("subtitlePassword")}
        </p>
      </div>

      <div className="border border-dashed border-border bg-background grid gap-6 p-6 sm:p-8">
        {mode === "magic-link" ? (
          <form className="grid gap-5" onSubmit={onMagicLinkSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="ml-email">{t("emailLabel")}</Label>
              <Input id="ml-email" name="email" type="email" placeholder={t("emailPlaceholder")}
                required maxLength={50} disabled={isEmailPending} className="bg-muted" autoFocus />
            </div>

            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">{error}</div>}

            <button type="submit"
              className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
              disabled={isEmailPending}
            >
              {isEmailPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
              {isEmailPending ? t("sendingMagicLink") : t("sendMagicLink")}
            </button>

            <button type="button" onClick={() => switchMode("password")}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-center text-sm transition-colors">
              {t("switchToPassword")}
            </button>
          </form>
        ) : (
          <form className="grid gap-5" onSubmit={onPasswordSubmit}>
            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">{error}</div>}

            <div className="grid gap-2">
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input id="name" name="name" type="text" placeholder={t("namePlaceholder")}
                required maxLength={50} disabled={isAnyPending} className="bg-muted" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")}
                required maxLength={50} disabled={isAnyPending} className="bg-muted" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input id="password" name="password" type="password" placeholder={t("passwordPlaceholder")}
                required minLength={8} maxLength={100} disabled={isAnyPending} className="bg-muted" />
              <p className="text-muted-foreground text-[13px]">{t("passwordHint")}</p>
            </div>

            <button type="submit"
              className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
              disabled={isAnyPending}
            >
              {isEmailPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEmailPending ? t("creatingAccount") : t("createAccount")}
            </button>

            <button type="button" onClick={() => switchMode("magic-link")}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-center text-sm transition-colors">
              {t("switchToMagicLink")}
            </button>
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t border-dashed" />
          </div>
          <div className="relative flex justify-center text-xs tracking-wide uppercase">
            <span className="bg-background text-muted-foreground px-3">{tCommon("orContinueWith")}</span>
          </div>
        </div>

        <button type="button" onClick={handleGoogleSignIn}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-muted w-full cursor-pointer")}
          disabled={isAnyPending}
        >
          {isGooglePending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Icons.google className="mr-2 size-4" />}
          {isGooglePending ? t("connecting") : t("google")}
        </button>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href={`/login${redirect ? `?redirect=${redirect}` : ""}${priceId ? `&priceId=${priceId}` : ""}`}
          className="text-foreground hover:text-primary font-semibold transition-colors hover:underline"
        >
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
