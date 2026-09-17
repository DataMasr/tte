"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LoaderCircle } from "lucide-react";
import { getAdminClient } from "@/lib/supabase";
import { Dashboard } from "./dashboard";
import { LoginScreen } from "./login-screen";

export function AdminApp() {
  const [session, setSession] = useState<Session | null>();

  useEffect(() => {
    const { data } = getAdminClient().auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ink-950 text-slate-400">
        <LoaderCircle className="size-7 animate-spin" aria-label="جاري التحميل" />
      </div>
    );
  }

  return session ? <Dashboard email={session.user.email ?? "مسؤول"} /> : <LoginScreen />;
}
