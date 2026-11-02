import { ProgressHost } from "@/components/games/ProgressHost";
import { PageTitle, Paywall } from "@/components/Paywall";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

export default async function ProgressPage({ params }: PageProps<"/[locale]/app/progress">) {
  const { locale, t, session } = await requireSessionPage(params);
  return (
    <>
      <PageTitle title={t.progress.title} subtitle={t.progress.subtitle} />
      {hasFeature(session.subscription.tier, "exercises") ? (
        <ProgressHost t={t.games} p={t.progress} locale={locale} />
      ) : (
        <Paywall locale={locale} t={t} feature="exercises" />
      )}
    </>
  );
}
