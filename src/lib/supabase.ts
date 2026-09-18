import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config";

let publicClient: SupabaseClient | undefined;
let adminClient: SupabaseClient | undefined;

/** عميل الزوار (الحجز والتتبع) بدون جلسة دخول */
export function getPublicClient() {
  publicClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "na2lax-public",
    },
  });
  return publicClient;
}

/** عميل لوحة الإدارة، يحتفظ بجلسة الدخول */
export function getAdminClient() {
  adminClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return adminClient;
}
