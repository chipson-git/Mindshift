"use client";

import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/i18n";
import { MEMORY_GRID, MEMORY_LIVES, MEMORY_START_LENGTH, memorySequence } from "@/lib/games";
import { IntroCard, ResultCard, useBestScore, type GamesDict, type Phase } from "./GameFrame";

// Sequence memory: watch the tiles light up, then tap them in the same order.
// Score = the longest sequence repeated correctly.

const ON_MS = 600;
const GAP_MS = 250;

export function MemoryGame({ t }: { t: GamesDict }) {
  const { best, submit } = useBestScore("memory");
  const [phase, setPhase] = useState<Phase>("intro");
  const [stage, setStage] = useState<"show" | "input">("show");
  const [sequence, setSequence] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [pos, setPos] = useState(0);
  const [lives, setLives] = useState(MEMORY_LIVES);
  const [longest, setLongest] = useState(0);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [newBest, setNewBest] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const playSequence = (length: number) => {
    const seq = memorySequence(length);
    setSequence(seq);
    setPos(0);
    setStage("show");
    setLit(null);
    seq.forEach((tile, i) => {
      later(() => setLit(tile), 500 + i * (ON_MS + GAP_MS));
      later(() => setLit(null), 500 + i * (ON_MS + GAP_MS) + ON_MS);
    });
    later(() => setStage("input"), 500 + seq.length * (ON_MS + GAP_MS));
  };

  const start = () => {
    clearTimers();
    setLives(MEMORY_LIVES);
    setLongest(0);
    setPhase("play");
    playSequence(MEMORY_START_LENGTH);
  };

  const tap = (tile: number) => {
    if (stage !== "input") return;
    setLit(tile);
    later(() => setLit(null), 180);
    if (tile !== sequence[pos]) {
      setWrongTile(tile);
      later(() => setWrongTile(null), 400);
      const remaining = lives - 1;
      setLives(remaining);
      setStage("show");
      if (remaining <= 0) {
        later(() => {
          setNewBest(submit(longest));
          setPhase("done");
        }, 500);
      } else {
        later(() => playSequence(sequence.length), 700);
      }
      return;
    }
    if (pos + 1 === sequence.length) {
      setLongest(sequence.length);
      setStage("show");
      later(() => playSequence(sequence.length + 1), 700);
    } else {
      setPos(pos + 1);
    }
  };

  if (phase === "intro") return <IntroCard t={t} howTo={t.list.memory.howTo} best={best} onStart={start} />;
  if (phase === "done") {
    return <ResultCard t={t} score={longest} details={[fmt(t.memoryLength, { n: longest })]} isNewBest={newBest} best={best} onAgain={start} />;
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="font-medium text-text">{stage === "show" ? t.memoryWatch : t.memoryYourTurn}</span>
        <span className="tabular-nums">
          {fmt(t.memoryLength, { n: sequence.length })} · {fmt(t.memoryLives, { n: lives })}
        </span>
      </div>
      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3">
        {Array.from({ length: MEMORY_GRID }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            disabled={stage !== "input"}
            aria-label={String(i + 1)}
            className={`aspect-square rounded-2xl border transition-colors duration-150 disabled:cursor-default ${
              wrongTile === i
                ? "border-danger bg-coral"
                : lit === i
                  ? "border-accent bg-accent"
                  : "border-border bg-surface-muted hover:enabled:bg-accent-soft"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
