import { demoBackend } from "./demo";
import { supabaseBackend } from "./supabase";
import type { Backend } from "./types";

export type * from "./types";

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getBackend(): Backend {
  return isSupabaseConfigured() ? supabaseBackend : demoBackend;
}
