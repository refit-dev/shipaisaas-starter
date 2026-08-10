"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
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
      setError("Failed to send verification code. Please try again.");
      setIsPending(false);
    } else {
      router.push(`/verify-email?mode=reset-password&email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-foreground font-display text-2xl font-extrabold tracking-[-0.02em]">Reset password</h1>
        <p className="text-muted-foreground text-sm">{"Enter your email address and we'll send you a verification code."}</p>
      </div>

      <div className="border-border bg-card shadow-lg grid rounded-2xl border gap-6 p-6 sm:p-8">
        {error && (
          <div className="bg-destructive/12 border-destructive/25 text-destructive rounded-xl border px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={50}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={"name@example.com"}
              disabled={isPending}
              className="bg-background"
            />
          </div>

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
            disabled={isPending || !email}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isPending ? "Sending..." : "Send verification code"}
          </button>
        </form>
      </div>

      <div className="text-muted-foreground text-center text-sm">
        <Link
          href="/login"
          className="text-foreground hover:text-primary inline-flex items-center font-semibold transition-colors hover:underline"
        >
          <ArrowLeft className="mr-2 size-4" />Back to sign in</Link>
      </div>
    </div>
  );
}
