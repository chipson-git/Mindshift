"use client";

import { useEffect, useRef, useState } from "react";
import { fmt, type Dictionary, type Locale } from "@/lib/i18n";
import { readTextStream } from "@/lib/stream-client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function CoachChat({
  locale,
  t,
  initialRemaining,
  demo,
}: {
  locale: Locale;
  t: Dictionary["coach"];
  initialRemaining: number;
  demo: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending || remaining <= 0) return;

    const history: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: history }),
      });
      if (res.status === 429) {
        setRemaining(0);
        throw new Error("limit");
      }
      if (!res.ok) throw new Error(String(res.status));
      setRemaining((r) => r - 1);
      await readTextStream(res, (reply) =>
        setMessages([...history, { role: "assistant", content: reply }]),
      );
    } catch (err) {
      // Drop the empty assistant bubble and put the text back so the user can retry.
      setMessages(history.slice(0, -1));
      setInput(text);
      setError(err instanceof Error && err.message === "limit" ? t.limitReached : t.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card flex h-[calc(100dvh-16rem)] min-h-[420px] flex-col p-0 sm:p-0">
      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6" aria-live="polite">
        {demo && <p className="rounded-xl bg-lavender-soft px-3 py-2 text-xs">{t.demoNotice}</p>}
        <Bubble role="assistant">{t.intro}</Bubble>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content || <span className="inline-block animate-pulse">●●●</span>}
          </Bubble>
        ))}
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="border-t border-border p-3 sm:p-4">
        {error && <p role="alert" className="mb-2 text-sm text-danger">{error}</p>}
        <div className="flex gap-2">
          <label htmlFor="coach-input" className="sr-only">{t.placeholder}</label>
          <textarea
            id="coach-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={t.placeholder}
            disabled={remaining <= 0}
            className="input max-h-40 min-h-11 flex-1 resize-none"
          />
          <button type="submit" disabled={pending || !input.trim() || remaining <= 0} className="btn-primary">
            {t.send}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          {remaining > 0 ? fmt(t.remaining, { n: remaining }) : t.limitReached}
        </p>
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: Message["role"]; children: React.ReactNode }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          role === "user" ? "rounded-br-md bg-accent text-accent-contrast" : "rounded-bl-md bg-surface-muted"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
