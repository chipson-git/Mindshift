import Link from "next/link";
import { notFound } from "next/navigation";
import { Paywall } from "@/components/Paywall";
import { SessionPlayer } from "@/components/SessionPlayer";
import { getLibraryItem } from "@/lib/content/library";
import { fmt, pick } from "@/lib/i18n";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

export default async function LibraryItemPage({ params }: PageProps<"/[locale]/app/library/[id]">) {
  const { locale, t, session } = await requireSessionPage(params);
  const { id } = await params;
  const item = getLibraryItem(id);
  if (!item) notFound();
  const l = t.library;

  return (
    <>
      <Link href={`/${locale}/app/library`} className="btn-ghost -ml-3 mb-4 px-3 py-1.5 text-sm">
        ← {l.back}
      </Link>
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{l.categories[item.category]}</span>
          <span className="text-xs text-muted">
            {t.create.styles[item.kind]} · {fmt(l.minutes, { n: item.minutes })}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{pick(item.title, locale)}</h1>
        <p className="mt-1.5 text-muted">{pick(item.summary, locale)}</p>
      </header>

      {item.free || hasFeature(session.subscription.tier, "library") ? (
        <SessionPlayer
          paragraphs={pick(item.script, locale)}
          locale={locale}
          audioUrl={item.audioUrl?.[locale]}
          labels={{
            play: l.play,
            pause: l.pause,
            resume: l.resume,
            stop: l.stop,
            noVoice: l.noVoice,
            voiceNote: l.voiceNote,
          }}
        />
      ) : (
        <Paywall locale={locale} t={t} feature="library" />
      )}
    </>
  );
}
