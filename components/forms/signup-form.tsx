"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");

  const [error, setError] = useState<string | null>(null);
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  const isAnyPending = isEmailPending || isGooglePending;

  const getCallbackUrl = () => {
    let url = redirect || "/onboarding";
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
    const name = formData.get("name") as string;

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (signUpError) {
      setError("We couldn't create your account. Please try again.");
      setIsEmailPending(false);
      return;
    }

    router.push(
      `/verify-email?email=${email}&redirect=${encodeURIComponent(getCallbackUrl())}`,
    );
  }

  const handleGoogleSignIn = async () => {
    setIsGooglePending(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: redirect || "/dashboard",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-foreground font-display text-2xl font-extrabold tracking-[-0.02em]">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start building in a couple of minutes
        </p>
      </div>

      <div className="border-border bg-card shadow-lg grid rounded-2xl border gap-6 p-6 sm:p-8">
        <form className="grid gap-5" onSubmit={onPasswordSubmit}>
          {error && (
            <div className="bg-destructive/12 border-destructive/25 text-destructive rounded-xl border px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              required
              maxLength={50}
              disabled={isAnyPending}
              className="bg-background"
            />
          </div>

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
              className="bg-background"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={100}
              disabled={isAnyPending}
              className="bg-background"
            />
            <p className="text-muted-foreground text-[13px]">
              At least 8 characters.
            </p>
          </div>

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
            disabled={isAnyPending}
          >
            {isEmailPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEmailPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t" />
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
            "bg-background w-full cursor-pointer",
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
        Already have an account?{" "}
        <Link
          href={`/login${redirect ? `?redirect=${redirect}` : ""}${priceId ? `&priceId=${priceId}` : ""}`}
          className="text-foreground hover:text-primary font-semibold transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
