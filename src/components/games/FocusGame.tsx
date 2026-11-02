"use client";

import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/i18n";
import { accuracy, FOCUS_COLORS, FOCUS_SECONDS, focusRound, focusScore, type FocusColor, type FocusRound } from "@/lib/games";
import { IntroCard, ResultCard, useBestScore, type GamesDict, type Phase } from "./GameFrame";

// Color focus: press the INK color of the word, not what the word says.

const INK: Record<FocusColor, string> = {
  blue: "var(--ink-blue)",
  green: "var(--ink-green)",
  red: "var(--ink-red)",
  yellow: "var(--ink-yellow)",
};

export function FocusGame({ t }: { t: GamesDict }) {
  const { best, submit } = useBestScore("focus");
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<FocusRound>({ word: "blue", ink: "red" });
  const [left, setLeft] = useState(FOCUS_SECONDS);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [newBest, setNewBest] = useState(false);
  const endAt = useRef(0);
  const counts = useRef({ correct: 0, wrong: 0 });

  const start = () => {
    counts.current = { correct: 0, wrong: 0 };
    setCorrect(0);
    setWrong(0);
    setRound(focusRound());
    setLeft(FOCUS_SECONDS);
    endAt.current = Date.now() + FOCUS_SECONDS * 1000;
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        const { correct: c, wrong: w } = counts.current;
        setNewBest(submit(focusScore(c, w)));
        setPhase("done");
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, submit]);

  const answer = (color: FocusColor) => {
    if (phase !== "play") return;
    const ok = color === round.ink;
    if (ok) counts.current.correct++;
    else counts.current.wrong++;
    setCorrect(counts.current.correct);
    setWrong(counts.current.wrong);
    setFlash(ok ? "ok" : "bad");
    setTimeout(() => setFlash(null), 180);
    setRound(focusRound());
  };

  // Keys 1–4 answer too.
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (i >= 0 && i < FOCUS_COLORS.length) answer(FOCUS_COLORS[i]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "intro") return <IntroCard t={t} howTo={t.list.focus.howTo} best={best} onStart={start} />;
  if (phase === "done") {
    return (
      <ResultCard
        t={t}
        score={focusScore(correct, wrong)}
        details={[`✓ ${correct} · ✗ ${wrong}`, fmt(t.accuracy, { n: accuracy(correct, correct + wrong) })]}
        isNewBest={newBest}
        best={best}
        onAgain={start}
      />
    );
  }

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{t.focusPrompt}</span>
        <span className="tabular-nums">{fmt(t.timeLeft, { n: left })}</span>
      </div>
      <div
        className={`flex h-36 items-center justify-center rounded-2xl bg-surface-muted transition-shadow ${
          flash === "ok" ? "ring-2 ring-success" : flash === "bad" ? "ring-2 ring-danger" : ""
        }`}
      >
        <span className="text-5xl font-bold tracking-tight sm:text-6xl" style={{ color: INK[round.ink] }}>
          {t.colors[round.word]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FOCUS_COLORS.map((color, i) => (
          <button key={color} type="button" onClick={() => answer(color)} className="btn-secondary justify-start gap-3 py-3.5 text-base">
            <span className="size-4 rounded-full" style={{ background: INK[color] }} aria-hidden="true" />
            {t.colors[color]}
            <span className="ml-auto hidden text-xs text-muted sm:inline">{i + 1}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-muted tabular-nums">✓ {correct} · ✗ {wrong}</p>
    </div>
  );
}
