import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { constructMetadata } from "@/lib/utils";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const dynamic = "force-dynamic";

export const metadata = constructMetadata({
  title: "Settings",
  description: "Configure your account settings.",
});

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) redirect("/login");

  return (
    <SettingsClient
      user={{
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email,
        image: (session.user.image as string | null) ?? null,
      }}
    />
  );
}
