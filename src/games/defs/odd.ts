import type { GameDef } from "../types";
import { accuracy, clamp, fmt, randInt, statusBar, type Rng } from "../util";

// Odd one out: one tile is a slightly different shade. Find it; the grid grows and the
// difference shrinks as you go. Wrong taps cost 2 seconds.

const SECONDS = 45;
const HUES = [218, 140, 45, 0, 265];

export interface OddRound {
  size: number;
  odd: number;
  base: string;
  other: string;
}

export function oddRound(level: number, rng: Rng = Math.random): OddRound {
  const size = level < 3 ? 3 : level < 6 ? 4 : level < 10 ? 5 : 6;
  const hue = HUES[randInt(HUES.length, rng)];
  const light = 52 + randInt(10, rng);
  const delta = Math.max(4, 18 - level * 1.3);
  return {
    size,
    odd: randInt(size * size, rng),
    base: `hsl(${hue} 70% ${light}%)`,
    other: `hsl(${hue} 70% ${Math.round(light + delta)}%)`,
  };
}

export const oddGame: GameDef = {
  id: "odd",
  skill: "focus",
  minutes: 1,
  icon: "◫",
  tone: "accent",
  normalize: (s) => clamp(s * 4),
  play(el, { t, every, finish }) {
    let level = 0;
    let wrong = 0;
    let endAt = Date.now() + SECONDS * 1000;
    let round = oddRound(level);

    el.innerHTML = `${statusBar(t.oddPrompt, `<span data-time></span>`)}<div class="g-grid" data-grid></div><p class="g-foot" data-count></p>`;
    const grid = el.querySelector<HTMLElement>("[data-grid]")!;
    const time = el.querySelector<HTMLElement>("[data-time]")!;
    const count = el.querySelector<HTMLElement>("[data-count]")!;

    const paint = () => {
      grid.style.gridTemplateColumns = `repeat(${round.size}, 1fr)`;
      grid.innerHTML = Array.from(
        { length: round.size * round.size },
        (_, i) => `<button type="button" class="g-swatch" data-i="${i}" style="background:${i === round.odd ? round.other : round.base}" aria-label="${i + 1}"></button>`,
      ).join("");
      count.textContent = `✓ ${level} · ✗ ${wrong}`;
    };
    grid.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      if (!b) return;
      if (Number(b.dataset.i) === round.odd) {
        level++;
        round = oddRound(level);
        paint();
      } else {
        wrong++;
        endAt -= 2000;
        b.classList.add("bad");
        count.textContent = `✓ ${level} · ✗ ${wrong}`;
      }
    });
    every(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      time.textContent = fmt(t.seconds, { n: left });
      if (left === 0) finish(level, [`✓ ${level} · ✗ ${wrong}`, fmt(t.accuracy, { n: accuracy(level, level + wrong) })]);
    }, 200);
    paint();
  },
};
