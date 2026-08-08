import Link from "next/link";
import { Plus } from "lucide-react";

import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";

import { WorkflowsClient } from "./workflows-client";

export const metadata = constructMetadata({
  title: "Workflows",
  description: "Manage your AI agents and automated tasks.",
});

export default async function WorkflowsPage() {
  return (
    <>
      <DashboardHeader
        heading="Workflows"
        text="Monitor long-running AI tasks and approve pending execution plans."
      >
        <Link href="/dashboard/workflows/new">
          <Button className="flex cursor-pointer items-center gap-2">
            <Plus className="size-4" />
            New Workflow
          </Button>
        </Link>
      </DashboardHeader>

      {/* Pass any necessary user info to the client component */}
      <WorkflowsClient />
    </>
  );
}
