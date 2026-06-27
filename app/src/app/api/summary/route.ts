import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai/client";
import { getSystemPrompt, getSummaryPrompt } from "@/lib/ai/prompts";
import { getEventById } from "@/data/events";
import { Persona } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { eventId, persona } = (await request.json()) as {
      eventId: string;
      persona: Persona;
    };

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const systemPrompt = getSystemPrompt(event, persona);
    const userPrompt = getSummaryPrompt(event, persona);

    const response = await generateResponse(systemPrompt, userPrompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const summary = JSON.parse(jsonMatch[0]);
    return NextResponse.json(summary);
  } catch (error: unknown) {
    console.error("Summary error:", error);
    const msg = error instanceof Error ? error.message : "";
    const status = msg.includes("429") || msg.includes("503") ? 429 : 500;
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status }
    );
  }
}
