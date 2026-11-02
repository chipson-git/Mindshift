import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { subscribeAction } from "@/lib/actions";
import { getBackend } from "@/lib/backend";
import { resolveLocale } from "@/lib/page";
import { isPlanId, PLANS, type BillingPeriod } from "@/lib/plans";

export default async function CheckoutPage({ params, searchParams }: PageProps<"/[locale]/checkout/[plan]">) {
  const { locale, t } = await resolveLocale(params);
  const { plan: planParam } = await params;
  if (!isPlanId(planParam)) notFound();
  const { period: periodParam } = await searchParams;
  const period: BillingPeriod = periodParam === "yearly" ? "yearly" : "monthly";

  const session = await getBackend().getSession();
  if (!session) {
    const next = `/${locale}/checkout/${planParam}?period=${period}`;
    redirect(`/${locale}/signup?next=${encodeURIComponent(next)}`);
  }

  const plan = PLANS[planParam];
  const c = t.checkout;

  return (
    <section className="container-page py-16">
      <div className="card mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{c.plan}</dt>
            <dd className="font-medium">{t.pricing.planNames[plan.id]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{c.period}</dt>
            <dd className="font-medium">{t.pricing[period]}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base">
            <dt>{c.total}</dt>
            <dd className="font-semibold">{plan.price[period]} ₾</dd>
          </div>
        </dl>
        <p className="mt-6 rounded-xl bg-lavender-soft px-3 py-2 text-xs">{c.demoNotice}</p>
        <form action={subscribeAction} className="mt-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="plan" value={plan.id} />
          <input type="hidden" name="period" value={period} />
          <button type="submit" className="btn-primary w-full py-3">
            {c.pay} · {plan.price[period]} ₾
          </button>
        </form>
        <Link href={`/${locale}/pricing`} className="btn-ghost mt-3 w-full">
          {c.back}
        </Link>
      </div>
    </section>
  );
}
