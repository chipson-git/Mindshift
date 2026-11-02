"use client";

import { useState } from "react";
import { fmt, type Dictionary, type Locale } from "@/lib/i18n";
import { MEDITATION_LENGTHS, MEDITATION_STYLES, type MeditationStyle } from "@/lib/ai/prompts";
import { readTextStream } from "@/lib/stream-client";
import { SessionPlayer } from "./SessionPlayer";

export function MeditationGenerator({
  locale,
  t,
  playerLabels,
  initialRemaining,
  demo,
}: {
  locale: Locale;
  t: Dictionary["create"];
  playerLabels: React.ComponentProps<typeof SessionPlayer>["labels"];
  initialRemaining: number;
  demo: boolean;
}) {
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState<MeditationStyle>("meditation");
  const [minutes, setMinutes] = useState<number>(10);
  const [script, setScript] = useState("");
  const [status, setStatus] = useState<"idle" | "writing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim() || status === "writing" || remaining <= 0) return;
    setStatus("writing");
    setScript("");
    setError(null);
    try {
      const res = await fetch("/api/meditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, goal, style, minutes }),
      });
      if (res.status === 429) {
        setRemaining(0);
        throw new Error("limit");
      }
      if (!res.ok) throw new Error(String(res.status));
      setRemaining((r) => r - 1);
      await readTextStream(res, setScript);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error && err.message === "limit" ? t.limitReached : t.error);
    }
  }

  const paragraphs = script.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <form onSubmit={generate} className="card space-y-5">
        {demo && <p className="rounded-xl bg-lavender-soft px-3 py-2 text-xs">{t.demoNotice}</p>}
        <div>
          <label htmlFor="goal" className="label">{t.goal}</label>
          <textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            maxLength={500}
            rows={3}
            required
            placeholder={t.goalPlaceholder}
            className="input resize-y"
          />
        </div>

        <fieldset>
          <legend className="label">{t.style}</legend>
          <div className="flex flex-wrap gap-2">
            {MEDITATION_STYLES.map((s) => (
              <Choice key={s} name="style" checked={style === s} onChange={() => setStyle(s)}>
                {t.styles[s]}
              </Choice>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">{t.length}</legend>
          <div className="flex flex-wrap gap-2">
            {MEDITATION_LENGTHS.map((m) => (
              <Choice key={m} name="minutes" checked={minutes === m} onChange={() => setMinutes(m)}>
                {t.lengths[String(m) as keyof typeof t.lengths]}
              </Choice>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={status === "writing" || !goal.trim() || remaining <= 0} className="btn-primary">
            {status === "writing" ? t.generating : t.generate}
          </button>
          <span className="text-xs text-muted">
            {remaining > 0 ? fmt(t.remaining, { n: remaining }) : t.limitReached}
          </span>
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </form>

      {status === "writing" && (
        <div className="card whitespace-pre-wrap leading-relaxed text-muted" aria-live="polite">
          {script || "…"}
        </div>
      )}
      {status === "done" && paragraphs.length > 0 && (
        <SessionPlayer key={script} paragraphs={paragraphs} locale={locale} labels={playerLabels} />
      )}
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
        checked ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:text-text"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
