import Link from "next/link";
import { Suspense } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ locale, t, signedIn }: { locale: Locale; t: Dictionary; signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Logo href={`/${locale}`} />
        <nav className="flex items-center gap-0.5 sm:gap-2">
          <Link href={`/${locale}#features`} className="btn-ghost hidden px-3 sm:inline-flex">
            {t.nav.features}
          </Link>
          <Link href={`/${locale}/pricing`} className="btn-ghost hidden px-2.5 min-[400px]:inline-flex sm:px-3">
            {t.nav.pricing}
          </Link>
          {signedIn ? (
            <Link href={`/${locale}/app`} className="btn-primary px-3.5 sm:px-4">
              {t.nav.dashboard}
            </Link>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="btn-ghost hidden px-3 sm:inline-flex">
                {t.nav.login}
              </Link>
              <Link href={`/${locale}/signup`} className="btn-primary px-3.5 sm:px-4">
                {t.nav.signup}
              </Link>
            </>
          )}
          <span className="ml-1 flex items-center gap-0.5 border-l border-border pl-1 sm:ml-2.5 sm:pl-2">
            <Suspense>
              <LocaleSwitcher locale={locale} />
            </Suspense>
            <ThemeToggle labels={t.theme} />
          </span>
        </nav>
      </div>
    </header>
  );
}
