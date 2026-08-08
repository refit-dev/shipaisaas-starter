import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";

export const metadata = constructMetadata({
  title: "Onboarding",
  description: "Complete your workspace setup.",
});

export default function OnboardingPage() {
  return (
    <>
      <DashboardHeader
        heading="Welcome aboard!"
        text="Let's get your workspace configured so you can start working."
      />
      <div className="mt-8 flex min-h-[calc(100vh-200px)] items-center justify-center">
        <OnboardingClient />
      </div>
    </>
  );
}
