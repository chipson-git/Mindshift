import { describe, expect, it } from "vitest";
import { currentStreak, dailyIndex, lastDays, longestStreak } from "@/lib/streak";

describe("streaks", () => {
  const today = "2026-11-02";

  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-11-02", "2026-11-01", "2026-10-31"], today)).toBe(3);
  });

  it("keeps yesterday's streak alive until today is over", () => {
    expect(currentStreak(["2026-11-01", "2026-10-31"], today)).toBe(2);
  });

  it("resets after a missed day", () => {
    expect(currentStreak(["2026-10-30", "2026-10-29"], today)).toBe(0);
    expect(currentStreak([], today)).toBe(0);
  });

  it("crosses month boundaries", () => {
    expect(currentStreak(["2026-11-01", "2026-10-31", "2026-10-30"], "2026-11-01")).toBe(3);
  });

  it("finds the longest run", () => {
    expect(longestStreak(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-10", "2026-10-11"])).toBe(3);
    expect(longestStreak([])).toBe(0);
  });

  it("lists the last N days oldest first", () => {
    expect(lastDays(3, today)).toEqual(["2026-10-31", "2026-11-01", "2026-11-02"]);
  });

  it("rotates the daily exercise", () => {
    const a = dailyIndex(7, "2026-11-02");
    const b = dailyIndex(7, "2026-11-03");
    expect(b).toBe((a + 1) % 7);
  });
});
