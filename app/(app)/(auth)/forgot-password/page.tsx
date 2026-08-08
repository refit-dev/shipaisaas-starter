import { Suspense } from "react";
import { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[420px]">
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
