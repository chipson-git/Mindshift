"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/lib/i18n";

const ITEMS = [
  { key: "dashboard", path: "", icon: "☀" },
  { key: "library", path: "/library", icon: "♫" },
  { key: "courses", path: "/courses", icon: "▤" },
  { key: "create", path: "/create", icon: "✦" },
  { key: "coach", path: "/coach", icon: "◎" },
  { key: "community", path: "/community", icon: "❋" },
  { key: "account", path: "/account", icon: "○" },
] as const;

export function AppNav({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const pathname = usePathname();
  const base = `/${locale}/app`;
  return (
    <nav aria-label={t.menu} className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {ITEMS.map((item) => {
        const href = base + item.path;
        const active = item.path === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={item.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              active ? "bg-accent-soft font-medium text-accent-strong" : "text-muted hover:bg-surface-muted hover:text-text"
            }`}
          >
            <span aria-hidden="true" className="w-4 text-center">{item.icon}</span>
            {t[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
