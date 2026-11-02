"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import {
  monthlyEquivalent,
  PLAN_ORDER,
  PLANS,
  type BillingPeriod,
  type Feature,
  type Tier,
} from "@/lib/plans";

const FEATURE_ORDER: Feature[] = ["library", "exercises", "courses", "customMeditations", "coach", "community"];

export function PricingTable({
  locale,
  t,
  currentTier,
}: {
  locale: Locale;
  t: Dictionary["pricing"];
  currentTier: Tier;
}) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div role="radiogroup" className="inline-flex rounded-full border border-border bg-surface p-1">
          {(["monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                period === p ? "bg-accent text-accent-contrast" : "text-muted hover:text-text"
              }`}
            >
              {t[p]}
              {p === "yearly" && <span className="ml-1.5 text-xs opacity-80">({t.save})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = currentTier === id;
          return (
            <div
              key={id}
              className={`card relative flex flex-col ${plan.highlighted ? "border-accent ring-1 ring-accent" : ""}`}
            >
              {plan.highlighted && (
                <span className="chip absolute -top-3 left-6 bg-accent text-accent-contrast">{t.popular}</span>
              )}
              <h3 className="text-lg font-semibold">{t.planNames[id]}</h3>
              <p className="mt-1 min-h-12 text-sm text-muted">{t.planTaglines[id]}</p>
              <p className="mt-4">
                <span className="text-4xl font-semibold tracking-tight">{plan.price[period]} ₾</span>
                <span className="ml-1 text-muted">{period === "monthly" ? t.perMonth : t.perYear}</span>
              </p>
              <p className="h-5 text-xs text-muted">
                {period === "yearly" && fmt(t.approxMonthly, { n: monthlyEquivalent(plan, period) })}
              </p>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {FEATURE_ORDER.map((feature) => {
                  const included = plan.features.includes(feature);
                  let detail = "";
                  if (included && feature === "coach") {
                    detail = id === "vip" ? t.unlimited : fmt(t.coachLimit, { n: plan.limits.coachMessages });
                  } else if (included && feature === "customMeditations") {
                    detail = id === "vip" ? t.unlimited : fmt(t.medLimit, { n: plan.limits.customMeditations });
                  }
                  return (
                    <li key={feature} className={`flex gap-2.5 ${included ? "" : "text-muted line-through opacity-60"}`}>
                      <span aria-hidden="true" className={included ? "text-accent" : ""}>
                        {included ? "✓" : "–"}
                      </span>
                      <span>
                        {t.features[feature]}
                        {detail && <span className="block text-xs text-muted">{detail}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {isCurrent ? (
                <span className="btn-secondary mt-6 cursor-default">{t.current}</span>
              ) : (
                <Link
                  href={`/${locale}/checkout/${id}?period=${period}`}
                  className={`${plan.highlighted ? "btn-primary" : "btn-secondary"} mt-6`}
                >
                  {fmt(t.choose, { plan: t.planNames[id] })}
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted">{t.demoNote}</p>
    </div>
  );
}
