import type { GameDef } from "../types";
import { accuracy, clamp, fmt, randInt, statusBar, type Rng } from "../util";

// Color focus (Stroop-style): press the INK color of the word, not what the word says.

export const FOCUS_COLORS = ["blue", "green", "red", "yellow"] as const;
export type FocusColor = (typeof FOCUS_COLORS)[number];
export const FOCUS_SECONDS = 45;
export const FOCUS_INCONGRUENT = 0.7;

export function focusRound(rng: Rng = Math.random): { word: FocusColor; ink: FocusColor } {
  const word = FOCUS_COLORS[randInt(4, rng)];
  if (rng() >= FOCUS_INCONGRUENT) return { word, ink: word };
  const others = FOCUS_COLORS.filter((c) => c !== word);
  return { word, ink: others[randInt(3, rng)] };
}

/** Correct minus half the wrong answers, so guessing doesn't pay. */
export const focusScore = (correct: number, wrong: number) => Math.max(0, Math.round(correct - wrong / 2));

export const focusGame: GameDef = {
  id: "focus",
  skill: "focus",
  minutes: 1,
  icon: "Aa",
  tone: "accent",
  normalize: (s) => clamp(s * 2.5),
  play(el, { t, later, every, onKey, finish }) {
    let correct = 0;
    let wrong = 0;
    let round = focusRound();
    const endAt = Date.now() + FOCUS_SECONDS * 1000;

    el.innerHTML = `
      ${statusBar(t.focusPrompt, `<span data-time>${fmt(t.seconds, { n: FOCUS_SECONDS })}</span>`)}
      <div class="g-stage" data-stage><span class="g-word" data-word></span></div>
      <div class="g-choices">${FOCUS_COLORS.map(
        (c, i) => `<button type="button" class="btn btn-secondary g-btn" data-c="${c}"><span class="g-dot" style="background:var(--ink-${c})"></span>${t.colors[c]}<span class="g-key">${i + 1}</span></button>`,
      ).join("")}</div>
      <p class="g-foot" data-count></p>`;
    const word = el.querySelector<HTMLElement>("[data-word]")!;
    const stage = el.querySelector<HTMLElement>("[data-stage]")!;
    const time = el.querySelector<HTMLElement>("[data-time]")!;
    const count = el.querySelector<HTMLElement>("[data-count]")!;

    const paint = () => {
      word.textContent = t.colors[round.word];
      word.style.color = `var(--ink-${round.ink})`;
      count.textContent = `✓ ${correct} · ✗ ${wrong}`;
    };
    const answer = (c: FocusColor) => {
      const ok = c === round.ink;
      if (ok) correct++;
      else wrong++;
      stage.dataset.flash = ok ? "ok" : "bad";
      later(() => delete stage.dataset.flash, 180);
      round = focusRound();
      paint();
    };
    el.querySelectorAll<HTMLButtonElement>("[data-c]").forEach((b) =>
      b.addEventListener("click", () => answer(b.dataset.c as FocusColor)),
    );
    onKey((e) => {
      const i = Number(e.key) - 1;
      if (i >= 0 && i < 4) answer(FOCUS_COLORS[i]);
    });
    every(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      time.textContent = fmt(t.seconds, { n: left });
      if (left === 0) finish(focusScore(correct, wrong), [`✓ ${correct} · ✗ ${wrong}`, fmt(t.accuracy, { n: accuracy(correct, correct + wrong) })]);
    }, 200);
    paint();
  },
};
