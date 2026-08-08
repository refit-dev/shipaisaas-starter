import { headers } from "next/headers";
import { desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/account";
import { constructMetadata } from "@/lib/utils";
import { UsersClient } from "@/components/admin/users-client";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Manage Users",
  description: "View and manage all platform users.",
});

export default async function AdminUsersPage() {
  // 1. Get the current session to protect the current admin from self-actions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <DashboardHeader
        heading="User Management"
        text="View, modify, and moderate all accounts on the platform."
      />
      <div className="mt-6">
        <UsersClient
          currentUserId={session?.user?.id}
          currentUserRole={session?.user?.role}
        />
      </div>
    </>
  );
}
