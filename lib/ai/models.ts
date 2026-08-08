import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { LanguageModel } from "ai";

export const SUPPORTED_MODELS = [
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" as const },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai" as const },
  {
    id: "claude-sonnet-4-6",
    label: "Claude Sonnet",
    provider: "anthropic" as const,
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku",
    provider: "anthropic" as const,
  },
] as const;

export type SupportedModelId = (typeof SUPPORTED_MODELS)[number]["id"];

export const DEFAULT_MODEL_ID: SupportedModelId = "gpt-4o";

export function resolveModel(modelId?: string): LanguageModel {
  const found = SUPPORTED_MODELS.find((m) => m.id === modelId);
  const safe = found ?? SUPPORTED_MODELS[0];
  if (safe.provider === "anthropic") {
    return anthropic(safe.id as string);
  }
  return openai(safe.id as string);
}
