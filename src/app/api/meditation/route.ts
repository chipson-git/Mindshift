import { getBackend } from "@/lib/backend";
import { getDictionary, isLocale } from "@/lib/i18n";
import { currentMonthKey, hasFeature, remainingUsage } from "@/lib/plans";
import { hasAiCredentials, streamClaudeText, streamDemoText, TEXT_STREAM_HEADERS } from "@/lib/ai/claude";
import {
  MEDITATION_LENGTHS,
  MEDITATION_STYLES,
  meditationSystemPrompt,
  meditationUserPrompt,
  type MeditationStyle,
} from "@/lib/ai/prompts";
import { looksLikeCrisis } from "@/lib/ai/safety";
import { demoMeditation } from "@/lib/ai/demo";

const MAX_GOAL_CHARS = 500;

export async function POST(request: Request) {
  const backend = getBackend();
  const session = await backend.getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const tier = session.subscription.tier;
  if (!hasFeature(tier, "customMeditations")) return new Response("Upgrade required", { status: 403 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const locale = body?.locale;
  const goal = typeof body?.goal === "string" ? body.goal.trim().slice(0, MAX_GOAL_CHARS) : "";
  const style = body?.style as MeditationStyle;
  const minutes = Number(body?.minutes);
  if (
    !isLocale(locale) || !goal ||
    !MEDITATION_STYLES.includes(style) ||
    !(MEDITATION_LENGTHS as readonly number[]).includes(minutes)
  ) {
    return new Response("Bad request", { status: 400 });
  }

  const month = currentMonthKey();
  const usage = await backend.getUsage(month);
  if (remainingUsage(tier, "customMeditations", usage.customMeditations) <= 0) {
    return new Response("Monthly limit reached", { status: 429 });
  }
  await backend.incrementUsage(month, "customMeditations");

  const prefix = looksLikeCrisis(goal) ? `${getDictionary(locale).disclaimer.crisis}\n\n` : undefined;

  if (!hasAiCredentials()) {
    return new Response(streamDemoText((prefix ?? "") + demoMeditation(locale)), {
      headers: TEXT_STREAM_HEADERS,
    });
  }

  return new Response(
    streamClaudeText({
      system: meditationSystemPrompt(),
      messages: [
        {
          role: "user",
          content: meditationUserPrompt({ goal, style, minutes, locale, name: session.user.name }),
        },
      ],
      maxTokens: 8000,
      effort: "medium",
      prefix,
    }),
    { headers: TEXT_STREAM_HEADERS },
  );
}
