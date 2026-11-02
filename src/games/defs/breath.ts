import type { GameDef } from "../types";
import { average, fmt, statusBar } from "../util";

// Breath rhythm: breathe with the circle (4 s in, 4 s out) and tap at the top of each breath.
// Score = average timing accuracy over 6 breaths (100 = perfectly on the beat).

export const BREATH_CYCLES = 6;
export const BREATH_IN_MS = 4000;
export const BREATH_OUT_MS = 4000;
const CYCLE = BREATH_IN_MS + BREATH_OUT_MS;
const LEAD_IN = 1500;

/** Points for one breath: 100 on the beat, 0 at 1.5 s off or worse. */
export const breathPoints = (offsetMs: number) => Math.max(0, Math.round(100 - Math.abs(offsetMs) / 15));

export const breathGame: GameDef = {
  id: "breath",
  skill: "calm",
  minutes: 1,
  icon: "◌",
  tone: "accent",
  normalize: (s) => s,
  play(el, { t, every, onKey, finish }) {
    const start = performance.now() + LEAD_IN;
    const peakAt = (k: number) => start + k * CYCLE + BREATH_IN_MS;
    const offsets: (number | null)[] = Array(BREATH_CYCLES).fill(null);
    let done = false;

    el.innerHTML = `<div data-status></div>
      <div class="g-stage g-stage-tall"><span class="g-breath" data-ball></span><span class="g-breath-label" data-label></span></div>
      <button type="button" class="btn btn-primary g-wide" data-tap>${t.breathTap}</button>`;
    const status = el.querySelector<HTMLElement>("[data-status]")!;
    const ball = el.querySelector<HTMLElement>("[data-ball]")!;
    const label = el.querySelector<HTMLElement>("[data-label]")!;

    const tap = () => {
      const now = performance.now();
      // Nearest beat, only counted once and only within 2 s.
      const k = Math.round((now - start - BREATH_IN_MS) / CYCLE);
      if (k < 0 || k >= BREATH_CYCLES || offsets[k] !== null) return;
      const off = now - peakAt(k);
      if (Math.abs(off) > 2000) return;
      offsets[k] = off;
      ball.dataset.fb = breathPoints(off) >= 60 ? "ok" : "bad";
      setTimeout(() => delete ball.dataset.fb, 300);
    };
    el.querySelector("[data-tap]")!.addEventListener("click", tap);
    onKey((e) => {
      if (e.code === "Space") {
        e.preventDefault();
        tap();
      }
    });

    every(() => {
      if (done) return;
      const now = performance.now();
      const elapsed = now - start;
      if (elapsed < 0) {
        status.innerHTML = statusBar(t.breathPrompt, fmt(t.breathCycle, { n: 1, total: BREATH_CYCLES }));
        label.textContent = t.reflexWait;
        ball.style.transform = "scale(0.45)";
        return;
      }
      const k = Math.floor(elapsed / CYCLE);
      // Ends 2 s after the last beat, so a slightly late last tap still counts.
      if (elapsed > (BREATH_CYCLES - 1) * CYCLE + BREATH_IN_MS + 2000) {
        done = true;
        const points = offsets.map((o) => (o === null ? 0 : breathPoints(o)));
        const hits = offsets.filter((o): o is number => o !== null).map(Math.abs);
        const details = [fmt(t.breathHits, { n: hits.length, total: BREATH_CYCLES })];
        if (hits.length) details.push(fmt(t.breathTiming, { n: average(hits) }));
        finish(average(points), details);
        return;
      }
      const phase = elapsed % CYCLE;
      const inhale = phase < BREATH_IN_MS;
      const p = inhale ? phase / BREATH_IN_MS : 1 - (phase - BREATH_IN_MS) / BREATH_OUT_MS;
      const eased = 0.5 - Math.cos(Math.PI * p) / 2;
      ball.style.transform = `scale(${0.45 + eased * 0.55})`;
      label.textContent = k < BREATH_CYCLES ? (inhale ? t.breathIn : t.breathOut) : "";
      status.innerHTML = statusBar(t.breathPrompt, fmt(t.breathCycle, { n: Math.min(k + 1, BREATH_CYCLES), total: BREATH_CYCLES }));
    }, 40);
  },
};
