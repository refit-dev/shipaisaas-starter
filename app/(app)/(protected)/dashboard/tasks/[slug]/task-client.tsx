"use client";

import { useState } from "react";
import { toast } from "sonner";

import { TaskTemplate } from "@/config/tasks";

import TaskForm from "./task-form";
import TaskResult from "./task-result";

export function TaskClient({ template }: { template: TaskTemplate }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResultText(null);
    setResultImage(null);

    try {
      const res = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Important: Next.js API routes limit payload size (usually 4MB default).
        // Since we are sending base64 images, ensure your images aren't massive.
        body: JSON.stringify({ slug: template.slug, inputs: formData }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();
      setResultText(data.output);

      if (data.assets && Array.isArray(data.assets)) {
        const imgAsset = data.assets.find((a: any) => a.type === "image");
        if (imgAsset) setResultImage(imgAsset.url);
      }
    } catch (error) {
      toast.error(
        "Something went wrong. Please try again or check file sizes.",
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
      <TaskResult
        template={template}
        resultText={resultText}
        resultImage={resultImage}
        isLoading={isLoading}
      />
    </div>
  );
}
