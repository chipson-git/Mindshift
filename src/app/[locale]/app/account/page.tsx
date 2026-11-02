import Link from "next/link";
import { PageTitle } from "@/components/Paywall";
import { cancelSubscriptionAction } from "@/lib/actions";
import { fmt } from "@/lib/i18n";
import { requireSessionPage } from "@/lib/page";
import { currentMonthKey, usageLimit, type UsageKind } from "@/lib/plans";

export default async function AccountPage({ params }: PageProps<"/[locale]/app/account">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  const a = t.account;
  const { tier, period, renewsAt } = session.subscription;
  const usage = tier ? await backend.getUsage(currentMonthKey()) : null;
  const dateFormat = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", { dateStyle: "long" });

  const meters: { kind: UsageKind; label: string }[] = [
    { kind: "coachMessages", label: a.coachUsage },
    { kind: "customMeditations", label: a.medUsage },
  ];

  return (
    <>
      <PageTitle title={a.title} subtitle={`${session.user.name} · ${session.user.email}`} />

      <section className="card">
        <p className="text-sm text-muted">{a.plan}</p>
        <p className="mt-1 text-xl font-semibold">{tier ? t.pricing.planNames[tier] : a.noPlan}</p>
        {tier && period && (
          <p className="mt-1 text-sm text-muted">
            {a.period}: {t.pricing[period]}
            {renewsAt && <> · {fmt(a.renews, { date: dateFormat.format(new Date(renewsAt)) })}</>}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/${locale}/pricing`} className="btn-primary">{a.change}</Link>
          {tier && (
            <form action={cancelSubscriptionAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn-secondary">{a.cancel}</button>
            </form>
          )}
        </div>
      </section>

      {tier && usage && (
        <section className="card mt-5">
          <h2 className="font-semibold">{a.usage}</h2>
          <div className="mt-4 space-y-4">
            {meters.map(({ kind, label }) => {
              const limit = usageLimit(tier, kind);
              if (limit === 0) return null;
              const used = Math.min(usage[kind], limit);
              return (
                <div key={kind}>
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted">
                      {used} {t.common.of} {limit}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(used / limit) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {backend.mode === "demo" && <p className="mt-5 text-xs text-muted">{a.demoMode}</p>}
    </>
  );
}
