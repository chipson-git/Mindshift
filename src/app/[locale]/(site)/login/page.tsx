import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getBackend } from "@/lib/backend";
import { getDictionary, isLocale } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).nav.login } : {};
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale, t } = await resolveLocale(params);
  const backend = getBackend();
  if (await backend.getSession()) redirect(`/${locale}/app`);
  const { next } = await searchParams;
  return (
    <section className="container-page py-16">
      <AuthForm
        mode="login"
        locale={locale}
        t={t.auth}
        next={typeof next === "string" ? next : undefined}
        demo={backend.mode === "demo"}
      />
    </section>
  );
}
