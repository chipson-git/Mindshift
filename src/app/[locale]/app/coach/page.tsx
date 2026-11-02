import { CoachChat } from "@/components/CoachChat";
import { PageTitle, Paywall } from "@/components/Paywall";
import { hasAiCredentials } from "@/lib/ai/claude";
import { requireSessionPage } from "@/lib/page";
import { currentMonthKey, hasFeature, remainingUsage } from "@/lib/plans";

export default async function CoachPage({ params }: PageProps<"/[locale]/app/coach">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  const tier = session.subscription.tier;
  const title = <PageTitle title={t.coach.title} subtitle={t.coach.subtitle} />;

  if (!hasFeature(tier, "coach")) {
    return (
      <>
        {title}
        <Paywall locale={locale} t={t} feature="coach" />
      </>
    );
  }

  const usage = await backend.getUsage(currentMonthKey());
  return (
    <>
      {title}
      <CoachChat
        locale={locale}
        t={t.coach}
        initialRemaining={remainingUsage(tier, "coachMessages", usage.coachMessages)}
        demo={!hasAiCredentials()}
      />
      <p className="mt-4 text-xs text-muted">{t.disclaimer.crisis}</p>
    </>
  );
}
