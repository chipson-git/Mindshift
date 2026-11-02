import Link from "next/link";
import { PageTitle } from "@/components/Paywall";
import { LIBRARY } from "@/lib/content/library";
import { fmt, pick } from "@/lib/i18n";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

export default async function LibraryPage({ params }: PageProps<"/[locale]/app/library">) {
  const { locale, t, session } = await requireSessionPage(params);
  const unlocked = hasFeature(session.subscription.tier, "library");
  const l = t.library;

  return (
    <>
      <PageTitle title={l.title} subtitle={l.subtitle} />
      <div className="grid gap-4 sm:grid-cols-2">
        {LIBRARY.map((item) => {
          const open = unlocked || item.free;
          const content = (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{l.categories[item.category]}</span>
                <span className="text-xs text-muted">{t.create.styles[item.kind]}</span>
                <span className="text-xs text-muted">· {fmt(l.minutes, { n: item.minutes })}</span>
                {item.free && !unlocked && <span className="chip bg-lavender-soft text-lavender">{l.free}</span>}
              </div>
              <h2 className="mt-3 font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-1 text-sm text-muted">{pick(item.summary, locale)}</p>
              {!open && <p className="mt-3 text-xs text-muted">🔒 {fmt(t.paywall.title, { plan: t.pricing.planNames.basic })}</p>}
            </>
          );
          return open ? (
            <Link key={item.id} href={`/${locale}/app/library/${item.id}`} className="card transition-colors hover:border-accent">
              {content}
            </Link>
          ) : (
            <Link key={item.id} href={`/${locale}/pricing`} className="card opacity-70 transition-opacity hover:opacity-100">
              {content}
            </Link>
          );
        })}
      </div>
    </>
  );
}
