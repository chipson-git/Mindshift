import { notFound, redirect } from "next/navigation";
import { getBackend } from "@/lib/backend";
import { getDictionary, isLocale } from "@/lib/i18n";

/** Validates the [locale] route param and returns the dictionary for it. */
export async function resolveLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, t: getDictionary(locale) };
}

/** For pages inside /app: redirects to login when signed out. */
export async function requireSessionPage(params: Promise<{ locale: string }>) {
  const { locale, t } = await resolveLocale(params);
  const backend = getBackend();
  const session = await backend.getSession();
  if (!session) redirect(`/${locale}/login`);
  return { locale, t, session, backend };
}
