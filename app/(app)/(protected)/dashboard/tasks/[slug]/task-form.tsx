"use client";

import { Loader2, Sparkles } from "lucide-react";

import { TaskTemplate } from "@/config/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TaskForm({
  template,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
}: {
  template: TaskTemplate;
  formData: Record<string, string>;
  handleInputChange: (k: string, v: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 lg:col-span-5">
      <form
        onSubmit={handleSubmit}
        className="bg-card space-y-6 rounded-xl border p-6 shadow-sm"
      >
        {template.inputs.map((input) => (
          <div key={input.name} className="space-y-2">
            <Label htmlFor={input.name}>{input.label}</Label>

            {input.type === "text" && (
              <Input
                id={input.name}
                placeholder={input.placeholder}
                value={formData[input.name] || ""}
                onChange={(e) => handleInputChange(input.name, e.target.value)}
                required
              />
            )}

            {input.type === "select" && input.options && (
              <Select
                value={formData[input.name] || ""}
                onValueChange={(value) => handleInputChange(input.name, value)}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${input.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {input.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {input.type === "textarea" && (
              <Textarea
                id={input.name}
                placeholder={input.placeholder}
                value={formData[input.name] || ""}
                onChange={(e) => handleInputChange(input.name, e.target.value)}
                className="min-h-[100px] resize-y"
                required
              />
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          Generate
        </Button>
      </form>
    </div>
  );
}
