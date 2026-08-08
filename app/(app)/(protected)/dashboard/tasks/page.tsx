import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TASK_TEMPLATES } from "@/config/tasks";
import { DashboardHeader } from "@/components/dashboard/header";
import { Icons } from "@/components/shared/icons";

export default function TasksPage() {
  return (
    <>
      <DashboardHeader
        heading="Tasks"
        text="One-shot AI templates. Add your own in config/tasks.ts."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TASK_TEMPLATES.map((template) => {
          const Icon = Icons[template.icon];

          return (
            <Link
              key={template.slug}
              href={`/dashboard/tasks/${template.slug}`}
              className="bg-card hover:border-primary/40 group flex flex-col gap-3 rounded-xl border p-5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-semibold">{template.title}</h3>
              </div>

              <p className="text-muted-foreground flex-1 text-sm">
                {template.description}
              </p>

              <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors">
                Open template
                <ArrowRight className="size-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
