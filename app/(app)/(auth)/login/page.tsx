import { Suspense } from "react";
import { Metadata } from "next";

import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px]">
      <Suspense fallback={<div className="h-[400px] w-full" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
