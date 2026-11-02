import Link from "next/link";
import { fmt, type Dictionary, type Locale } from "@/lib/i18n";
import { minimumPlanFor, type Feature } from "@/lib/plans";

export function Paywall({ locale, t, feature }: { locale: Locale; t: Dictionary; feature: Feature }) {
  const plan = minimumPlanFor(feature);
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-lavender-soft text-xl text-lavender" aria-hidden="true">
        ✦
      </span>
      <h2 className="mt-4 text-xl font-semibold">{fmt(t.paywall.title, { plan: t.pricing.planNames[plan] })}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">{t.paywall.body}</p>
      <Link href={`/${locale}/pricing`} className="btn-primary mt-6">
        {t.paywall.upgrade}
      </Link>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
    </header>
  );
}
