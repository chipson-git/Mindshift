import type { GameResult } from "./types";
import { GAME_DEFS } from "./registry";
import { randInt, seededRng } from "./util";

// Example history for the prototype: four weeks of play with a gentle upward trend,
// so the progress page has something to show. Every result is marked `sample: true`.

/** Smallest raw score whose normalized value reaches `target` (normalizers are monotonic). */
function rawFor(normalize: (s: number) => number, target: number): number {
  for (let raw = 0; raw <= 300; raw++) if (normalize(raw) >= target) return raw;
  return 300;
}

export function sampleResults(days = 28, now = new Date(), seed = 42): GameResult[] {
  const rng = seededRng(seed);
  const out: GameResult[] = [];
  for (let d = days; d >= 1; d--) {
    if (rng() < 0.2) continue; // skipped day
    const progress = (days - d) / days;
    const sessions = 2 + randInt(4, rng);
    for (let s = 0; s < sessions; s++) {
      const def = GAME_DEFS[randInt(GAME_DEFS.length, rng)];
      const target = Math.max(5, Math.min(98, 30 + progress * 50 + (rng() - 0.5) * 18));
      const at = new Date(now.getTime() - d * 86_400_000 + s * 3_600_000 + 9 * 3_600_000);
      out.push({ game: def.id, score: rawFor(def.normalize, target), at: at.toISOString(), sample: true });
    }
  }
  return out;
}
