import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="container-page space-y-2 py-8 text-sm text-muted">
        <p>{t.disclaimer.short}</p>
        <p>{t.disclaimer.crisis}</p>
        <p>
          © {new Date().getFullYear()} Mindshift. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
