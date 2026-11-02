import Link from "next/link";

export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="var(--accent-soft)" />
        <path
          d="M8 18c2.5-6 5.5-6 8 0s5.5 6 8 0"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span>Mindshift</span>
    </Link>
  );
}
