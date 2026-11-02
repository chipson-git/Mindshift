"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

const LABELS: Record<Locale, string> = { ka: "ქარ", en: "EN" };

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const other: Locale = locale === "ka" ? "en" : "ka";
  const href = pathname.replace(/^\/(ka|en)(?=\/|$)/, `/${other}`) + (search ? `?${search}` : "");
  return (
    <Link
      href={href}
      hrefLang={other}
      className="btn-ghost px-3 py-1.5 text-xs"
      aria-label={other === "en" ? "Switch to English" : "ქართულზე გადართვა"}
    >
      {LABELS[other]}
    </Link>
  );
}
