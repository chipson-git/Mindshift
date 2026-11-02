import Link from "next/link";
import { PageTitle, Paywall } from "@/components/Paywall";
import { COURSES } from "@/lib/content/courses";
import { fmt, pick } from "@/lib/i18n";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

export default async function CoursesPage({ params }: PageProps<"/[locale]/app/courses">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  const c = t.courses;

  if (!hasFeature(session.subscription.tier, "courses")) {
    return (
      <>
        <PageTitle title={c.title} subtitle={c.subtitle} />
        <Paywall locale={locale} t={t} feature="courses" />
      </>
    );
  }

  const { lessons } = await backend.getProgress();

  return (
    <>
      <PageTitle title={c.title} subtitle={c.subtitle} />
      <div className="grid gap-4 sm:grid-cols-2">
        {COURSES.map((course) => {
          const done = course.lessons.filter((l) => lessons.includes(l.id)).length;
          const pct = Math.round((done / course.lessons.length) * 100);
          return (
            <Link key={course.slug} href={`/${locale}/app/courses/${course.slug}`} className="card transition-colors hover:border-accent">
              <span className="chip">{fmt(c.lessons, { n: course.lessons.length })}</span>
              <h2 className="mt-3 font-semibold">{pick(course.title, locale)}</h2>
              <p className="mt-1 text-sm text-muted">{pick(course.summary, locale)}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted">{fmt(c.progress, { done, total: course.lessons.length })}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
