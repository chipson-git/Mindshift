import { describe, expect, it } from "vitest";
import { FOCUS_COLORS, focusRound, focusScore } from "@/games/defs/focus";
import { memorySequence } from "@/games/defs/memory";
import { reflexTrials } from "@/games/defs/reflex";
import { oddRound } from "@/games/defs/odd";
import { pairsScore } from "@/games/defs/pairs";
import { mathQuestion } from "@/games/defs/math";
import { orderScore } from "@/games/defs/order";
import { feelingOptions } from "@/games/defs/feelings";
import { breathPoints } from "@/games/defs/breath";
import { GAME_DEFS, GAMES, normalizeScore } from "@/games/registry";
import { sampleResults } from "@/games/sample";
import { accuracy, average, seededRng, shuffle } from "@/games/util";
import { THOUGHTS } from "@/lib/content/thoughts";
import { EMOTIONS, SITUATIONS } from "@/lib/content/feelings";
import { en } from "@/lib/i18n/en";

describe("game rules", () => {
  it("color focus rounds are mostly incongruent", () => {
    const rng = seededRng(1);
    const rounds = Array.from({ length: 2000 }, () => focusRound(rng));
    const share = rounds.filter((r) => r.word !== r.ink).length / rounds.length;
    expect(share).toBeGreaterThan(0.65);
    expect(share).toBeLessThan(0.75);
    rounds.forEach((r) => expect(FOCUS_COLORS).toContain(r.ink));
    expect(focusScore(20, 4)).toBe(18);
    expect(focusScore(1, 10)).toBe(0);
  });

  it("memory sequences never repeat a tile twice in a row", () => {
    const rng = seededRng(7);
    for (let len = 3; len < 12; len++) {
      const seq = memorySequence(len, rng);
      expect(seq).toHaveLength(len);
      seq.forEach((tile, i) => i > 0 && expect(tile).not.toBe(seq[i - 1]));
    }
  });

  it("reflex trials have an exact 70% go share", () => {
    expect(reflexTrials(30, seededRng(3)).filter(Boolean)).toHaveLength(21);
  });

  it("odd one out grows and gets harder", () => {
    const easy = oddRound(0, seededRng(1));
    const hard = oddRound(12, seededRng(1));
    expect(easy.size).toBe(3);
    expect(hard.size).toBe(6);
    expect(easy.odd).toBeLessThan(9);
    expect(easy.base).not.toBe(easy.other);
  });

  it("quick math questions are labelled correctly", () => {
    const rng = seededRng(5);
    for (let i = 0; i < 500; i++) {
      const q = mathQuestion(i % 15, rng);
      const [lhs, rhs] = q.text.split(" = ");
      const [a, op, b] = lhs.split(" ");
      const value = op === "+" ? +a + +b : op === "−" ? +a - +b : +a * +b;
      expect(value === Number(rhs)).toBe(q.correct);
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it("scores pairs, order and breath on a 0–100 scale", () => {
    expect(pairsScore(6)).toBe(100);
    expect(pairsScore(10)).toBe(76);
    expect(pairsScore(40)).toBe(0);
    expect(orderScore(10)).toBe(100);
    expect(orderScore(20)).toBe(50);
    expect(breathPoints(0)).toBe(100);
    expect(breathPoints(-750)).toBe(50);
    expect(breathPoints(3000)).toBe(0);
  });

  it("feeling options contain the answer and three other emotions", () => {
    const opts = feelingOptions("pride", seededRng(2));
    expect(opts).toHaveLength(4);
    expect(new Set(opts).size).toBe(4);
    expect(opts).toContain("pride");
  });

  it("helpers", () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRng(9)).sort()).toEqual([1, 2, 3, 4, 5]);
    expect(accuracy(9, 10)).toBe(90);
    expect(average([300, 400])).toBe(350);
  });
});

describe("game catalog", () => {
  it("has ten games covering all seven skills, each with texts", () => {
    expect(GAMES).toHaveLength(10);
    expect(new Set(GAMES.map((g) => g.skill)).size).toBe(7);
    for (const g of GAMES) expect(en.games.list[g.id].name).toBeTruthy();
  });

  it("normalizers map scores into 0–100 and never decrease", () => {
    for (const def of GAME_DEFS) {
      let prev = -1;
      for (let raw = 0; raw <= 200; raw++) {
        const v = normalizeScore(def.id, raw);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
        expect(v).toBeGreaterThanOrEqual(prev);
        prev = v;
      }
    }
  });

  it("content is complete in both languages", () => {
    for (const t of THOUGHTS) if (!t.helpful) expect(t.reframe?.ka && t.reframe?.en).toBeTruthy();
    for (const s of SITUATIONS) {
      expect(EMOTIONS).toContain(s.emotion);
      expect(s.text.ka && s.text.en).toBeTruthy();
    }
  });

  it("sample history trends upward and is marked as sample", () => {
    const results = sampleResults(28, new Date("2026-11-02T12:00:00Z"));
    expect(results.length).toBeGreaterThan(20);
    expect(results.every((r) => r.sample)).toBe(true);
    const norm = results.map((r) => normalizeScore(r.game, r.score));
    const third = Math.floor(norm.length / 3);
    expect(average(norm.slice(-third))).toBeGreaterThan(average(norm.slice(0, third)));
  });
});
