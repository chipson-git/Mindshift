"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction, type AuthFormState } from "@/lib/actions";
import type { Dictionary, Locale } from "@/lib/i18n";

export function AuthForm({
  mode,
  locale,
  t,
  next,
  demo,
}: {
  mode: "login" | "signup";
  locale: Locale;
  t: Dictionary["auth"];
  next?: string;
  demo: boolean;
}) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, undefined);

  const error =
    state?.error === "invalid" ? t.errorInvalid : state?.error === "fields" ? t.errorFields : state?.error ? t.errorGeneric : null;

  return (
    <div className="card mx-auto w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">{mode === "login" ? t.loginTitle : t.signupTitle}</h1>
      {demo && <p className="mt-2 rounded-xl bg-secondary-soft px-3 py-2 text-xs text-text">{t.demoNote}</p>}

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        {next && <input type="hidden" name="next" value={next} />}
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="label">{t.name}</label>
            <input id="name" name="name" required autoComplete="name" className="input" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">{t.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">{t.password}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="input"
          />
        </div>

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {state?.notice === "checkEmail" && <p role="status" className="text-sm text-accent-strong">{t.checkEmail}</p>}

        <button type="submit" disabled={pending} className="btn-primary w-full py-3">
          {mode === "login" ? t.submitLogin : t.submitSignup}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? t.noAccount : t.haveAccount}{" "}
        <Link
          href={`/${locale}/${mode === "login" ? "signup" : "login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-accent-strong underline-offset-4 hover:underline"
        >
          {mode === "login" ? t.submitSignup : t.submitLogin}
        </Link>
      </p>
    </div>
  );
}
