import { generateText, Output } from "ai";
import { z } from "zod";

import { resolveModel } from "@/lib/ai/models";

type GenerateTextOptions = {
  system: string;
  prompt: string;
  modelId?: string;
};

type GenerateStructuredOptions<T> = GenerateTextOptions & {
  schema: z.ZodType<T>;
};

/**
 * Plain text generation for one-shot tasks (no conversation, no streaming).
 */
export async function generatePlainText({
  system,
  prompt,
  modelId,
}: GenerateTextOptions) {
  const result = await generateText({
    model: resolveModel(modelId),
    system,
    prompt,
  });

  return { text: result.text, usage: result.totalUsage };
}

/**
 * Structured generation: the model is forced to return JSON matching `schema`.
 *
 * Note: we use `generateText` with `Output.object` rather than `generateObject`,
 * which keeps a single code path for text and JSON responses.
 */
export async function generateStructured<T>({
  system,
  prompt,
  schema,
  modelId,
}: GenerateStructuredOptions<T>) {
  const result = await generateText({
    model: resolveModel(modelId),
    system,
    prompt,
    output: Output.object({ schema }),
  });

  return { object: result.output as T, usage: result.totalUsage };
}
