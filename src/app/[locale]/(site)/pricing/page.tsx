import type { Metadata } from "next";
import { PricingTable } from "@/components/PricingTable";
import { getBackend } from "@/lib/backend";
import { getDictionary, isLocale } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).nav.pricing } : {};
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale, t } = await resolveLocale(params);
  const session = await getBackend().getSession();
  return (
    <section className="container-page py-14 sm:py-20">
      <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{t.pricing.title}</h1>
      <p className="mx-auto mt-3 mb-10 max-w-xl text-center text-muted">{t.pricing.subtitle}</p>
      <PricingTable locale={locale} t={t.pricing} currentTier={session?.subscription.tier ?? null} />
    </section>
  );
}
