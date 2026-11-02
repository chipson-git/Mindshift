import type { Locale } from "@/lib/i18n/config";
import type { GameId, GameResult, GamesDict, ProgressDict, ResultStore, Skill } from "./types";
import { SKILLS } from "./types";
import { GAMES, normalizeScore, skillOf } from "./registry";
import { skillLevel, skillSeries, weeklyCounts } from "./history";
import { dateLabel, leaderboardHtml } from "./shell";
import { fmt } from "./util";

// Progress page: skill levels with trends, a chart per skill, and the personal leaderboard.

export interface ProgressContext {
  t: GamesDict;
  p: ProgressDict;
  locale: Locale;
  store: ResultStore;
  /** URL of a game page, used for "play" links. */
  gameHref: (id: GameId) => string;
  /** Prototype only: offers to fill the page with example results. */
  onLoadSample?: () => void;
}

const CHART_W = 600;
const CHART_H = 200;
const PAD = 8;

/** Line + area chart of 0–100 values (drawn to a fixed scale; labels are HTML around it). */
export function chartSvg(points: { value: number }[], w = CHART_W, h = CHART_H): string {
  if (!points.length) return "";
  const x = (i: number) => (points.length === 1 ? w / 2 : PAD + (i * (w - 2 * PAD)) / (points.length - 1));
  const y = (v: number) => PAD + ((100 - v) * (h - 2 * PAD)) / 100;
  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${x(0).toFixed(1)},${h - PAD} ${line} ${x(points.length - 1).toFixed(1)},${h - PAD}`;
  const grid = [0, 50, 100].map((v) => `<line x1="0" x2="${w}" y1="${y(v)}" y2="${y(v)}" class="g-gridline"/>`).join("");
  const dots = points.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="${i === points.length - 1 ? 5 : 3}" class="g-dotmark${i === points.length - 1 ? " is-last" : ""}"/>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="g-chart" role="img" aria-hidden="true">${grid}
    <polygon points="${area}" class="g-area"/><polyline points="${line}" class="g-line"/>${dots}</svg>`;
}

function sparkline(points: { value: number }[]): string {
  if (points.length < 2) return `<div class="g-spark g-spark-empty"></div>`;
  const pts = points.slice(-14);
  const line = pts.map((p, i) => `${((i * 100) / (pts.length - 1)).toFixed(1)},${(30 - (p.value * 28) / 100 - 1).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 100 30" preserveAspectRatio="none" class="g-spark" aria-hidden="true"><polyline points="${line}" class="g-line" vector-effect="non-scaling-stroke"/></svg>`;
}

function deltaChip(delta: number | null, p: ProgressDict): string {
  if (delta === null) return `<span class="g-delta">${p.needMore}</span>`;
  const cls = delta > 0 ? "up" : delta < 0 ? "down" : "";
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return `<span class="g-delta ${cls}">${sign}${Math.abs(delta)}</span>`;
}

export function renderProgress(container: HTMLElement, ctx: ProgressContext): () => void {
  const { t, p, locale, store } = ctx;
  let selected: Skill | null = null;
  let boardGame: GameId = GAMES[0].id;

  const render = () => {
    const results: GameResult[] = store.list();
    if (!results.length) {
      container.innerHTML = `<div class="g-root"><div class="card g-panel g-empty">
        <p class="g-big-icon" aria-hidden="true">◇</p>
        <h2 class="g-h">${p.emptyTitle}</h2><p class="g-muted">${p.emptyBody}</p>
        <div class="g-row g-center"><a class="btn btn-primary" href="${ctx.gameHref(GAMES[0].id)}">${t.play}</a>
        ${ctx.onLoadSample ? `<button type="button" class="btn btn-secondary" data-sample>${p.loadSample}</button>` : ""}</div>
      </div></div>`;
      container.querySelector("[data-sample]")?.addEventListener("click", () => {
        ctx.onLoadSample?.();
        render();
      });
      return;
    }

    const levels = SKILLS.map((s) => ({ skill: s, ...skillLevel(results, s, skillOf, normalizeScore), series: skillSeries(results, s, skillOf, normalizeScore) }));
    const played = levels.filter((l) => l.sessions > 0);
    if (!selected || !played.some((l) => l.skill === selected)) selected = played[0].skill;
    const current = levels.find((l) => l.skill === selected)!;
    const series = current.series.slice(-30);
    const weekly = weeklyCounts(results);
    const improved = played.filter((l) => (l.delta ?? 0) > 0).length;
    const isSample = results.some((r) => r.sample);

    container.innerHTML = `<div class="g-root">
      ${isSample ? `<p class="g-note">${p.sampleNote}</p>` : ""}
      <div class="g-stats">
        <div class="card g-panel"><p class="g-muted g-small">${p.thisWeek}</p><p class="g-stat">${weekly.thisWeek}</p><p class="g-muted g-small">${fmt(p.lastWeek, { n: weekly.lastWeek })}</p></div>
        <div class="card g-panel"><p class="g-muted g-small">${p.totalSessions}</p><p class="g-stat">${results.length}</p></div>
        <div class="card g-panel"><p class="g-muted g-small">${p.improving}</p><p class="g-stat">${improved}<span class="g-muted g-small"> / ${played.length}</span></p></div>
      </div>

      <section class="g-section">
        <h2 class="g-h2">${p.skillsTitle}</h2>
        <p class="g-muted g-small">${p.skillsHint}</p>
        <div class="g-skills">${levels
          .map(
            (l) => `<button type="button" class="card g-skill ${l.skill === selected ? "is-active" : ""}" data-skill="${l.skill}" ${l.sessions ? "" : "disabled"}>
              <span class="g-row g-between"><span class="g-skill-name">${t.skills[l.skill]}</span>${l.sessions && l.delta !== null ? deltaChip(l.delta, p) : ""}</span>
              <span class="g-skill-level">${l.level ?? "–"}<span class="g-muted g-small"> / 100</span></span>
              ${sparkline(l.series)}
              <span class="g-muted g-small">${l.sessions ? fmt(p.sessions, { n: l.sessions }) : p.notPlayed}</span>
            </button>`,
          )
          .join("")}</div>
      </section>

      <section class="card g-panel g-section">
        <div class="g-row g-between"><h2 class="g-h2">${fmt(p.chartTitle, { skill: t.skills[current.skill] })}</h2>${deltaChip(current.delta, p)}</div>
        <div class="g-chart-wrap">
          <div class="g-yaxis"><span>100</span><span>50</span><span>0</span></div>
          <div class="g-chart-box">${chartSvg(series)}
            <div class="g-xaxis"><span>${series.length ? dateLabel(series[0].day, locale) : ""}</span><span>${series.length > 1 ? dateLabel(series[series.length - 1].day, locale) : ""}</span></div>
          </div>
        </div>
        <p class="g-muted g-small">${p.chartHint}</p>
      </section>

      <section class="card g-panel g-section">
        <h2 class="g-h2">${p.boardTitle}</h2>
        <p class="g-muted g-small">${p.boardHint}</p>
        <div class="g-tabs" role="tablist">${GAMES.map(
          (g) => `<button type="button" role="tab" class="g-tab" aria-selected="${g.id === boardGame}" data-board="${g.id}">${t.list[g.id].name}</button>`,
        ).join("")}</div>
        ${leaderboardHtml(results, boardGame, t, locale, 5)}
        <a class="btn btn-secondary g-board-play" href="${ctx.gameHref(boardGame)}">${t.play} · ${t.list[boardGame].name}</a>
      </section>
    </div>`;

    container.querySelectorAll<HTMLButtonElement>("[data-skill]").forEach((b) =>
      b.addEventListener("click", () => {
        selected = b.dataset.skill as Skill;
        render();
      }),
    );
    container.querySelectorAll<HTMLButtonElement>("[data-board]").forEach((b) =>
      b.addEventListener("click", () => {
        boardGame = b.dataset.board as GameId;
        render();
        container.querySelector<HTMLElement>(`[data-board="${boardGame}"]`)?.focus();
      }),
    );
  };

  render();
  return () => {
    container.innerHTML = "";
  };
}
