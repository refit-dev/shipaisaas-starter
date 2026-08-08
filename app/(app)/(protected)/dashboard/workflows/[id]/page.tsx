import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";

import { WorkflowDetailClient } from "./workflow-details-client";

export const metadata = constructMetadata({
  title: "Workflow Details – SaaS Starter",
});

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <DashboardHeader
        heading="Workflow Execution"
        text="Review the AI plan, approve steps, and monitor the live execution logs."
      />
      <WorkflowDetailClient workflowId={id} />
    </>
  );
}
