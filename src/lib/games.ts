// Training games: metadata and the pure logic behind each game (round generation, scoring).
// UI lives in src/components/games; keeping logic here makes it testable.

export type GameId = "focus" | "memory" | "reflex" | "thoughts";
export type Skill = "focus" | "memory" | "control" | "reframing";

export interface GameMeta {
  id: GameId;
  skill: Skill;
  minutes: number;
  icon: string;
  /** Palette tone used for the card icon. */
  tone: "accent" | "success" | "secondary" | "coral";
}

export const GAMES: GameMeta[] = [
  { id: "focus", skill: "focus", minutes: 1, icon: "◐", tone: "accent" },
  { id: "memory", skill: "memory", minutes: 2, icon: "▦", tone: "success" },
  { id: "reflex", skill: "control", minutes: 2, icon: "●", tone: "coral" },
  { id: "thoughts", skill: "reframing", minutes: 3, icon: "✎", tone: "secondary" },
];

export function isGameId(value: unknown): value is GameId {
  return GAMES.some((g) => g.id === value);
}

/** Random source in [0, 1). Injected so tests can be deterministic. */
export type Rng = () => number;

/** Small seeded PRNG (mulberry32) for tests and reproducible rounds. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (rng: Rng, max: number) => Math.floor(rng() * max);

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ---------- Color focus (Stroop-style) ---------- */

export const FOCUS_COLORS = ["blue", "green", "red", "yellow"] as const;
export type FocusColor = (typeof FOCUS_COLORS)[number];
export const FOCUS_SECONDS = 45;
/** Share of rounds where word and ink differ (the hard ones). */
export const FOCUS_INCONGRUENT = 0.7;

export interface FocusRound {
  word: FocusColor;
  ink: FocusColor;
}

export function focusRound(rng: Rng = Math.random): FocusRound {
  const word = FOCUS_COLORS[randInt(rng, FOCUS_COLORS.length)];
  if (rng() >= FOCUS_INCONGRUENT) return { word, ink: word };
  const others = FOCUS_COLORS.filter((c) => c !== word);
  return { word, ink: others[randInt(rng, others.length)] };
}

/** Score = correct answers minus half the wrong ones (guessing doesn't pay), never below 0. */
export function focusScore(correct: number, wrong: number): number {
  return Math.max(0, Math.round(correct - wrong / 2));
}

/* ---------- Sequence memory ---------- */

export const MEMORY_GRID = 9;
export const MEMORY_START_LENGTH = 3;
export const MEMORY_LIVES = 2;

/** A sequence of tile indexes with no tile repeated twice in a row. */
export function memorySequence(length: number, rng: Rng = Math.random, size = MEMORY_GRID): number[] {
  const seq: number[] = [];
  while (seq.length < length) {
    const next = randInt(rng, size);
    if (next !== seq[seq.length - 1]) seq.push(next);
  }
  return seq;
}

/* ---------- Calm reflex (go / no-go) ---------- */

export const REFLEX_TRIALS = 30;
export const REFLEX_GO_SHARE = 0.7;
export const REFLEX_SHOW_MS = 900;

/** true = go (green, press), false = no-go (coral, hold back). Exact share, shuffled. */
export function reflexTrials(count = REFLEX_TRIALS, rng: Rng = Math.random): boolean[] {
  const go = Math.round(count * REFLEX_GO_SHARE);
  return shuffle([...Array(go).fill(true), ...Array(count - go).fill(false)], rng);
}

export function average(values: number[]): number {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

/* ---------- Thought sort ---------- */

export const THOUGHTS_PER_GAME = 10;

/* ---------- Shared ---------- */

export function accuracy(correct: number, total: number): number {
  return total ? Math.round((correct / total) * 100) : 0;
}

/** Best scores are kept per browser for now (a database column later). */
export const bestScoreKey = (id: GameId) => `mindshift-best-${id}`;
