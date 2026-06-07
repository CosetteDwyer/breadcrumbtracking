import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { Crumb, HabitEvent } from "./breadcrumb-types";

const PARSE_PROMPT = `You are a gentle habit log parser for people with ADHD. The user will give you a messy, casual description of their day or habits. Extract individual habit events and return them as a JSON array. Each item should have: habit (string), status ('done' | 'partial' | 'unsure' | 'missed'), confidence (0–100), time_of_day ('morning' | 'afternoon' | 'evening' | 'unknown'), and notes (any relevant context). Be generous with 'partial' and 'unsure' — don't assume failure. Return only valid JSON, no markdown.`;

const INSIGHT_PROMPT = `You are a warm, non-judgmental pattern spotter for someone with ADHD. You'll receive a JSON log of their habit entries over recent days. Write 3–5 plain-English observations about patterns you notice — what's going well, what seems hard, and any timing patterns. Be encouraging and specific. Start with something positive. Never use bullet points — write like a thoughtful friend, not a report.`;

const eventSchema = z.object({
  habit: z.string(),
  status: z.enum(["done", "partial", "unsure", "missed"]),
  confidence: z.number().min(0).max(100),
  time_of_day: z.enum(["morning", "afternoon", "evening", "unknown"]),
  notes: z.string(),
});

const parseInput = z.object({ text: z.string().min(1).max(8000) });

function friendlyError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("429")) {
    throw new Error("The forest is busy right now — try again in a moment");
  }
  if (msg.includes("402")) {
    throw new Error("The trail needs more credits to continue — add some in workspace settings");
  }
  throw new Error("Lost in the woods for a moment — try again");
}

export const parseCrumb = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parseInput.parse(input))
  .handler(async ({ data }): Promise<HabitEvent[]> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: PARSE_PROMPT,
        prompt: data.text,
      });
      const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
      const parsed = JSON.parse(cleaned);
      const arr = Array.isArray(parsed) ? parsed : parsed?.events;
      return z.array(eventSchema).parse(arr);
    } catch (err) {
      friendlyError(err);
    }
  });

const trailInput = z.object({
  crumbs: z
    .array(
      z.object({
        created_at: z.string(),
        events: z.array(eventSchema),
      }),
    )
    .max(500),
});

export const readTrail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => trailInput.parse(input))
  .handler(async ({ data }): Promise<string> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: INSIGHT_PROMPT,
        prompt: `Here is the log from the last 14 days:\n\n${JSON.stringify(data.crumbs, null, 2)}`,
      });
      return text.trim();
    } catch (err) {
      friendlyError(err);
    }
  });

export type ServerCrumb = Pick<Crumb, "created_at" | "events">;
