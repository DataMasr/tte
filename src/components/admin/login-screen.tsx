"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { DarkBackdrop } from "@/components/backdrop";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";
import { inputClasses, labelClasses } from "@/components/ui/styles";
import { getAdminClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const { error } = await getAdminClient().auth.signInWithPassword({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    });

    setPending(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : `تعذّر تسجيل الدخول: ${error.message}`,
      );
    }
  }

  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-ink-950 px-4 py-12">
      <DarkBackdrop />
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-slate-900">دخول لوحة الإدارة</h1>
          <p className="mt-1.5 text-slate-600">سجّل الدخول لمتابعة طلبات النقل.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className={labelClasses}>
                البريد الإلكتروني
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                dir="ltr"
                className={cn(inputClasses, "mt-2 text-left")}
              />
            </div>
            <div>
              <label htmlFor="admin-password" className={labelClasses}>
                كلمة المرور
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                dir="ltr"
                className={cn(inputClasses, "mt-2 text-left")}
              />
            </div>

            {error && (
              <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                {error}
              </p>
            )}

            <button type="submit" disabled={pending} className={buttonClasses({ size: "lg", block: true })}>
              {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
              {pending ? "جاري الدخول..." : "دخول"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          العودة للموقع
        </Link>
      </div>
    </main>
  );
}
