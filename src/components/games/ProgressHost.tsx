"use client";

import { useEffect, useRef } from "react";
import { browserStore, renderProgress, type GameId, type GamesDict, type ProgressDict } from "@/games";
import type { Locale } from "@/lib/i18n/config";

/** Mounts the progress view (skill levels, charts, personal leaderboard) from the shared engine. */
export function ProgressHost({ t, p, locale }: { t: GamesDict; p: ProgressDict; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return renderProgress(ref.current, {
      t,
      p,
      locale,
      store: browserStore(),
      gameHref: (id: GameId) => `/${locale}/app/games/${id}`,
    });
  }, [t, p, locale]);
  return <div ref={ref} />;
}
