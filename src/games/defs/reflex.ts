import type { GameDef } from "../types";
import { accuracy, average, fmt, shuffle, statusBar, type Rng } from "../util";

// Calm reflex (go / no-go): press for green, hold back for coral. Score = correct decisions.

export const REFLEX_TRIALS = 30;
export const REFLEX_GO_SHARE = 0.7;
const SHOW_MS = 900;

/** true = go, false = no-go; exact share, shuffled. */
export function reflexTrials(count = REFLEX_TRIALS, rng: Rng = Math.random): boolean[] {
  const go = Math.round(count * REFLEX_GO_SHARE);
  return shuffle([...Array(go).fill(true), ...Array(count - go).fill(false)], rng);
}

export const reflexGame: GameDef = {
  id: "reflex",
  skill: "control",
  minutes: 2,
  icon: "●",
  tone: "coral",
  normalize: (s) => Math.round((s / REFLEX_TRIALS) * 100),
  play(el, { t, later, onKey, finish }) {
    const trials = reflexTrials();
    let index = 0;
    let correct = 0;
    const rts: number[] = [];
    let live: boolean | null = null; // current stimulus: true go, false no-go, null none
    let responded = false;
    let shownAt = 0;

    el.innerHTML = `<div data-status></div>
      <div class="g-stage g-stage-tall"><span class="g-circle" data-circle></span></div>
      <button type="button" class="btn btn-primary g-wide" data-press>${t.reflexTap}</button>`;
    const status = el.querySelector<HTMLElement>("[data-status]")!;
    const circle = el.querySelector<HTMLElement>("[data-circle]")!;

    const paint = () => {
      status.innerHTML = statusBar(live === null ? t.reflexWait : "&nbsp;", fmt(t.progress, { n: index + 1, total: trials.length }));
      circle.dataset.kind = live === null ? "" : live ? "go" : "nogo";
    };
    const feedback = (ok: boolean) => {
      circle.dataset.fb = ok ? "ok" : "bad";
      later(() => delete circle.dataset.fb, 300);
    };
    const run = (i: number) => {
      if (i >= trials.length) {
        const details = [fmt(t.accuracy, { n: accuracy(correct, trials.length) })];
        if (rts.length) details.push(fmt(t.reflexAvg, { n: average(rts) }));
        finish(correct, details);
        return;
      }
      index = i;
      live = null;
      paint();
      later(() => {
        live = trials[i];
        responded = false;
        shownAt = performance.now();
        paint();
        later(() => {
          if (!responded) {
            const ok = !trials[i];
            if (ok) correct++;
            feedback(ok);
          }
          live = null;
          paint();
          later(() => run(i + 1), 250);
        }, SHOW_MS);
      }, 600 + Math.random() * 700);
    };
    const press = () => {
      if (live === null || responded) return;
      responded = true;
      if (live) {
        correct++;
        rts.push(performance.now() - shownAt);
      }
      feedback(live);
    };
    el.querySelector("[data-press]")!.addEventListener("click", press);
    onKey((e) => {
      if (e.code === "Space") {
        e.preventDefault();
        press();
      }
    });
    run(0);
  },
};
