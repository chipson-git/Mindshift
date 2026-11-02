import Anthropic from "@anthropic-ai/sdk";

// Thin wrapper around the Claude API that turns a streamed reply into a plain-text
// ReadableStream for Route Handlers.

export const DEFAULT_MODEL = "claude-opus-5-5";

export function hasAiCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  return (client ??= new Anthropic());
}

export interface StreamOptions {
  system: string;
  messages: Anthropic.Beta.BetaMessageParam[];
  maxTokens: number;
  effort: "low" | "medium" | "high";
  /** Text emitted before the model's reply (e.g. crisis resources). */
  prefix?: string;
}

export function streamClaudeText(opts: StreamOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      if (opts.prefix) controller.enqueue(encoder.encode(opts.prefix));
      try {
        const stream = getClient().beta.messages.stream({
          model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
          max_tokens: opts.maxTokens,
          system: opts.system,
          messages: opts.messages,
          output_config: { effort: opts.effort },
          // If a safety classifier declines, the API retries on a fallback model automatically.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          console.error("Claude rate limit", error.message);
        } else if (error instanceof Anthropic.APIError) {
          console.error(`Claude API error ${error.status}`, error.message);
        } else {
          console.error("Claude stream failed", error);
        }
        controller.error(error);
      }
    },
  });
}

/** Streams a canned reply word by word, so demo mode feels like the real thing. */
export function streamDemoText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);
  return new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
}

export const TEXT_STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
};
