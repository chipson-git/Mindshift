import Link from "next/link";
import { notFound } from "next/navigation";
import { FocusGame } from "@/components/games/FocusGame";
import { MemoryGame } from "@/components/games/MemoryGame";
import { ReflexGame } from "@/components/games/ReflexGame";
import { ThoughtsGame } from "@/components/games/ThoughtsGame";
import { Paywall } from "@/components/Paywall";
import { GAMES, isGameId } from "@/lib/games";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

export default async function GamePage({ params }: PageProps<"/[locale]/app/games/[id]">) {
  const { locale, t, session } = await requireSessionPage(params);
  const { id } = await params;
  if (!isGameId(id)) notFound();
  const g = t.games;
  const meta = GAMES.find((x) => x.id === id)!;

  return (
    <>
      <Link href={`/${locale}/app/games`} className="btn-ghost -ml-3 mb-4 px-3 py-1.5 text-sm">
        ← {g.back}
      </Link>
      <header className="mb-6">
        <span className="chip">{g.skills[meta.skill]}</span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{g.list[id].name}</h1>
        <p className="mt-1.5 text-muted">{g.list[id].desc}</p>
      </header>
      {!hasFeature(session.subscription.tier, "exercises") ? (
        <Paywall locale={locale} t={t} feature="exercises" />
      ) : id === "focus" ? (
        <FocusGame t={g} />
      ) : id === "memory" ? (
        <MemoryGame t={g} />
      ) : id === "reflex" ? (
        <ReflexGame t={g} />
      ) : (
        <ThoughtsGame t={g} locale={locale} />
      )}
    </>
  );
}
