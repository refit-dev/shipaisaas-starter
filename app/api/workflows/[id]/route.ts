import { and, desc, eq } from "drizzle-orm";

import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { workflowRuns, workflows, workflowSteps } from "@/lib/db/schema/agent";

export const GET = withAuth(async ({ team, routeParams }) => {
  const workflowId = routeParams.id;

  if (!workflowId) {
    return new Response("Invalid ID", { status: 400 });
  }

  try {
    const workflow = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, workflowId), eq(workflows.teamId, team.id)),
      with: {
        workflowSteps: {
          orderBy: [workflowSteps.stepIndex],
        },
        workflowRuns: {
          orderBy: [desc(workflowRuns.runNumber)],
        },
      },
    });

    if (!workflow) {
      return new Response("Workflow not found", { status: 404 });
    }

    return Response.json(workflow);
  } catch (error) {
    console.error("Failed to fetch workflow:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
