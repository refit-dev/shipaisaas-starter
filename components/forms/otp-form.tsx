"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OTPForm() {
  const t      = useTranslations("auth.verifyEmail");
  const tReset = useTranslations("auth.verifyEmail.resetPassword");

  const searchParams = useSearchParams();
  const router       = useRouter();

  const redirect   = searchParams.get("redirect");
  const emailParam = searchParams.get("email");
  const mode       = searchParams.get("mode");

  const [email, setEmail]                     = useState(emailParam || "");
  const [otpCode, setOtpCode]                 = useState("");
  const [resendCooldown, setResendCooldown]   = useState(0);
  const [showResetForm, setShowResetForm]     = useState(false);
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending]             = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  useEffect(() => { if (emailParam) setEmail(emailParam); }, [emailParam]);

  const handleOtpChange = (val: string) => setOtpCode(val.replace(/\D/g, "").slice(0, 6));

  const validatePasswords = () => {
    if (password.length > 0 && password.length < 8) return tReset("passwordTooShort");
    if (confirmPassword.length > 0 && password !== confirmPassword) return tReset("passwordMismatch");
    return null;
  };
  const passwordError = validatePasswords();

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    if (mode === "reset-password") {
      const { error: checkError } = await authClient.emailOtp.checkVerificationOtp({
        email, type: "forget-password", otp: otpCode,
      });
      if (checkError) setError(t("errorInvalidCode"));
      else setShowResetForm(true);
    } else {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({ email, otp: otpCode });
      if (verifyError) setError(t("errorInvalidCode"));
      else router.push(redirect || "/login?message=signup-email-verified");
    }
    setIsPending(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError) return;
    setIsPending(true);
    setError(null);

    const { error: resetError } = await authClient.emailOtp.resetPassword({ email, otp: otpCode, password });
    if (resetError) {
      setError(tReset("errorReset"));
      setIsPending(false);
    } else {
      router.push("/login?message=password-reset-success");
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsPending(true);
    setError(null);

    const type = mode === "reset-password" ? "forget-password" : "email-verification";
    const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({ email, type });

    if (resendError) {
      setError(t("errorResendCode"));
    } else {
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
      }, 1000);
    }
    setIsPending(false);
  };

  // Reset password form
  if (showResetForm && mode === "reset-password") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {tReset("title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {tReset("subtitle", { email }).split(email).map((part, i, arr) =>
              i < arr.length - 1 ? (
                <>{part}<span className="text-foreground font-medium">{email}</span></>
              ) : part
            )}
          </p>
        </div>

        <div className="border border-dashed border-border bg-background grid gap-6 p-6 sm:p-8">
          {(passwordError || error) && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">
              {passwordError || error}
            </div>
          )}

          <form className="grid gap-5" onSubmit={handleResetPassword}>
            <div className="grid gap-2">
              <Label htmlFor="password">{tReset("newPasswordLabel")}</Label>
              <Input id="password" name="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required minLength={8} placeholder="••••••••"
                disabled={isPending} className="bg-muted" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">{tReset("confirmPasswordLabel")}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required minLength={8} placeholder="••••••••"
                disabled={isPending} className="bg-muted" />
            </div>

            <button type="submit"
              className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
              disabled={isPending || !!passwordError || !password || !confirmPassword}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPending ? "Resetting..." : tReset("resetButton")}
            </button>
          </form>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          <Link href={`/login${redirect ? `?redirect=${redirect}` : ""}`}
            className="text-foreground hover:text-primary inline-flex items-center font-semibold transition-colors hover:underline">
            <ArrowLeft className="mr-2 size-4" />
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  // OTP verification form
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {mode === "reset-password" ? t("titleResetPassword") : t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("subtitle", { email: email || t("subtitleFallback") })}
        </p>
      </div>

      <div className="border border-dashed border-border bg-background grid gap-6 p-6 sm:p-8">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <form className="grid gap-5" onSubmit={handleVerifyOtp}>
          <div className="grid gap-2">
            <Label htmlFor="otp">{t("codeLabel")}</Label>
            <Input id="otp" name="otp" type="text" inputMode="numeric" pattern="[0-9]*"
              value={otpCode} onChange={(e) => handleOtpChange(e.target.value)}
              required maxLength={6} placeholder={t("codePlaceholder")}
              className="bg-muted text-center font-mono text-2xl tracking-[0.5em]"
              autoComplete="one-time-code" disabled={isPending} />
          </div>

          <button type="submit"
            className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full cursor-pointer")}
            disabled={isPending || otpCode.length !== 6 || !email}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isPending ? "Verifying..." : t("verifyButton")}
          </button>
        </form>

        <div className="text-center text-sm">
          <form onSubmit={handleResend}>
            <button type="submit"
              className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline disabled:opacity-50 disabled:hover:no-underline"
              disabled={isPending || resendCooldown > 0 || !email}
            >
              {resendCooldown > 0 ? t("resendCooldown", { seconds: resendCooldown }) : t("resendCode")}
            </button>
          </form>
        </div>
      </div>

      <div className="text-muted-foreground text-center text-sm">
        <Link href={`/login${redirect ? `?redirect=${redirect}` : ""}`}
          className="text-foreground hover:text-primary inline-flex items-center font-semibold transition-colors hover:underline">
          <ArrowLeft className="mr-2 size-4" />
          {t("backToSignIn")}
        </Link>
      </div>
    </div>
  );
}
