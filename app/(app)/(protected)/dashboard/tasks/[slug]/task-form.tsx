"use client";

import { useRef } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { TaskInput, TaskTemplate } from "@/config/tasks";
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
  const isImageTask = template.outputType === "image";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded image to Base64 for the API
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(name, reader.result as string); // Save Base64 to state
    };
    reader.readAsDataURL(file);
  };

  // Extract text from document and populate the textarea
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      toast.warning(
        "Note: Natively extracting text from PDFs requires a backend or pdf.js. Ensure you upload clean text-based PDFs or .txt/.md files for best results.",
      );
    }

    try {
      const text = await file.text();
      handleInputChange(name, text); // Dump extracted text into the textarea for editing
    } catch (error) {
      console.error("Failed to read file", error);
      toast.error("Could not read file contents.");
    }
  };

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

            {/* 👇 NEW: Image Upload Field */}
            {input.type === "image" && (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={imageInputRef}
                  onChange={(e) => handleImageUpload(e, input.name)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className="mr-2 size-4" />
                  Select Image to Scan
                </Button>

                {/* Image Preview */}
                {formData[input.name] && (
                  <div className="relative h-32 w-full overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData[input.name]}
                      alt="Upload preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 👇 NEW: Document File Upload + Editable Textarea */}
            {input.type === "file" && (
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".txt,.md,.csv,.pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e, input.name)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="mr-2 size-4" />
                  Extract Text from File
                </Button>
                <p className="text-muted-foreground text-xs">
                  Or paste the content directly below to edit:
                </p>
                <Textarea
                  id={input.name}
                  placeholder="Extracted document text will appear here..."
                  value={formData[input.name] || ""}
                  onChange={(e) =>
                    handleInputChange(input.name, e.target.value)
                  }
                  className="min-h-[150px] resize-y font-mono text-xs"
                  required
                />
              </div>
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          Generate {isImageTask ? "Image" : "Content"}
        </Button>
      </form>
    </div>
  );
}
