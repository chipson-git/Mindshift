import type { Locale } from "@/lib/i18n/config";
import type { GameId, GameResult, GamesDict, PlayApi, ResultStore } from "./types";
import { gameDef } from "./registry";
import { bestScore, rankOf, topResults } from "./history";
import { fmt } from "./util";

// Runs one game inside a container: intro → play → result (with personal leaderboard).
// Returns a cleanup function that stops timers and key handlers.

export interface GameContext {
  t: GamesDict;
  locale: Locale;
  store: ResultStore;
  /** Link to the progress page shown on the result screen. */
  progressHref?: string;
  /** Called after a result is saved. */
  onResult?: (result: GameResult) => void;
}

export function dateLabel(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", { day: "numeric", month: "short" }).format(new Date(iso));
}

/** Personal top-N list for one game; `highlightAt` marks the result just played. */
export function leaderboardHtml(results: GameResult[], game: GameId, t: GamesDict, locale: Locale, n = 5, highlightAt?: string): string {
  const top = topResults(results, game, n);
  if (!top.length) return `<p class="g-muted g-small">${t.noBest}</p>`;
  return `<ol class="g-board">${top
    .map(
      (r, i) => `<li class="${r.at === highlightAt ? "is-new" : ""}">
        <span class="g-rank" data-rank="${i + 1}">${i + 1}</span>
        <span class="g-board-score">${r.score}</span>
        <span class="g-muted g-small">${dateLabel(r.at, locale)}${r.at === highlightAt ? ` · ${t.justNow}` : ""}</span>
      </li>`,
    )
    .join("")}</ol>`;
}

export function runGame(container: HTMLElement, id: GameId, ctx: GameContext): () => void {
  const def = gameDef(id);
  const { t, locale, store } = ctx;
  let cleanups: (() => void)[] = [];
  const stop = () => {
    cleanups.forEach((fn) => fn());
    cleanups = [];
  };

  const intro = () => {
    stop();
    const results = store.list();
    const best = bestScore(results, id);
    container.innerHTML = `<div class="g-root">
      <div class="card g-panel">
        <h2 class="g-h">${t.howTo}</h2>
        <p class="g-muted">${t.list[id].howTo}</p>
        <div class="g-row"><button type="button" class="btn btn-primary" data-start>${t.play}</button>
        <span class="g-muted g-small">${best === null ? t.noBest : fmt(t.best, { n: best })}</span></div>
      </div>
      <div class="card g-panel"><h2 class="g-h">${t.yourTop}</h2>${leaderboardHtml(results, id, t, locale, 3)}</div>
    </div>`;
    container.querySelector("[data-start]")!.addEventListener("click", play);
  };

  const play = () => {
    stop();
    container.innerHTML = `<div class="g-root"><div class="card g-panel g-play" data-play></div></div>`;
    const el = container.querySelector<HTMLElement>("[data-play]")!;
    let finished = false;
    const api: PlayApi = {
      t,
      locale,
      later(fn, ms) {
        const h = setTimeout(() => !finished && fn(), ms);
        cleanups.push(() => clearTimeout(h));
      },
      every(fn, ms) {
        const h = setInterval(() => !finished && fn(), ms);
        cleanups.push(() => clearInterval(h));
      },
      onKey(handler) {
        const fn = (e: KeyboardEvent) => !finished && handler(e);
        window.addEventListener("keydown", fn);
        cleanups.push(() => window.removeEventListener("keydown", fn));
      },
      finish(score, details) {
        if (finished) return;
        finished = true;
        stop();
        result(Math.round(score), details);
      },
    };
    def.play(el, api);
  };

  const result = (score: number, details: string[]) => {
    const before = store.list();
    const prevBest = bestScore(before, id);
    const entry: GameResult = { game: id, score, at: new Date().toISOString() };
    store.add(entry);
    ctx.onResult?.(entry);
    const results = store.list();
    const { rank, total } = rankOf(results, id, score);
    const isNew = prevBest === null || score > prevBest;
    container.innerHTML = `<div class="g-root">
      <div class="card g-panel g-result" aria-live="polite">
        <p class="g-muted g-small">${t.score}</p>
        <p class="g-big">${score}</p>
        ${isNew ? `<span class="chip g-chip-best">${t.newBest}</span>` : ""}
        ${details.map((d) => `<p class="g-muted g-small">${d}</p>`).join("")}
        <p class="g-small"><b>${fmt(t.rankOf, { rank, n: total })}</b></p>
        <div class="g-row g-center">
          <button type="button" class="btn btn-primary" data-again>${t.again}</button>
          ${ctx.progressHref ? `<a class="btn btn-secondary" href="${ctx.progressHref}">${t.seeProgress}</a>` : ""}
        </div>
      </div>
      <div class="card g-panel"><h2 class="g-h">${t.yourTop}</h2>${leaderboardHtml(results, id, t, locale, 5, entry.at)}</div>
    </div>`;
    container.querySelector("[data-again]")!.addEventListener("click", play);
  };

  intro();
  return () => {
    stop();
    container.innerHTML = "";
  };
}
