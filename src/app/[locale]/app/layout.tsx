import { Suspense } from "react";
import { AppNav } from "@/components/AppNav";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOutAction } from "@/lib/actions";
import { requireSessionPage } from "@/lib/page";

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[230px_1fr]">
      <aside className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur md:h-dvh md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-4 pt-4 md:px-5 md:pt-6">
          <Logo href={`/${locale}/app`} />
          <div className="flex items-center md:hidden">
            <Suspense>
              <LocaleSwitcher locale={locale} />
            </Suspense>
            <ThemeToggle labels={t.theme} />
          </div>
        </div>
        <div className="px-3 py-3 md:mt-6 md:px-3">
          <AppNav locale={locale} t={t.nav} />
        </div>
        <div className="absolute bottom-6 left-0 hidden w-full space-y-2 px-5 md:block">
          <p className="truncate text-sm font-medium">{session.user.name}</p>
          <div className="flex items-center gap-1">
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn-ghost -ml-3 px-3 py-1.5 text-xs">{t.nav.logout}</button>
            </form>
            <Suspense>
              <LocaleSwitcher locale={locale} />
            </Suspense>
            <ThemeToggle labels={t.theme} />
          </div>
          {backend.mode === "demo" && <p className="text-xs text-muted">{t.account.demoMode}</p>}
        </div>
      </aside>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
