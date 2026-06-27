import { NextRequest } from "next/server";
import { generateStreamingResponse } from "@/lib/ai/client";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { getEventById } from "@/data/events";
import { Persona } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { eventId, persona, message } = (await request.json()) as {
      eventId: string;
      persona: Persona;
      message: string;
    };

    const event = getEventById(eventId);
    if (!event) {
      return new Response("Event not found", { status: 404 });
    }

    const systemPrompt = getSystemPrompt(event, persona);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateStreamingResponse(
            systemPrompt,
            message
          )) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Failed to process chat", { status: 500 });
  }
}
