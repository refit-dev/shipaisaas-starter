import { Suspense } from "react";
import { Metadata } from "next";

import { OTPForm } from "@/components/forms/otp-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-[420px]">
      <Suspense>
        <OTPForm />
      </Suspense>
    </div>
  );
}
