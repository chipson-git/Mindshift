"use client";

import { useCallback, useEffect, useState } from "react";
import { fmt, type Dictionary } from "@/lib/i18n";
import { bestScoreKey, type GameId } from "@/lib/games";

export type GamesDict = Dictionary["games"];
export type Phase = "intro" | "play" | "done";

/** Best score per game, kept in localStorage. */
export function useBestScore(id: GameId) {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(bestScoreKey(id));
      setBest(raw === null ? null : Number(raw));
    } catch {
      setBest(null);
    }
  }, [id]);

  /** Records a finished game; returns true when it is a new personal best. */
  const submit = useCallback(
    (score: number) => {
      const isNew = best === null || score > best;
      if (isNew) {
        setBest(score);
        try {
          localStorage.setItem(bestScoreKey(id), String(score));
        } catch {
          // Storage blocked: the best score lasts for this visit only.
        }
      }
      return isNew;
    },
    [best, id],
  );

  return { best, submit };
}

export function IntroCard({ t, howTo, best, onStart }: { t: GamesDict; howTo: string; best: number | null; onStart: () => void }) {
  return (
    <div className="card space-y-4">
      <h2 className="font-semibold">{t.howTo}</h2>
      <p className="text-sm text-muted">{howTo}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onStart} className="btn-primary">{t.play}</button>
        <span className="text-xs text-muted">{best === null ? t.noBest : fmt(t.best, { n: best })}</span>
      </div>
    </div>
  );
}

export function ResultCard({
  t,
  score,
  details,
  isNewBest,
  best,
  onAgain,
  children,
}: {
  t: GamesDict;
  score: number;
  details: string[];
  isNewBest: boolean;
  best: number | null;
  onAgain: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center" aria-live="polite">
      <p className="text-sm text-muted">{t.score}</p>
      <p className="text-5xl font-semibold tracking-tight tabular-nums">{score}</p>
      {isNewBest && <span className="chip bg-highlight text-on-highlight">{t.newBest}</span>}
      {details.map((d) => (
        <p key={d} className="text-sm text-muted">{d}</p>
      ))}
      {!isNewBest && best !== null && <p className="text-xs text-muted">{fmt(t.best, { n: best })}</p>}
      {children}
      <button type="button" onClick={onAgain} className="btn-primary mt-3">{t.again}</button>
    </div>
  );
}
