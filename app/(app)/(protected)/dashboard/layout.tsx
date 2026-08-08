import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: ProtectedLayoutProps) {
  // 2. Pass the headers to getSession
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  // // Get active organization
  // const org = await auth.api.getFullOrganization({
  //   headers: await headers(),
  // });
  // console.log("org", org);

  // if (!org) redirect("/organizations");

  // if (!org.onboardingCompleted) {
  //   redirect("/onboarding");
  // }

  return <>{children}</>;
}
