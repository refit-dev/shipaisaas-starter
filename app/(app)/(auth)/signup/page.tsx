import { Suspense } from "react";

import { SignUpForm } from "@/components/forms/signup-form";

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
};

export default function SignupPage() {
  return (
    <div className="w-full max-w-[420px]">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
