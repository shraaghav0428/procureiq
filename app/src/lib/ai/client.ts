import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

const MODEL = "claude-haiku-4-5-20251001";

export async function generateResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function* generateStreamingResponse(
  systemPrompt: string,
  messages: string | { role: "user" | "assistant"; content: string }[]
): AsyncGenerator<string> {
  const anthropic = getClient();

  const msgs = typeof messages === "string"
    ? [{ role: "user" as const, content: messages }]
    : messages;

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: msgs,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
