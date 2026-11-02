import { describe, expect, it } from "vitest";
import { rankOf, skillLevel, skillSeries, topResults, weeklyCounts, bestScore } from "@/games/history";
import type { GameId, GameResult, Skill } from "@/games/types";

const skillOf = (g: GameId): Skill => (g === "memory" ? "memory" : "focus");
const normalize = (_g: GameId, s: number) => s;
const r = (game: GameId, score: number, at: string): GameResult => ({ game, score, at });

const results = [
  r("focus", 40, "2026-10-01T10:00:00Z"),
  r("focus", 55, "2026-10-01T18:00:00Z"),
  r("focus", 50, "2026-10-03T10:00:00Z"),
  r("focus", 70, "2026-10-05T10:00:00Z"),
  r("memory", 30, "2026-10-05T11:00:00Z"),
];

describe("history", () => {
  it("finds the best score and top results", () => {
    expect(bestScore(results, "focus")).toBe(70);
    expect(bestScore(results, "odd")).toBeNull();
    expect(topResults(results, "focus", 2).map((x) => x.score)).toEqual([70, 55]);
  });

  it("ranks a score among the player's own results", () => {
    expect(rankOf(results, "focus", 70)).toEqual({ rank: 1, total: 4 });
    expect(rankOf(results, "focus", 50)).toEqual({ rank: 3, total: 4 });
  });

  it("averages a skill per day", () => {
    expect(skillSeries(results, "focus", skillOf, normalize)).toEqual([
      { day: "2026-10-01", value: 48 },
      { day: "2026-10-03", value: 50 },
      { day: "2026-10-05", value: 70 },
    ]);
  });

  it("compares the last results with the ones before", () => {
    const lvl = skillLevel(results, "focus", skillOf, normalize, 2);
    expect(lvl).toEqual({ level: 60, delta: 12, sessions: 4 });
    expect(skillLevel(results, "memory", skillOf, normalize, 5).delta).toBeNull();
    expect(skillLevel(results, "calm", skillOf, normalize).level).toBeNull();
  });

  it("counts games this week and last week", () => {
    expect(weeklyCounts(results, new Date("2026-10-09T12:00:00Z"))).toEqual({ thisWeek: 3, lastWeek: 2 });
  });
});
