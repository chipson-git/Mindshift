import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/lib/i18n/config";

// Runs before every page request:
// 1. Adds a locale prefix (/ka or /en) to URLs that don't have one.
// 2. In Supabase mode, refreshes the auth session cookie.

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("locale")?.value;
  if (isLocale(saved)) return saved;
  const header = request.headers.get("accept-language") ?? "";
  const match = LOCALES.find((l) => header.toLowerCase().split(",").some((part) => part.trim().startsWith(l)));
  return match ?? DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (!isLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  response.cookies.set("locale", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          for (const { name, value } of toSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set("locale", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
          for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
        },
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // Skip API routes, Next.js internals and files with an extension (images, fonts…).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
