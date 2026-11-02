"use client";

import { useEffect, useRef } from "react";
import { browserStore, runGame, type GameId, type GamesDict } from "@/games";
import type { Locale } from "@/lib/i18n/config";

/** Mounts one game from the shared engine (src/games). */
export function GameHost({ id, t, locale, progressHref }: { id: GameId; t: GamesDict; locale: Locale; progressHref: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return runGame(ref.current, id, { t, locale, store: browserStore(), progressHref });
  }, [id, t, locale, progressHref]);
  return <div ref={ref} />;
}
