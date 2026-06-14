import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import Anthropic from "@anthropic-ai/sdk";
import { getCause } from "@/lib/causes";
import { decodePage } from "@/lib/encodePage";
import {
  EXPLAIN_SYSTEM,
  buildExplainMessages,
  cannedExplainer,
} from "@/lib/aiExplain";

export async function POST(req: Request) {
  const { situation, causeSlug, d } = await req.json().catch(() => ({}));
  const cause = causeSlug === "custom" && d ? decodePage(d) : getCause(causeSlug);
  if (!cause) {
    return NextResponse.json({ error: "Unknown cause" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ text: cannedExplainer(cause), source: "canned" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: EXPLAIN_SYSTEM,
      messages: buildExplainMessages(String(situation ?? ""), cause),
    });
    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n")
      .trim();
    return NextResponse.json({ text: text || cannedExplainer(cause), source: "ai" });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ text: cannedExplainer(cause), source: "fallback" });
  }
}
