import type { GameDef } from "../types";
import { accuracy, clamp, fmt, randInt, statusBar, type Rng } from "../util";

// Quick math: is the equation correct? Questions get harder as you answer correctly.

const SECONDS = 45;

export interface MathQuestion {
  text: string;
  correct: boolean;
}

export function mathQuestion(level: number, rng: Rng = Math.random): MathQuestion {
  const ops = level < 4 ? ["+"] : level < 9 ? ["+", "−"] : ["+", "−", "×"];
  const op = ops[randInt(ops.length, rng)];
  const max = Math.min(10 + level * 3, 60);
  let a = 1 + randInt(max, rng);
  let b = 1 + randInt(max, rng);
  if (op === "×") {
    a = 2 + randInt(8, rng);
    b = 2 + randInt(8, rng);
  }
  if (op === "−" && b > a) [a, b] = [b, a];
  const answer = op === "+" ? a + b : op === "−" ? a - b : a * b;
  const correct = rng() < 0.5;
  const shown = correct ? answer : answer + (rng() < 0.5 ? -1 : 1) * (1 + randInt(3, rng));
  return { text: `${a} ${op} ${b} = ${shown}`, correct };
}

export const mathScore = (correct: number, wrong: number) => Math.max(0, Math.round(correct - wrong / 2));

export const mathGame: GameDef = {
  id: "math",
  skill: "speed",
  minutes: 1,
  icon: "±",
  tone: "secondary",
  normalize: (s) => clamp(s * 3.3),
  play(el, { t, later, every, onKey, finish }) {
    let correct = 0;
    let wrong = 0;
    let q = mathQuestion(0);
    const endAt = Date.now() + SECONDS * 1000;

    el.innerHTML = `${statusBar(t.mathPrompt, `<span data-time></span>`)}
      <div class="g-stage" data-stage><span class="g-word g-mono" data-q></span></div>
      <div class="g-choices">
        <button type="button" class="btn btn-secondary g-btn g-center" data-a="1"><span class="g-ok">✓</span>${t.mathTrue}</button>
        <button type="button" class="btn btn-secondary g-btn g-center" data-a="0"><span class="g-bad">✗</span>${t.mathFalse}</button>
      </div><p class="g-foot" data-count></p>`;
    const stage = el.querySelector<HTMLElement>("[data-stage]")!;
    const qEl = el.querySelector<HTMLElement>("[data-q]")!;
    const time = el.querySelector<HTMLElement>("[data-time]")!;
    const count = el.querySelector<HTMLElement>("[data-count]")!;

    const paint = () => {
      qEl.textContent = q.text;
      count.textContent = `✓ ${correct} · ✗ ${wrong}`;
    };
    const answer = (yes: boolean) => {
      const ok = yes === q.correct;
      if (ok) correct++;
      else wrong++;
      stage.dataset.flash = ok ? "ok" : "bad";
      later(() => delete stage.dataset.flash, 180);
      q = mathQuestion(correct);
      paint();
    };
    el.querySelectorAll<HTMLButtonElement>("[data-a]").forEach((b) => b.addEventListener("click", () => answer(b.dataset.a === "1")));
    onKey((e) => {
      if (e.key === "ArrowLeft") answer(true);
      if (e.key === "ArrowRight") answer(false);
    });
    every(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      time.textContent = fmt(t.seconds, { n: left });
      if (left === 0) finish(mathScore(correct, wrong), [`✓ ${correct} · ✗ ${wrong}`, fmt(t.accuracy, { n: accuracy(correct, correct + wrong) })]);
    }, 200);
    paint();
  },
};
