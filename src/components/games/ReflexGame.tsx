"use client";

import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/i18n";
import { accuracy, average, REFLEX_SHOW_MS, REFLEX_TRIALS, reflexTrials } from "@/lib/games";
import { IntroCard, ResultCard, useBestScore, type GamesDict, type Phase } from "./GameFrame";

// Calm reflex (go / no-go): press for green, hold back for coral.
// Score = correct decisions out of 30.

export function ReflexGame({ t }: { t: GamesDict }) {
  const { best, submit } = useBestScore("reflex");
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [stimulus, setStimulus] = useState<"go" | "nogo" | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [result, setResult] = useState({ correct: 0, avgRt: 0 });
  const [newBest, setNewBest] = useState(false);

  const trials = useRef<boolean[]>([]);
  const shownAt = useRef(0);
  const responded = useRef(false);
  const stats = useRef({ correct: 0, rts: [] as number[] });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const finish = () => {
    const correct = stats.current.correct;
    setResult({ correct, avgRt: average(stats.current.rts) });
    setNewBest(submit(correct));
    setPhase("done");
  };

  const runTrial = (i: number) => {
    if (i >= trials.current.length) {
      finish();
      return;
    }
    setIndex(i);
    setStimulus(null);
    setFeedback(null);
    later(() => {
      responded.current = false;
      shownAt.current = performance.now();
      setStimulus(trials.current[i] ? "go" : "nogo");
      later(() => {
        // Time is up for this trial: score whatever didn't happen.
        if (!responded.current) {
          const ok = !trials.current[i]; // holding back is right only on no-go
          if (ok) stats.current.correct++;
          setFeedback(ok ? "ok" : "bad");
        }
        setStimulus(null);
        later(() => runTrial(i + 1), 250);
      }, REFLEX_SHOW_MS);
    }, 600 + Math.random() * 700);
  };

  const start = () => {
    clearTimers();
    trials.current = reflexTrials();
    stats.current = { correct: 0, rts: [] };
    setPhase("play");
    runTrial(0);
  };

  const press = () => {
    if (phase !== "play" || stimulus === null || responded.current) return;
    responded.current = true;
    const go = stimulus === "go";
    if (go) {
      stats.current.correct++;
      stats.current.rts.push(performance.now() - shownAt.current);
    }
    setFeedback(go ? "ok" : "bad");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        press();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "intro") return <IntroCard t={t} howTo={t.list.reflex.howTo} best={best} onStart={start} />;
  if (phase === "done") {
    const details = [fmt(t.accuracy, { n: accuracy(result.correct, REFLEX_TRIALS) })];
    if (result.avgRt) details.push(fmt(t.reflexAvg, { n: result.avgRt }));
    return <ResultCard t={t} score={result.correct} details={details} isNewBest={newBest} best={best} onAgain={start} />;
  }

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{stimulus === null ? t.reflexWait : " "}</span>
        <span className="tabular-nums">{fmt(t.progress, { n: index + 1, total: REFLEX_TRIALS })}</span>
      </div>
      <div className="flex h-48 items-center justify-center rounded-2xl bg-surface-muted">
        <span
          aria-hidden="true"
          className={`size-28 rounded-full transition-transform duration-100 ${
            stimulus === "go" ? "scale-100 bg-success" : stimulus === "nogo" ? "scale-100 bg-coral" : "scale-0"
          } ${feedback === "ok" ? "ring-4 ring-success/40" : feedback === "bad" ? "ring-4 ring-danger/50" : ""}`}
        />
      </div>
      <button type="button" onClick={press} className="btn-primary w-full py-4 text-base">
        {t.reflexTap}
      </button>
    </div>
  );
}
