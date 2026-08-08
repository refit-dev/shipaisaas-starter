"use client";

import { useState } from "react";
import { toast } from "sonner";

import { TaskTemplate } from "@/config/tasks";

import TaskForm from "./task-form";
import TaskResult from "./task-result";

export function TaskClient({ template }: { template: TaskTemplate }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: template.slug, inputs: formData }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setResult(
        data.outputType === "json"
          ? "```json\n" + JSON.stringify(data.output, null, 2) + "\n```"
          : data.output,
      );
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-12">
      <TaskForm
        template={template}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <TaskResult result={result} isLoading={isLoading} />
    </div>
  );
}
