import { NextRequest } from "next/server";
import { generateStreamingResponse } from "@/lib/ai/client";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { getEventById } from "@/data/events";
import { Persona } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { eventId, persona, message, recommendation, chatHistory } = (await request.json()) as {
      eventId: string;
      persona: Persona;
      message: string;
      recommendation?: { vendorName: string; answer: string; evidence: string[] } | null;
      chatHistory?: { role: "user" | "assistant"; content: string }[];
    };

    const event = getEventById(eventId);
    if (!event) {
      return new Response("Event not found", { status: 404 });
    }

    let systemPrompt = getSystemPrompt(event, persona);

    if (recommendation) {
      systemPrompt += `\n\nAI RECOMMENDATION CONTEXT (already shown to the user):
The AI Recommendation for this event has recommended ${recommendation.vendorName}.
Summary: ${recommendation.answer}
Evidence: ${recommendation.evidence.join("; ")}

IMPORTANT: Be consistent with this recommendation. If the user asks which vendor to choose, align with this recommendation unless the user specifically asks for alternatives to this vendor, or the question requires analyzing a different dimension (e.g., "besides ${recommendation.vendorName}" or "cheapest option"). When suggesting alternatives, explain why the alternative differs from the recommendation.`;
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages: { role: "user" | "assistant"; content: string }[] = [];
          if (chatHistory && chatHistory.length > 0) {
            for (const msg of chatHistory) {
              if (msg.content) messages.push({ role: msg.role, content: msg.content });
            }
          }
          messages.push({ role: "user", content: message });

          for await (const chunk of generateStreamingResponse(
            systemPrompt,
            messages
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
