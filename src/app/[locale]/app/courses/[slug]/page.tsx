import Link from "next/link";
import { notFound } from "next/navigation";
import { Paywall } from "@/components/Paywall";
import { completeLessonAction } from "@/lib/actions";
import { getCourse } from "@/lib/content/courses";
import { getLibraryItem } from "@/lib/content/library";
import { fmt, pick } from "@/lib/i18n";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

export default async function CoursePage({ params }: PageProps<"/[locale]/app/courses/[slug]">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const c = t.courses;

  const back = (
    <Link href={`/${locale}/app/courses`} className="btn-ghost -ml-3 mb-4 px-3 py-1.5 text-sm">
      ← {c.back}
    </Link>
  );

  if (!hasFeature(session.subscription.tier, "courses")) {
    return (
      <>
        {back}
        <Paywall locale={locale} t={t} feature="courses" />
      </>
    );
  }

  const { lessons: completed } = await backend.getProgress();
  const done = course.lessons.filter((l) => completed.includes(l.id)).length;
  // The first unfinished lesson is open by default.
  const nextLessonId = course.lessons.find((l) => !completed.includes(l.id))?.id;

  return (
    <>
      {back}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{pick(course.title, locale)}</h1>
        <p className="mt-1.5 text-muted">{pick(course.summary, locale)}</p>
        <p className="mt-2 text-sm text-accent-strong">{fmt(c.progress, { done, total: course.lessons.length })}</p>
      </header>

      <ol className="space-y-3">
        {course.lessons.map((lesson, i) => {
          const isDone = completed.includes(lesson.id);
          const linked = lesson.librarySessionId ? getLibraryItem(lesson.librarySessionId) : undefined;
          return (
            <li key={lesson.id}>
              <details open={lesson.id === nextLessonId} className="card group">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      isDone ? "bg-success text-accent-contrast" : "bg-surface-muted text-muted"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs text-muted">{fmt(c.lesson, { n: i + 1 })}</span>
                    <span className="font-medium">{pick(lesson.title, locale)}</span>
                  </span>
                  <span className="text-muted transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                </summary>
                <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                  {pick(lesson.body, locale).map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  <div className="rounded-xl bg-accent-soft/70 p-4">
                    <p className="eyebrow">{c.practice}</p>
                    <p className="mt-1">{pick(lesson.practice, locale)}</p>
                    {linked && (
                      <Link
                        href={`/${locale}/app/library/${linked.id}`}
                        className="mt-2 inline-block font-medium text-accent-strong underline-offset-4 hover:underline"
                      >
                        ▶ {pick(linked.title, locale)}
                      </Link>
                    )}
                  </div>
                  {isDone ? (
                    <p className="font-medium text-success-strong">{c.completed} ✓</p>
                  ) : (
                    <form action={completeLessonAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <button type="submit" className="btn-primary">{c.complete}</button>
                    </form>
                  )}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </>
  );
}
