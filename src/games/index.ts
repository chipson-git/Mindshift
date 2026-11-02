// Public entry of the game engine. The app imports from here; the prototype bundles this
// file with esbuild into a global `MindshiftGames`.

export * from "./types";
export { GAME_DEFS, GAMES, gameDef, isGameId, normalizeScore, skillOf } from "./registry";
export { runGame, leaderboardHtml, type GameContext } from "./shell";
export { renderProgress, chartSvg, type ProgressContext } from "./progress";
export { browserStore, bestScore, rankOf, skillLevel, skillSeries, topResults, weeklyCounts } from "./history";
export { sampleResults } from "./sample";
