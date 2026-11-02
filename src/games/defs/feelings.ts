import type { GameDef } from "../types";
import { EMOTIONS, SITUATIONS, type Emotion } from "@/lib/content/feelings";
import { accuracy, esc, fmt, shuffle, statusBar, type Rng } from "../util";

// Feeling match: read a short situation and pick the most likely emotion.

export const FEELINGS_PER_GAME = 10;

/** The right emotion plus three different ones, shuffled. */
export function feelingOptions(answer: Emotion, rng: Rng = Math.random): Emotion[] {
  const others = shuffle(EMOTIONS.filter((e) => e !== answer), rng).slice(0, 3);
  return shuffle([answer, ...others], rng);
}

export const feelingsGame: GameDef = {
  id: "feelings",
  skill: "emotions",
  minutes: 2,
  icon: "☺",
  tone: "secondary",
  normalize: (s) => s * 10,
  play(el, { t, locale, finish }) {
    const deck = shuffle(SITUATIONS).slice(0, FEELINGS_PER_GAME);
    let i = 0;
    let correct = 0;

    const render = (picked: Emotion | null, options: Emotion[]) => {
      const s = deck[i];
      el.innerHTML = `${statusBar(t.feelingsPrompt, fmt(t.progress, { n: i + 1, total: deck.length }))}
        <blockquote class="g-quote g-quote-left">${esc(s.text[locale])}</blockquote>
        <div class="g-choices">${options
          .map((e) => {
            const state = picked === null ? "" : e === s.emotion ? "right" : e === picked ? "wrong" : "";
            return `<button type="button" class="btn btn-secondary g-btn g-center" data-e="${e}" data-state="${state}" ${picked ? "disabled" : ""}>${t.emotions[e]}</button>`;
          })
          .join("")}</div>
        ${picked ? `<div><button type="button" class="btn btn-primary" data-next>${t.thoughtsNext}</button></div>` : ""}`;
      el.querySelectorAll<HTMLButtonElement>("[data-e]").forEach((b) =>
        b.addEventListener("click", () => {
          const e = b.dataset.e as Emotion;
          if (e === s.emotion) correct++;
          render(e, options);
        }),
      );
      el.querySelector("[data-next]")?.addEventListener("click", () => {
        if (i + 1 >= deck.length) {
          finish(correct, [fmt(t.progress, { n: correct, total: deck.length }), fmt(t.accuracy, { n: accuracy(correct, deck.length) })]);
          return;
        }
        i++;
        render(null, feelingOptions(deck[i].emotion));
      });
    };
    render(null, feelingOptions(deck[0].emotion));
  },
};
