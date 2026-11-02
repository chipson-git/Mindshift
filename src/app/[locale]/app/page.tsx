import Link from "next/link";
import { PageTitle } from "@/components/Paywall";
import { completeExerciseAction } from "@/lib/actions";
import { COURSES } from "@/lib/content/courses";
import { EXERCISES } from "@/lib/content/exercises";
import { getLibraryItem } from "@/lib/content/library";
import { fmt, pick } from "@/lib/i18n";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";
import { currentStreak, dailyIndex, dayKey, lastDays, longestStreak } from "@/lib/streak";

export default async function DashboardPage({ params }: PageProps<"/[locale]/app">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  const d = t.dashboard;
  const tier = session.subscription.tier;
  const greeting = <PageTitle title={fmt(d.greeting, { name: session.user.name })} subtitle={d.subtitle} />;

  if (!tier) {
    return (
      <>
        {greeting}
        <div className="card">
          <h2 className="text-lg font-semibold">{d.noPlanTitle}</h2>
          <p className="mt-2 text-sm text-muted">{d.noPlanBody}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${locale}/pricing`} className="btn-primary">{d.seePlans}</Link>
            <Link href={`/${locale}/app/library/three-breaths`} className="btn-secondary">
              {pick(getLibraryItem("three-breaths")!.title, locale)} · {t.library.free}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const progress = await backend.getProgress();
  const today = dayKey();
  const activeDays = new Set(progress.exercises.map((e) => e.day));
  const exercise = EXERCISES[dailyIndex(EXERCISES.length, today)];
  const doneToday = progress.exercises.some((e) => e.day === today && e.exerciseId === exercise.id);

  // First course with unfinished lessons (Pro and above).
  const courseInProgress = hasFeature(tier, "courses")
    ? COURSES.map((course) => ({
        course,
        done: course.lessons.filter((l) => progress.lessons.includes(l.id)).length,
      })).find(({ course, done }) => done < course.lessons.length)
    : undefined;

  return (
    <>
      {greeting}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="card">
          <p className="text-sm text-muted">{d.streak}</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {currentStreak(activeDays, today)} <span className="text-base font-normal text-muted">{d.days}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {d.longest}: {longestStreak(activeDays)} {d.days}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">{d.activity}</p>
          <div className="mt-3 grid grid-cols-14 gap-1.5" role="img" aria-label={d.activity}>
            {lastDays(28, today).map((day) => (
              <span
                key={day}
                title={day}
                className={`aspect-square rounded-[4px] ${activeDays.has(day) ? "bg-success" : "bg-surface-muted"} ${
                  day === today ? "ring-1 ring-success ring-offset-1 ring-offset-surface" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="card mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">{d.todayExercise}</p>
          <span className="chip">{fmt(t.library.minutes, { n: exercise.minutes })}</span>
        </div>
        <h2 className="mt-2 text-xl font-semibold">{pick(exercise.title, locale)}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
          {pick(exercise.steps, locale).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {doneToday ? (
          <p className="mt-6 font-medium text-success-strong">{d.done}</p>
        ) : (
          <form action={completeExerciseAction} className="mt-6">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <button type="submit" className="btn-primary">{d.markDone}</button>
          </form>
        )}
      </section>

      <Link href={`/${locale}/app/games`} className="card mt-5 flex items-center gap-4 transition-colors hover:border-accent">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-xl text-success-strong" aria-hidden="true">
          ◇
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{t.games.dashboardCta}</span>
          <span className="block text-sm text-muted">{t.games.dashboardText}</span>
        </span>
        <span className="text-muted" aria-hidden="true">→</span>
      </Link>

      {courseInProgress && (
        <Link
          href={`/${locale}/app/courses/${courseInProgress.course.slug}`}
          className="card mt-5 block transition-colors hover:border-accent"
        >
          <p className="eyebrow">{d.continueCourse}</p>
          <h2 className="mt-2 font-semibold">{pick(courseInProgress.course.title, locale)}</h2>
          <p className="mt-1 text-sm text-muted">
            {fmt(t.courses.progress, { done: courseInProgress.done, total: courseInProgress.course.lessons.length })}
          </p>
        </Link>
      )}
    </>
  );
}
