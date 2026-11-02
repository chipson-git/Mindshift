import type { GameDef } from "../types";
import { clamp, fmt, shuffle, statusBar } from "../util";

// Number order: tap 1 to 16 in order as fast as you can. Wrong taps add one second.

const COUNT = 16;

/** 10 s → 100, 20 s → 50. */
export const orderScore = (seconds: number) => clamp(Math.round(1000 / Math.max(seconds, 1)));

export const orderGame: GameDef = {
  id: "order",
  skill: "speed",
  minutes: 1,
  icon: "#",
  tone: "coral",
  normalize: (s) => s,
  play(el, { t, every, finish }) {
    const numbers = shuffle(Array.from({ length: COUNT }, (_, i) => i + 1));
    let next = 1;
    let penalty = 0;
    let mistakes = 0;
    const started = Date.now();
    const elapsed = () => (Date.now() - started) / 1000 + penalty;

    el.innerHTML = `<div data-status></div><div class="g-grid g-grid-4">${numbers
      .map((n) => `<button type="button" class="g-tile g-numtile" data-n="${n}">${n}</button>`)
      .join("")}</div>`;
    const status = el.querySelector<HTMLElement>("[data-status]")!;
    const paint = () => {
      status.innerHTML = statusBar(fmt(t.orderNext, { n: next }), fmt(t.seconds, { n: elapsed().toFixed(1) }));
    };
    el.querySelectorAll<HTMLButtonElement>("[data-n]").forEach((b) =>
      b.addEventListener("click", () => {
        if (Number(b.dataset.n) === next) {
          b.classList.add("done");
          b.disabled = true;
          next++;
          if (next > COUNT) {
            const secs = elapsed();
            finish(orderScore(secs), [fmt(t.seconds, { n: secs.toFixed(1) }), fmt(t.orderMistakes, { n: mistakes })]);
            return;
          }
        } else {
          penalty += 1;
          mistakes++;
          b.classList.add("bad");
          setTimeout(() => b.classList.remove("bad"), 300);
        }
        paint();
      }),
    );
    every(paint, 100);
    paint();
  },
};
