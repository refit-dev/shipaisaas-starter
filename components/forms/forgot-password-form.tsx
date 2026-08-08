"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    setError(null);

    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });

    if (sendError) {
      setError(t("errorSendCode"));
      setIsPending(false);
    } else {
      router.push(`/verify-email?mode=reset-password&email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="border border-dashed border-border bg-background grid gap-6 p-6 sm:p-8">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={50}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
              className="bg-muted"
            />
          </div>

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
            disabled={isPending || !email}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isPending ? t("sendingCode") : t("sendCode")}
          </button>
        </form>
      </div>

      <div className="text-muted-foreground text-center text-sm">
        <Link
          href="/login"
          className="text-foreground hover:text-primary inline-flex items-center font-semibold transition-colors hover:underline"
        >
          <ArrowLeft className="mr-2 size-4" />
          {t("backToSignIn")}
        </Link>
      </div>
    </div>
  );
}
