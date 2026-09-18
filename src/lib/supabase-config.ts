// مفتاح anon عام بطبيعته ويصل للمتصفح في كل الأحوال.
// حماية بيانات العملاء تتم عن طريق سياسات RLS في supabase/schema.sql
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pxyzvutwdoioyvvljoxt.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eXp2dXR3ZG9pb3l2dmxqb3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4Mjg3MDcsImV4cCI6MjEwNDQwNDcwN30.ErOHFBpXPUQZ-h_g1Iczp-IA3_P-aiztCAEcfwGDjo4";
