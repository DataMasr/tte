import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// مفتاح anon عام بطبيعته ويصل للمتصفح في كل الأحوال.
// حماية بيانات العملاء تتم عن طريق سياسات RLS في supabase/schema.sql
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pxyzvutwdoioyvvljoxt.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eXp2dXR3ZG9pb3l2dmxqb3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4Mjg3MDcsImV4cCI6MjEwNDQwNDcwN30.ErOHFBpXPUQZ-h_g1Iczp-IA3_P-aiztCAEcfwGDjo4";

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
