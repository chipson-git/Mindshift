import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isPlanId, type UsageKind } from "@/lib/plans";
import type { Backend, Post, Session } from "./types";

// Supabase backend: real accounts (Supabase Auth) and Postgres tables defined in
// supabase/schema.sql. Row Level Security there makes sure users can only read and
// write their own rows, and cannot change their own plan or usage counters.

async function client() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (toSet) => {
          try {
            for (const { name, value, options } of toSet) store.set(name, value, options);
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The proxy refreshes the session cookie on the next request instead.
          }
        },
      },
    },
  );
}

/** Service-role client. Server-only: bypasses RLS to change plans (checkout / payment webhooks). */
function admin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to change subscription plans");
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}

async function requireUserId() {
  const sb = await client();
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return { sb, userId: data.user.id };
}

export const supabaseBackend: Backend = {
  mode: "supabase",

  async getSession(): Promise<Session | null> {
    const sb = await client();
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    const { data: profile } = await sb
      .from("profiles")
      .select("name, tier, billing_period, current_period_end")
      .eq("id", data.user.id)
      .maybeSingle();

    const expired =
      profile?.current_period_end != null && new Date(profile.current_period_end) < new Date();
    const tier = !expired && isPlanId(profile?.tier) ? profile.tier : null;

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        name: profile?.name || data.user.email?.split("@")[0] || "",
      },
      subscription: {
        tier,
        period: tier ? (profile?.billing_period ?? null) : null,
        renewsAt: tier ? (profile?.current_period_end ?? null) : null,
      },
    };
  },

  async signUp({ name, email, password }) {
    const sb = await client();
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return { ok: false, error: "generic" };
    // With email confirmation enabled, there is no session until the user clicks the link.
    return data.session ? { ok: true } : { ok: false, error: "checkEmail" };
  },

  async signIn({ email, password }) {
    const sb = await client();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error ? { ok: false, error: "invalid" } : { ok: true };
  },

  async signOut() {
    const sb = await client();
    await sb.auth.signOut();
  },

  async setPlan(tier, period) {
    const { userId } = await requireUserId();
    let periodEnd: string | null = null;
    if (tier && period) {
      const end = new Date();
      if (period === "monthly") end.setUTCMonth(end.getUTCMonth() + 1);
      else end.setUTCFullYear(end.getUTCFullYear() + 1);
      periodEnd = end.toISOString();
    }
    const { error } = await admin()
      .from("profiles")
      .update({ tier, billing_period: tier ? period : null, current_period_end: periodEnd })
      .eq("id", userId);
    if (error) throw error;
  },

  async getProgress() {
    const { sb, userId } = await requireUserId();
    const [ex, le] = await Promise.all([
      sb.from("exercise_completions").select("day, exercise_id").eq("user_id", userId),
      sb.from("lesson_completions").select("lesson_id").eq("user_id", userId),
    ]);
    return {
      exercises: (ex.data ?? []).map((r) => ({ day: r.day as string, exerciseId: r.exercise_id as string })),
      lessons: (le.data ?? []).map((r) => r.lesson_id as string),
    };
  },

  async completeExercise(day, exerciseId) {
    const { sb, userId } = await requireUserId();
    await sb
      .from("exercise_completions")
      .upsert({ user_id: userId, day, exercise_id: exerciseId }, { ignoreDuplicates: true });
  },

  async completeLesson(lessonId) {
    const { sb, userId } = await requireUserId();
    await sb
      .from("lesson_completions")
      .upsert({ user_id: userId, lesson_id: lessonId }, { ignoreDuplicates: true });
  },

  async getUsage(month) {
    const { sb, userId } = await requireUserId();
    const { data } = await sb
      .from("ai_usage")
      .select("coach_messages, custom_meditations")
      .eq("user_id", userId)
      .eq("month", month)
      .maybeSingle();
    return {
      coachMessages: data?.coach_messages ?? 0,
      customMeditations: data?.custom_meditations ?? 0,
    };
  },

  async incrementUsage(month, kind: UsageKind) {
    const { sb } = await requireUserId();
    // Security-definer function: users can't write ai_usage directly.
    const { error } = await sb.rpc("increment_usage", {
      p_month: month,
      p_kind: kind === "coachMessages" ? "coach_messages" : "custom_meditations",
    });
    if (error) throw error;
  },

  async listPosts(limit = 50): Promise<Post[]> {
    const sb = await client();
    const { data } = await sb
      .from("posts")
      .select("id, author_name, body, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((r) => ({
      id: r.id as string,
      authorName: r.author_name as string,
      body: r.body as string,
      createdAt: r.created_at as string,
    }));
  },

  async createPost(body) {
    const { sb, userId } = await requireUserId();
    const { data: profile } = await sb.from("profiles").select("name").eq("id", userId).single();
    const { error } = await sb
      .from("posts")
      .insert({ user_id: userId, author_name: profile?.name ?? "", body });
    if (error) throw error;
  },
};
