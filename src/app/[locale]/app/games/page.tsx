import Link from "next/link";
import { BestScore } from "@/components/games/BestScore";
import { PageTitle, Paywall } from "@/components/Paywall";
import { GAMES, SKILLS } from "@/games";
import { fmt } from "@/lib/i18n";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

const TONES = {
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success-strong",
  secondary: "bg-secondary-soft text-secondary",
  coral: "bg-coral-soft text-danger",
} as const;

export default async function GamesPage({ params }: PageProps<"/[locale]/app/games">) {
  const { locale, t, session } = await requireSessionPage(params);
  const g = t.games;
  const title = <PageTitle title={g.title} subtitle={g.subtitle} />;

  if (!hasFeature(session.subscription.tier, "exercises")) {
    return (
      <>
        {title}
        <Paywall locale={locale} t={t} feature="exercises" />
      </>
    );
  }

  return (
    <>
      {title}
      <Link href={`/${locale}/app/progress`} className="card mb-6 flex items-center gap-4 transition-colors hover:border-accent">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-xl text-accent-strong" aria-hidden="true">↗</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{t.progress.title}</span>
          <span className="block text-sm text-muted">{t.progress.subtitle}</span>
        </span>
        <span className="text-muted" aria-hidden="true">→</span>
      </Link>

      {SKILLS.map((skill) => {
        const games = GAMES.filter((x) => x.skill === skill);
        if (!games.length) return null;
        return (
          <section key={skill} className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-muted">{g.skills[skill]}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {games.map((game) => (
                <Link key={game.id} href={`/${locale}/app/games/${game.id}`} className="card flex gap-4 transition-colors hover:border-accent">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-xl font-semibold ${TONES[game.tone]}`} aria-hidden="true">
                    {game.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="chip">{g.skills[game.skill]}</span>
                      <span className="text-xs text-muted">{fmt(t.library.minutes, { n: game.minutes })}</span>
                    </span>
                    <span className="mt-2 block font-semibold">{g.list[game.id].name}</span>
                    <span className="mt-1 block text-sm text-muted">{g.list[game.id].desc}</span>
                    <BestScore id={game.id} best={g.best} none={g.noBest} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      <p className="text-xs text-muted">{g.note}</p>
    </>
  );
}
