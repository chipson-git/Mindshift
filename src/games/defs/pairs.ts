import type { GameDef } from "../types";
import { clamp, fmt, shuffle, statusBar } from "../util";

// Pair match: flip two cards at a time and find all six pairs in as few moves as possible.

const SYMBOLS = ["☀", "☾", "★", "♥", "♣", "♪", "✿", "◆", "▲", "✦"];
const PAIRS = 6;

/** 100 for a perfect game (6 moves), minus 6 points per extra move. */
export const pairsScore = (moves: number) => clamp(Math.round(100 - (moves - PAIRS) * 6));

export const pairsGame: GameDef = {
  id: "pairs",
  skill: "memory",
  minutes: 2,
  icon: "❖",
  tone: "success",
  normalize: (s) => s,
  play(el, { t, later, finish }) {
    const cards = shuffle(shuffle(SYMBOLS).slice(0, PAIRS).flatMap((s) => [s, s]));
    const matched = new Set<number>();
    let open: number[] = [];
    let moves = 0;
    let locked = false;
    const started = Date.now();

    el.innerHTML = `<div data-status></div><div class="g-grid g-grid-4" data-grid>${cards
      .map((_, i) => `<button type="button" class="g-card" data-i="${i}" aria-label="${i + 1}"><span></span></button>`)
      .join("")}</div>`;
    const status = el.querySelector<HTMLElement>("[data-status]")!;
    const buttons = [...el.querySelectorAll<HTMLButtonElement>("[data-i]")];

    const paint = () => {
      status.innerHTML = statusBar(fmt(t.pairsFound, { n: matched.size / 2, total: PAIRS }), fmt(t.pairsMoves, { n: moves }));
      buttons.forEach((b, i) => {
        const up = matched.has(i) || open.includes(i);
        b.dataset.state = matched.has(i) ? "done" : up ? "up" : "";
        b.firstElementChild!.textContent = up ? cards[i] : "";
      });
    };
    buttons.forEach((b, i) =>
      b.addEventListener("click", () => {
        if (locked || matched.has(i) || open.includes(i)) return;
        open.push(i);
        if (open.length === 2) {
          moves++;
          const [a, c] = open;
          if (cards[a] === cards[c]) {
            matched.add(a).add(c);
            open = [];
            if (matched.size === cards.length) {
              const secs = Math.round((Date.now() - started) / 1000);
              paint();
              later(() => finish(pairsScore(moves), [fmt(t.pairsMoves, { n: moves }), fmt(t.seconds, { n: secs })]), 400);
              return;
            }
          } else {
            locked = true;
            later(() => {
              open = [];
              locked = false;
              paint();
            }, 800);
          }
        }
        paint();
      }),
    );
    paint();
  },
};
