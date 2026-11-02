import type Anthropic from "@anthropic-ai/sdk";
import { getBackend } from "@/lib/backend";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { currentMonthKey, hasFeature, remainingUsage } from "@/lib/plans";
import { hasAiCredentials, streamClaudeText, streamDemoText, TEXT_STREAM_HEADERS } from "@/lib/ai/claude";
import { coachSystemPrompt } from "@/lib/ai/prompts";
import { looksLikeCrisis } from "@/lib/ai/safety";
import { demoCoachReply } from "@/lib/ai/demo";

const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 2000;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function parseBody(body: unknown): { locale: Locale; messages: ChatTurn[] } | null {
  if (typeof body !== "object" || body === null) return null;
  const { locale, messages } = body as { locale?: unknown; messages?: unknown };
  if (!isLocale(locale) || !Array.isArray(messages)) return null;
  const turns: ChatTurn[] = [];
  for (const m of messages.slice(-MAX_HISTORY)) {
    if (
      typeof m !== "object" || m === null ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" || !m.content.trim()
    ) {
      return null;
    }
    turns.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) });
  }
  // The API requires the conversation to start with a user turn and end with one.
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return { locale, messages: turns };
}

export async function POST(request: Request) {
  const backend = getBackend();
  const session = await backend.getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const tier = session.subscription.tier;
  if (!hasFeature(tier, "coach")) return new Response("Upgrade required", { status: 403 });

  const parsed = parseBody(await request.json().catch(() => null));
  if (!parsed) return new Response("Bad request", { status: 400 });

  const month = currentMonthKey();
  const usage = await backend.getUsage(month);
  if (remainingUsage(tier, "coachMessages", usage.coachMessages) <= 0) {
    return new Response("Monthly limit reached", { status: 429 });
  }
  // Count the message before streaming: cookies can't be set once the body has started.
  await backend.incrementUsage(month, "coachMessages");

  const lastUserMessage = parsed.messages[parsed.messages.length - 1].content;
  const prefix = looksLikeCrisis(lastUserMessage)
    ? `${getDictionary(parsed.locale).disclaimer.crisis}\n\n`
    : undefined;

  if (!hasAiCredentials()) {
    const turn = parsed.messages.filter((m) => m.role === "user").length - 1;
    return new Response(streamDemoText((prefix ?? "") + demoCoachReply(parsed.locale, turn)), {
      headers: TEXT_STREAM_HEADERS,
    });
  }

  const messages: Anthropic.Beta.BetaMessageParam[] = parsed.messages;
  return new Response(
    streamClaudeText({
      system: coachSystemPrompt(parsed.locale, session.user.name),
      messages,
      maxTokens: 2000,
      effort: "low",
      prefix,
    }),
    { headers: TEXT_STREAM_HEADERS },
  );
}
