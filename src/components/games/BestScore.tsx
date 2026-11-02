"use client";

import { useEffect, useState } from "react";
import { bestScore, browserStore, type GameId } from "@/games";
import { fmt } from "@/lib/i18n";

/** Shows the best score saved in this browser for a game. */
export function BestScore({ id, best, none }: { id: GameId; best: string; none: string }) {
  const [value, setValue] = useState<number | null | undefined>(undefined);
  useEffect(() => setValue(bestScore(browserStore().list(), id)), [id]);
  if (value === undefined) return <span className="mt-2 block h-4" />;
  return <span className="mt-2 block text-xs text-muted">{value === null ? none : fmt(best, { n: value })}</span>;
}
