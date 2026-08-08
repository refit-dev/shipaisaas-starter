"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getAuthMessage, getAuthMessageType } from "@/lib/auth/messages";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";

function messageClasses(style: string) {
  if (style === "success") return "bg-primary/10 text-primary";
  if (style === "error") return "bg-destructive/10 text-destructive";
  return "bg-muted text-foreground border border-dashed border-border";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");

  const messageType = searchParams.get("message");
  const messageStyle = getAuthMessageType(messageType || "");
  const messageText = messageType ? getAuthMessage(messageType) : null;

  const [error, setError] = useState<string | null>(null);
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  const isAnyPending = isEmailPending || isGooglePending;

  const getCallbackUrl = () => {
    let url = redirect || "/dashboard";
    if (priceId) url += `?priceId=${priceId}`;
    return url;
  };

  async function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsEmailPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      if (
        signInError.code === "EMAIL_NOT_VERIFIED" ||
        signInError.message?.toLowerCase().includes("verified")
      ) {
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "email-verification",
        });
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError("Invalid email or password.");
        setIsEmailPending(false);
      }
      return;
    }

    router.push(getCallbackUrl());
  }

  const handleGoogleSignIn = async () => {
    setIsGooglePending(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: getCallbackUrl(),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in with your email and password
        </p>
      </div>

      <div className="border-border bg-background grid gap-6 border border-dashed p-6 sm:p-8">
        {messageText && (
          <div
            className={cn(
              "px-4 py-3 text-sm font-medium",
              messageClasses(messageStyle),
            )}
          >
            {messageText}
          </div>
        )}

        <form className="grid gap-5" onSubmit={onPasswordSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              maxLength={50}
              disabled={isAnyPending}
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/80 text-xs font-medium transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={100}
              disabled={isAnyPending}
              className="bg-muted"
            />
          </div>

          {error && (
            <p className="text-destructive text-[13px] font-medium">{error}</p>
          )}

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
            disabled={isAnyPending}
          >
            {isEmailPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEmailPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t border-dashed" />
          </div>
          <div className="relative flex justify-center text-xs tracking-wide uppercase">
            <span className="bg-background text-muted-foreground px-3">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "bg-muted w-full cursor-pointer",
          )}
          disabled={isAnyPending}
        >
          {isGooglePending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 size-4" />
          )}
          {isGooglePending ? "Connecting..." : "Google"}
        </button>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${redirect ? `?redirect=${redirect}` : ""}${priceId ? `&priceId=${priceId}` : ""}`}
          className="text-foreground hover:text-primary font-semibold transition-colors hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
