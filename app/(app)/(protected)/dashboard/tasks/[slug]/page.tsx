import { notFound } from "next/navigation";

import { TASK_TEMPLATES } from "@/config/tasks";
import { DashboardHeader } from "@/components/dashboard/header";

import { TaskClient } from "./task-client";

export default async function TaskExecutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Find the requested template
  const template = TASK_TEMPLATES.find((t) => t.slug === slug);
  if (!template) notFound();

  // 👇 FIX: Create a stripped-down, 100% JSON-safe version for the Client
  const clientSafeTemplate = {
    slug: template.slug,
    title: template.title,
    inputs: template.inputs,
    outputType: template.outputType || "text",
  };

  return (
    <>
      <DashboardHeader heading={template.title} text={template.description} />
      {/* Pass the fully typed template to the client */}
      <TaskClient template={clientSafeTemplate as any} />
    </>
  );
}
