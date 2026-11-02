import { MeditationGenerator } from "@/components/MeditationGenerator";
import { PageTitle, Paywall } from "@/components/Paywall";
import { hasAiCredentials } from "@/lib/ai/claude";
import { requireSessionPage } from "@/lib/page";
import { currentMonthKey, hasFeature, remainingUsage } from "@/lib/plans";

export default async function CreatePage({ params }: PageProps<"/[locale]/app/create">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  const tier = session.subscription.tier;
  const title = <PageTitle title={t.create.title} subtitle={t.create.subtitle} />;

  if (!hasFeature(tier, "customMeditations")) {
    return (
      <>
        {title}
        <Paywall locale={locale} t={t} feature="customMeditations" />
      </>
    );
  }

  const usage = await backend.getUsage(currentMonthKey());
  const l = t.library;

  return (
    <>
      {title}
      <MeditationGenerator
        locale={locale}
        t={t.create}
        initialRemaining={remainingUsage(tier, "customMeditations", usage.customMeditations)}
        demo={!hasAiCredentials()}
        playerLabels={{
          play: l.play,
          pause: l.pause,
          resume: l.resume,
          stop: l.stop,
          noVoice: l.noVoice,
          voiceNote: l.voiceNote,
        }}
      />
      <p className="mt-6 text-xs text-muted">{t.disclaimer.short}</p>
    </>
  );
}
