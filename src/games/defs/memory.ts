import type { GameDef } from "../types";
import { clamp, fmt, randInt, statusBar, type Rng } from "../util";

// Sequence memory: watch tiles light up, repeat the order. Score = longest sequence repeated.

export const MEMORY_GRID = 9;
const START = 3;
const LIVES = 2;

/** Tile indexes with no tile repeated twice in a row. */
export function memorySequence(length: number, rng: Rng = Math.random, size = MEMORY_GRID): number[] {
  const seq: number[] = [];
  while (seq.length < length) {
    const next = randInt(size, rng);
    if (next !== seq[seq.length - 1]) seq.push(next);
  }
  return seq;
}

export const memoryGame: GameDef = {
  id: "memory",
  skill: "memory",
  minutes: 2,
  icon: "▦",
  tone: "success",
  normalize: (s) => clamp((s - 2) * 12.5),
  play(el, { t, later, finish }) {
    let seq: number[] = [];
    let pos = 0;
    let lives = LIVES;
    let longest = 0;
    let input = false;

    el.innerHTML = `<div data-status></div>
      <div class="g-grid g-grid-3">${Array.from({ length: MEMORY_GRID }, (_, i) => `<button type="button" class="g-tile" data-i="${i}" aria-label="${i + 1}" disabled></button>`).join("")}</div>`;
    const status = el.querySelector<HTMLElement>("[data-status]")!;
    const tiles = [...el.querySelectorAll<HTMLButtonElement>("[data-i]")];

    const paintStatus = () => {
      status.innerHTML = statusBar(
        `<b>${input ? t.memoryYourTurn : t.memoryWatch}</b>`,
        `${fmt(t.memoryLength, { n: seq.length })} · ${fmt(t.memoryLives, { n: lives })}`,
      );
      tiles.forEach((b) => (b.disabled = !input));
    };
    const flash = (i: number, cls: "lit" | "bad", ms: number) => {
      tiles[i].classList.add(cls);
      later(() => tiles[i].classList.remove(cls), ms);
    };
    const show = (length: number) => {
      seq = memorySequence(length);
      pos = 0;
      input = false;
      paintStatus();
      seq.forEach((tile, i) => later(() => flash(tile, "lit", 600), 500 + i * 850));
      later(() => {
        input = true;
        paintStatus();
      }, 500 + seq.length * 850);
    };

    tiles.forEach((b, i) =>
      b.addEventListener("click", () => {
        if (!input) return;
        if (i !== seq[pos]) {
          flash(i, "bad", 400);
          lives--;
          input = false;
          paintStatus();
          if (lives <= 0) later(() => finish(longest, [fmt(t.memoryLength, { n: longest })]), 500);
          else later(() => show(seq.length), 800);
          return;
        }
        flash(i, "lit", 180);
        pos++;
        if (pos === seq.length) {
          longest = seq.length;
          input = false;
          paintStatus();
          later(() => show(seq.length + 1), 700);
        }
      }),
    );
    show(START);
  },
};
