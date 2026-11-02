import type { GameDef, GameId, GameMeta, Skill } from "./types";
import { clamp } from "./util";
import { focusGame } from "./defs/focus";
import { oddGame } from "./defs/odd";
import { memoryGame } from "./defs/memory";
import { pairsGame } from "./defs/pairs";
import { mathGame } from "./defs/math";
import { orderGame } from "./defs/order";
import { reflexGame } from "./defs/reflex";
import { thoughtsGame } from "./defs/thoughts";
import { feelingsGame } from "./defs/feelings";
import { breathGame } from "./defs/breath";

/** All games, in the order they are listed. */
export const GAME_DEFS: GameDef[] = [
  focusGame,
  oddGame,
  memoryGame,
  pairsGame,
  mathGame,
  orderGame,
  reflexGame,
  breathGame,
  feelingsGame,
  thoughtsGame,
];

export const GAMES: GameMeta[] = GAME_DEFS.map(({ id, skill, minutes, icon, tone }) => ({ id, skill, minutes, icon, tone }));

export function isGameId(value: unknown): value is GameId {
  return GAME_DEFS.some((g) => g.id === value);
}

export const gameDef = (id: GameId) => GAME_DEFS.find((g) => g.id === id)!;
export const skillOf = (id: GameId): Skill => gameDef(id).skill;
export const normalizeScore = (id: GameId, score: number) => Math.round(clamp(gameDef(id).normalize(score)));
