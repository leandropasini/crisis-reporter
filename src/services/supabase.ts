import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

console.log('[DEBUG] Supabase URL:', supabaseUrl);
console.log('[DEBUG] Key exists:', Boolean(supabaseAnonKey));

// Fallback prevents crash when env vars are missing (demo / offline mode)
export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key"
);

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && supabaseUrl !== "https://placeholder.supabase.co";
