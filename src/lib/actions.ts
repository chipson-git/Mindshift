"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getBackend } from "@/lib/backend";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { hasFeature, isPlanId } from "@/lib/plans";
import { dayKey } from "@/lib/streak";
import { EXERCISES } from "@/lib/content/exercises";
import { COURSES } from "@/lib/content/courses";

export type AuthFormState = { error?: "invalid" | "generic" | "fields"; notice?: "checkEmail" } | undefined;

function localeFrom(formData: FormData): Locale {
  const value = formData.get("locale");
  return isLocale(value) ? value : "ka";
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Only allow redirects to paths inside the app. */
function safeNext(value: string, locale: Locale, fallback: string): string {
  return value.startsWith(`/${locale}/`) && !value.startsWith("//") ? value : fallback;
}

async function requireSession() {
  const session = await getBackend().getSession();
  if (!session) throw new Error("Not signed in");
  return session;
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = localeFrom(formData);
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");
  if (!name || !email.includes("@") || password.length < 6) return { error: "fields" };

  const result = await getBackend().signUp({ name, email, password });
  if (!result.ok) return result.error === "checkEmail" ? { notice: "checkEmail" } : { error: result.error };
  redirect(safeNext(str(formData, "next"), locale, `/${locale}/pricing`));
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = localeFrom(formData);
  const email = str(formData, "email");
  const password = str(formData, "password");
  if (!email || !password) return { error: "fields" };

  const result = await getBackend().signIn({ email, password });
  if (!result.ok) return { error: result.error === "checkEmail" ? "generic" : result.error };
  redirect(safeNext(str(formData, "next"), locale, `/${locale}/app`));
}

export async function signOutAction(formData: FormData) {
  await getBackend().signOut();
  redirect(`/${localeFrom(formData)}`);
}

export async function subscribeAction(formData: FormData) {
  const locale = localeFrom(formData);
  const plan = formData.get("plan");
  const period = formData.get("period");
  if (!isPlanId(plan) || (period !== "monthly" && period !== "yearly")) redirect(`/${locale}/pricing`);

  const session = await getBackend().getSession();
  if (!session) redirect(`/${locale}/signup?next=/${locale}/checkout/${plan}?period=${period}`);

  // Real payments are not wired up yet. In any other mode, a provider webhook must call setPlan.
  if ((process.env.PAYMENTS_MODE ?? "demo") !== "demo") {
    throw new Error("Payment provider not configured");
  }
  await getBackend().setPlan(plan, period);
  redirect(`/${locale}/app`);
}

export async function cancelSubscriptionAction(formData: FormData) {
  await requireSession();
  await getBackend().setPlan(null, null);
  revalidatePath(`/${localeFrom(formData)}/app/account`);
}

export async function completeExerciseAction(formData: FormData) {
  const session = await requireSession();
  if (!hasFeature(session.subscription.tier, "exercises")) return;
  const exerciseId = str(formData, "exerciseId");
  if (!EXERCISES.some((e) => e.id === exerciseId)) return;
  await getBackend().completeExercise(dayKey(), exerciseId);
  revalidatePath(`/${localeFrom(formData)}/app`);
}

export async function completeLessonAction(formData: FormData) {
  const session = await requireSession();
  if (!hasFeature(session.subscription.tier, "courses")) return;
  const lessonId = str(formData, "lessonId");
  const course = COURSES.find((c) => c.lessons.some((l) => l.id === lessonId));
  if (!course) return;
  await getBackend().completeLesson(lessonId);
  revalidatePath(`/${localeFrom(formData)}/app/courses/${course.slug}`);
}

export async function createPostAction(formData: FormData) {
  const session = await requireSession();
  if (!hasFeature(session.subscription.tier, "community")) return;
  const body = str(formData, "body").slice(0, 1000);
  if (!body) return;
  await getBackend().createPost(body);
  revalidatePath(`/${localeFrom(formData)}/app/community`);
}
