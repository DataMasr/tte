import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DarkBackdrop } from "@/components/backdrop";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-ink-950 px-4 py-16 text-center">
      <DarkBackdrop />
      <div>
        <Logo className="mx-auto" />
        <p className="mt-12 font-display text-8xl font-extrabold text-white/15">404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-white">الصفحة غير موجودة</h1>
        <p className="mt-3 text-slate-300">ربما تم نقلها أو حذفها.</p>
        <Link href="/" className={`${buttonClasses()} mt-8`}>
          العودة للرئيسية
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
