import Link from "next/link";
import { PricingTable } from "@/components/PricingTable";
import { getBackend } from "@/lib/backend";
import { resolveLocale } from "@/lib/page";

const FEATURE_ICONS = ["♫", "▤", "◎", "✦"];
// One palette color per feature card: blue, green, yellow, coral.
const FEATURE_TONES = [
  "bg-accent-soft text-accent-strong",
  "bg-success-soft text-success-strong",
  "bg-secondary-soft text-secondary",
  "bg-coral-soft text-danger",
];

export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale, t } = await resolveLocale(params);
  const session = await getBackend().getSession();
  const l = t.landing;

  return (
    <>
      {/* Hero */}
      <section className="container-page grid items-center gap-10 py-16 sm:py-24 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">{l.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{l.heroTitle}</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{l.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/pricing`} className="btn-primary px-6 py-3 text-base">
              {l.ctaStart}
            </Link>
            {!session && (
              <Link href={`/${locale}/login`} className="btn-secondary px-6 py-3 text-base">
                {l.ctaLogin}
              </Link>
            )}
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm" aria-hidden="true">
          <div className="breathe absolute inset-0 rounded-full bg-accent-soft" />
          <div className="breathe absolute inset-[14%] rounded-full bg-secondary-soft [animation-delay:-2s]" />
          <div className="absolute inset-[34%] rounded-full bg-surface shadow-sm" />
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-12">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{l.howTitle}</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {l.steps.map((step, i) => (
            <li key={step.title} className="card">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section id="features" className="container-page scroll-mt-20 py-12">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{l.featuresTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {l.features.map((f, i) => (
            <div key={f.title} className="card flex gap-4">
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xl ${FEATURE_TONES[i]}`} aria-hidden="true">
                {FEATURE_ICONS[i]}
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Science */}
      <section className="container-page py-12">
        <div className="card bg-accent-soft/60 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">{l.scienceTitle}</h2>
          <p className="mt-3 max-w-3xl text-muted">{l.scienceBody}</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="container-page py-12">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">{t.pricing.title}</h2>
        <p className="mx-auto mt-2 mb-8 max-w-xl text-center text-muted">{t.pricing.subtitle}</p>
        <PricingTable locale={locale} t={t.pricing} currentTier={session?.subscription.tier ?? null} />
      </section>

      {/* FAQ */}
      <section className="container-page py-12">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{l.faqTitle}</h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {l.faq.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}
                <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page py-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{l.finalTitle}</h2>
        <p className="mt-2 text-muted">{l.finalBody}</p>
        <Link href={`/${locale}/pricing`} className="btn-primary mt-6 px-6 py-3 text-base">
          {l.ctaStart}
        </Link>
      </section>
    </>
  );
}
