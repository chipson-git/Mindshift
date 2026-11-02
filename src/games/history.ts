import type { GameId, GameResult, ResultStore, Skill } from "./types";

// Result history and the numbers behind the leaderboard and progress charts.
// Pure functions take the result list plus a `normalize` lookup so they are easy to test.

export type Normalizer = (game: GameId, score: number) => number;
export type SkillOf = (game: GameId) => Skill;

const MAX_RESULTS = 2000;

/** Results kept in localStorage under one key (per browser). */
export function browserStore(key = "mindshift-results"): ResultStore {
  let memory: GameResult[] = [];
  const read = (): GameResult[] => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as GameResult[]) : memory;
    } catch {
      return memory;
    }
  };
  return {
    list: read,
    add(result) {
      const next = [...read(), result].slice(-MAX_RESULTS);
      memory = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage blocked: keep results for this visit only.
      }
    },
  };
}

export const resultsFor = (results: GameResult[], game: GameId) => results.filter((r) => r.game === game);

export function bestScore(results: GameResult[], game: GameId): number | null {
  const mine = resultsFor(results, game);
  return mine.length ? Math.max(...mine.map((r) => r.score)) : null;
}

/** Top results for one game, best first; ties go to the earlier result. */
export function topResults(results: GameResult[], game: GameId, n = 5): GameResult[] {
  return [...resultsFor(results, game)].sort((a, b) => b.score - a.score || a.at.localeCompare(b.at)).slice(0, n);
}

/** 1-based rank of a score among all results of that game (equal scores share a rank). */
export function rankOf(results: GameResult[], game: GameId, score: number): { rank: number; total: number } {
  const mine = resultsFor(results, game);
  return { rank: mine.filter((r) => r.score > score).length + 1, total: mine.length };
}

const dayOf = (iso: string) => iso.slice(0, 10);

/** Daily average of normalized scores for one skill, oldest first. */
export function skillSeries(
  results: GameResult[],
  skill: Skill,
  skillOf: SkillOf,
  normalize: Normalizer,
): { day: string; value: number }[] {
  const byDay = new Map<string, number[]>();
  for (const r of results) {
    if (skillOf(r.game) !== skill) continue;
    const day = dayOf(r.at);
    byDay.set(day, [...(byDay.get(day) ?? []), normalize(r.game, r.score)]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, values]) => ({ day, value: Math.round(values.reduce((a, b) => a + b, 0) / values.length) }));
}

/**
 * Current level of a skill (average of the last `window` results, 0–100) and the change
 * versus the `window` results before that. `delta` is null until there are two windows.
 */
export function skillLevel(
  results: GameResult[],
  skill: Skill,
  skillOf: SkillOf,
  normalize: Normalizer,
  window = 5,
): { level: number | null; delta: number | null; sessions: number } {
  const values = [...results]
    .filter((r) => skillOf(r.game) === skill)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((r) => normalize(r.game, r.score));
  const avg = (v: number[]) => Math.round(v.reduce((a, b) => a + b, 0) / v.length);
  if (!values.length) return { level: null, delta: null, sessions: 0 };
  const recent = values.slice(-window);
  const before = values.slice(-2 * window, -window);
  return {
    level: avg(recent),
    delta: before.length >= Math.min(3, window) ? avg(recent) - avg(before) : null,
    sessions: values.length,
  };
}

/** Number of sessions in the last 7 days and the 7 days before. */
export function weeklyCounts(results: GameResult[], now = new Date()): { thisWeek: number; lastWeek: number } {
  const day = 86_400_000;
  const t = now.getTime();
  let thisWeek = 0;
  let lastWeek = 0;
  for (const r of results) {
    const age = t - new Date(r.at).getTime();
    if (age < 7 * day) thisWeek++;
    else if (age < 14 * day) lastWeek++;
  }
  return { thisWeek, lastWeek };
}
