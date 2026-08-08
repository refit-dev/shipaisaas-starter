import { TASK_TEMPLATES } from "@/config/tasks";
import { generatePlainText, generateStructured } from "@/lib/ai/structured";
import { withAuth } from "@/lib/auth/middleware";
import { checkRateLimits, updateUsage } from "@/lib/utils/usage";

/**
 * Runs a single task template from config/tasks.ts.
 *
 * Templates with `outputType: "json"` are answered with structured output that
 * is validated against the template's Zod schema; everything else returns
 * Markdown text.
 */
export const POST = withAuth(async ({ req, team }) => {
  const { slug, inputs, modelId } = await req.json();

  const template = TASK_TEMPLATES.find((t) => t.slug === slug);
  if (!template) {
    return new Response("Unknown task template", { status: 404 });
  }

  try {
    await checkRateLimits({ teamId: team.id, plan: team.planName || "free" });
  } catch (error) {
    return new Response((error as Error).message, { status: 429 });
  }

  // Turn the form fields into a readable prompt
  const prompt = template.inputs
    .map((input) => `${input.label}: ${inputs?.[input.name] ?? "(not provided)"}`)
    .join("\n");

  try {
    if (template.outputType === "json") {
      if (!template.schema) {
        return new Response("Template is missing its schema", { status: 500 });
      }

      const { object, usage } = await generateStructured({
        system: template.systemPrompt,
        prompt,
        schema: template.schema,
        modelId,
      });

      await updateUsage({
        teamId: team.id,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });

      return Response.json({ outputType: "json", output: object });
    }

    const { text, usage } = await generatePlainText({
      system: template.systemPrompt,
      prompt,
      modelId,
    });

    await updateUsage({
      teamId: team.id,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    });

    return Response.json({ outputType: "text", output: text });
  } catch (error) {
    console.error("[tasks] generation failed:", error);
    return new Response("Generation failed", { status: 500 });
  }
});
