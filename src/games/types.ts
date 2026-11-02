import type { Dictionary } from "@/lib/i18n/en";
import type { Locale } from "@/lib/i18n/config";

// Framework-free game engine. The same code runs inside the Next.js app (mounted by a React
// wrapper) and in the static prototype (bundled with esbuild), so every game exists once.

export type GamesDict = Dictionary["games"];
export type ProgressDict = Dictionary["progress"];

export type Skill = "focus" | "memory" | "speed" | "control" | "reframing" | "emotions" | "calm";
export const SKILLS: Skill[] = ["focus", "memory", "speed", "control", "reframing", "emotions", "calm"];

export type GameId =
  | "focus"
  | "odd"
  | "memory"
  | "pairs"
  | "math"
  | "order"
  | "reflex"
  | "thoughts"
  | "feelings"
  | "breath";

export type Tone = "accent" | "success" | "secondary" | "coral";

export interface GameMeta {
  id: GameId;
  skill: Skill;
  minutes: number;
  icon: string;
  tone: Tone;
}

/** What a game can use while it runs. Timers and key handlers are cleaned up automatically. */
export interface PlayApi {
  t: GamesDict;
  locale: Locale;
  later(fn: () => void, ms: number): void;
  every(fn: () => void, ms: number): void;
  onKey(handler: (e: KeyboardEvent) => void): void;
  /** Ends the game with a raw score and lines shown under it. */
  finish(score: number, details: string[]): void;
}

export interface GameDef extends GameMeta {
  /** Maps the game's raw score to 0–100 so skills can be compared and charted. */
  normalize(score: number): number;
  /** Renders the game into `el` and starts it. */
  play(el: HTMLElement, api: PlayApi): void;
}

export interface GameResult {
  game: GameId;
  score: number;
  /** ISO timestamp. */
  at: string;
  /** Marks generated example data (prototype only). */
  sample?: boolean;
}

/** Where results are kept: localStorage today, the database later. */
export interface ResultStore {
  list(): GameResult[];
  add(result: GameResult): void;
}
