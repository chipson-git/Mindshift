import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getBackend } from "@/lib/backend";
import { resolveLocale } from "@/lib/page";

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale, t } = await resolveLocale(params);
  const session = await getBackend().getSession();
  return (
    <>
      <SiteHeader locale={locale} t={t} signedIn={Boolean(session)} />
      <main>{children}</main>
      <SiteFooter t={t} />
    </>
  );
}
