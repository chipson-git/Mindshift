import type { BillingPeriod, Tier, UsageKind } from "@/lib/plans";

export interface AppUser {
  id: string;
  email: string;
  name: string;
}

export interface Subscription {
  tier: Tier;
  period: BillingPeriod | null;
  /** ISO date the current period ends (renews), or null if not subscribed. */
  renewsAt: string | null;
}

export interface Session {
  user: AppUser;
  subscription: Subscription;
}

export interface ExerciseCompletion {
  day: string;
  exerciseId: string;
}

export interface Progress {
  exercises: ExerciseCompletion[];
  lessons: string[];
}

export type Usage = Record<UsageKind, number>;

export interface Post {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export type AuthResult = { ok: true } | { ok: false; error: "invalid" | "generic" | "checkEmail" };

/**
 * Everything the app needs from storage. Two implementations:
 * - demo: a browser cookie (no setup, single device)
 * - supabase: real accounts and a Postgres database
 *
 * Methods that write must be called from a Server Action or Route Handler.
 */
export interface Backend {
  readonly mode: "demo" | "supabase";
  getSession(): Promise<Session | null>;
  signUp(input: { name: string; email: string; password: string }): Promise<AuthResult>;
  signIn(input: { email: string; password: string }): Promise<AuthResult>;
  signOut(): Promise<void>;
  /** Activates (or with tier=null cancels) a plan. Called by checkout / payment webhooks. */
  setPlan(tier: Tier, period: BillingPeriod | null): Promise<void>;
  getProgress(): Promise<Progress>;
  completeExercise(day: string, exerciseId: string): Promise<void>;
  completeLesson(lessonId: string): Promise<void>;
  getUsage(month: string): Promise<Usage>;
  incrementUsage(month: string, kind: UsageKind): Promise<void>;
  listPosts(limit?: number): Promise<Post[]>;
  createPost(body: string): Promise<void>;
}
