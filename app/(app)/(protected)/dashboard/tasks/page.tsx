import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";

import { TasksClient } from "./tasks-client";

export default function TasksPage() {
  return (
    <>
      <DashboardHeader
        heading="Tasks"
        text="Each conversation with the AI assistant is a task."
      ></DashboardHeader>

      {/* Pass any necessary user info to the client component */}
      <TasksClient />
    </>
  );
}
