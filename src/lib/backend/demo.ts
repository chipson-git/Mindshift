import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import type { BillingPeriod, Tier, UsageKind } from "@/lib/plans";
import type { Backend, Post, Progress, Session, Usage } from "./types";

// Demo backend: the whole user state lives in one cookie, so the app works with zero setup.
// It is NOT secure (the user can edit the cookie) and is meant for previews only.

const COOKIE = "ms_demo";
const MAX_COMPLETIONS = 120;

interface DemoState {
  user: { id: string; email: string; name: string };
  tier: Tier;
  period: BillingPeriod | null;
  renewsAt: string | null;
  /** "YYYY-MM-DD|exerciseId" */
  done: string[];
  lessons: string[];
  usage: { month: string } & Usage;
}

function encode(state: DemoState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

function decode(raw: string | undefined): DemoState | null {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as DemoState;
  } catch {
    return null;
  }
}

async function read(): Promise<DemoState | null> {
  return decode((await cookies()).get(COOKIE)?.value);
}

async function write(state: DemoState): Promise<void> {
  state.done = state.done.slice(-MAX_COMPLETIONS);
  (await cookies()).set(COOKIE, encode(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

async function update(fn: (state: DemoState) => void): Promise<void> {
  const state = await read();
  if (!state) throw new Error("Not signed in");
  fn(state);
  await write(state);
}

// Community posts are shared between demo users of the same server process (resets on restart).
const globalForPosts = globalThis as unknown as { __mindshiftPosts?: Post[] };
const posts: Post[] = (globalForPosts.__mindshiftPosts ??= [
  {
    id: "seed-1",
    authorName: "Nino",
    body: "მე-7 დღე ზედიზედ! დილის განზრახვა ნამდვილად ცვლის დღის ტონს. 🌱",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "seed-2",
    authorName: "Alex",
    body: "The worry window exercise helped me sleep better this week. Highly recommend.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
]);

export const demoBackend: Backend = {
  mode: "demo",

  async getSession(): Promise<Session | null> {
    const state = await read();
    if (!state) return null;
    return {
      user: state.user,
      subscription: { tier: state.tier, period: state.period, renewsAt: state.renewsAt },
    };
  },

  async signUp({ name, email }) {
    await write({
      user: { id: randomUUID(), email, name },
      tier: null,
      period: null,
      renewsAt: null,
      done: [],
      lessons: [],
      usage: { month: "", coachMessages: 0, customMeditations: 0 },
    });
    return { ok: true };
  },

  async signIn({ email }) {
    // Any credentials work in demo mode. Keep existing progress if the same email signs back in.
    const existing = await read();
    if (existing && existing.user.email === email) return { ok: true };
    return demoBackend.signUp({ name: email.split("@")[0] || "Friend", email, password: "" });
  },

  async signOut() {
    (await cookies()).delete(COOKIE);
  },

  async setPlan(tier, period) {
    await update((s) => {
      s.tier = tier;
      s.period = tier ? period : null;
      if (tier && period) {
        const renews = new Date();
        if (period === "monthly") renews.setUTCMonth(renews.getUTCMonth() + 1);
        else renews.setUTCFullYear(renews.getUTCFullYear() + 1);
        s.renewsAt = renews.toISOString();
      } else {
        s.renewsAt = null;
      }
    });
  },

  async getProgress(): Promise<Progress> {
    const state = await read();
    if (!state) return { exercises: [], lessons: [] };
    return {
      exercises: state.done.map((entry) => {
        const [day, exerciseId] = entry.split("|");
        return { day, exerciseId };
      }),
      lessons: state.lessons,
    };
  },

  async completeExercise(day, exerciseId) {
    await update((s) => {
      const key = `${day}|${exerciseId}`;
      if (!s.done.includes(key)) s.done.push(key);
    });
  },

  async completeLesson(lessonId) {
    await update((s) => {
      if (!s.lessons.includes(lessonId)) s.lessons.push(lessonId);
    });
  },

  async getUsage(month) {
    const state = await read();
    if (!state || state.usage.month !== month) return { coachMessages: 0, customMeditations: 0 };
    return { coachMessages: state.usage.coachMessages, customMeditations: state.usage.customMeditations };
  },

  async incrementUsage(month, kind: UsageKind) {
    await update((s) => {
      if (s.usage.month !== month) s.usage = { month, coachMessages: 0, customMeditations: 0 };
      s.usage[kind] += 1;
    });
  },

  async listPosts(limit = 50) {
    return posts.slice(0, limit);
  },

  async createPost(body) {
    const state = await read();
    if (!state) throw new Error("Not signed in");
    posts.unshift({
      id: randomUUID(),
      authorName: state.user.name,
      body,
      createdAt: new Date().toISOString(),
    });
    posts.splice(200);
  },
};
