import { describe, expect, it } from "vitest";
import {
  accuracy,
  average,
  FOCUS_COLORS,
  focusRound,
  focusScore,
  memorySequence,
  reflexTrials,
  seededRng,
  shuffle,
} from "@/lib/games";
import { THOUGHTS } from "@/lib/content/thoughts";

describe("games", () => {
  it("color focus rounds are mostly incongruent and use known colors", () => {
    const rng = seededRng(1);
    const rounds = Array.from({ length: 2000 }, () => focusRound(rng));
    const incongruent = rounds.filter((r) => r.word !== r.ink).length / rounds.length;
    expect(incongruent).toBeGreaterThan(0.65);
    expect(incongruent).toBeLessThan(0.75);
    for (const r of rounds) {
      expect(FOCUS_COLORS).toContain(r.word);
      expect(FOCUS_COLORS).toContain(r.ink);
    }
  });

  it("color focus score penalises guessing and never goes negative", () => {
    expect(focusScore(20, 0)).toBe(20);
    expect(focusScore(20, 4)).toBe(18);
    expect(focusScore(1, 10)).toBe(0);
  });

  it("memory sequences have the right length and no immediate repeats", () => {
    const rng = seededRng(7);
    for (let len = 3; len < 12; len++) {
      const seq = memorySequence(len, rng);
      expect(seq).toHaveLength(len);
      seq.forEach((tile, i) => {
        expect(tile).toBeGreaterThanOrEqual(0);
        expect(tile).toBeLessThan(9);
        if (i > 0) expect(tile).not.toBe(seq[i - 1]);
      });
    }
  });

  it("reflex trials have an exact 70% go share", () => {
    const trials = reflexTrials(30, seededRng(3));
    expect(trials).toHaveLength(30);
    expect(trials.filter(Boolean)).toHaveLength(21);
  });

  it("shuffle keeps every item", () => {
    const items = [1, 2, 3, 4, 5, 6];
    expect(shuffle(items, seededRng(9)).sort()).toEqual(items);
  });

  it("computes accuracy and averages", () => {
    expect(accuracy(9, 10)).toBe(90);
    expect(accuracy(0, 0)).toBe(0);
    expect(average([300, 400])).toBe(350);
    expect(average([])).toBe(0);
  });

  it("every unhelpful thought has a reframe, in both languages", () => {
    expect(THOUGHTS.filter((t) => t.helpful).length).toBeGreaterThanOrEqual(5);
    expect(THOUGHTS.filter((t) => !t.helpful).length).toBeGreaterThanOrEqual(5);
    for (const t of THOUGHTS) {
      expect(t.text.ka && t.text.en).toBeTruthy();
      if (!t.helpful) expect(t.reframe?.ka && t.reframe?.en).toBeTruthy();
    }
  });
});
