import type { GameDef } from "../types";
import { THOUGHTS } from "@/lib/content/thoughts";
import { accuracy, esc, fmt, shuffle, statusBar } from "../util";

// Thought sort: is the thought helpful or unhelpful? Unhelpful ones show a kinder reframe.

export const THOUGHTS_PER_GAME = 10;

export const thoughtsGame: GameDef = {
  id: "thoughts",
  skill: "reframing",
  minutes: 3,
  icon: "✎",
  tone: "secondary",
  normalize: (s) => s * 10,
  play(el, { t, locale, finish }) {
    const half = THOUGHTS_PER_GAME / 2;
    const deck = shuffle([
      ...shuffle(THOUGHTS.filter((x) => x.helpful)).slice(0, half),
      ...shuffle(THOUGHTS.filter((x) => !x.helpful)).slice(0, half),
    ]);
    let i = 0;
    let correct = 0;

    const render = (answer: boolean | null) => {
      const th = deck[i];
      const right = answer === th.helpful;
      const bottom =
        answer === null
          ? `<div class="g-choices">
              <button type="button" class="btn btn-secondary g-btn g-center" data-a="1"><span class="g-ok">✓</span>${t.thoughtsHelpful}</button>
              <button type="button" class="btn btn-secondary g-btn g-center" data-a="0"><span class="g-bad">✗</span>${t.thoughtsUnhelpful}</button>
            </div>`
          : `<div class="g-feedback" aria-live="polite">
              <p class="${right ? "g-ok" : "g-bad"}"><b>${right ? t.thoughtsRight : t.thoughtsWrong}</b> · ${th.helpful ? t.thoughtsHelpful : t.thoughtsUnhelpful}</p>
              ${th.reframe ? `<div class="g-note"><b>${t.thoughtsTry}</b><br>${esc(th.reframe[locale])}</div>` : ""}
              <div><button type="button" class="btn btn-primary" data-next>${t.thoughtsNext}</button></div>
            </div>`;
      el.innerHTML = `${statusBar(t.list.thoughts.name, fmt(t.progress, { n: i + 1, total: deck.length }))}
        <blockquote class="g-quote">“${esc(th.text[locale])}”</blockquote>${bottom}`;
      el.querySelectorAll<HTMLButtonElement>("[data-a]").forEach((b) =>
        b.addEventListener("click", () => {
          const a = b.dataset.a === "1";
          if (a === th.helpful) correct++;
          render(a);
        }),
      );
      el.querySelector("[data-next]")?.addEventListener("click", () => {
        if (i + 1 >= deck.length) {
          finish(correct, [fmt(t.progress, { n: correct, total: deck.length }), fmt(t.accuracy, { n: accuracy(correct, deck.length) })]);
          return;
        }
        i++;
        render(null);
      });
    };
    render(null);
  },
};
