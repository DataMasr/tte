import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} ${site.nameAr} — الصفحة الرئيسية`}
      className={cn("group inline-flex shrink-0 items-center gap-3 rounded-xl", className)}
    >
      <Image
        src="/assets/logo-mark.webp"
        alt=""
        width={48}
        height={48}
        className="size-10 rounded-xl shadow-lg shadow-brand-600/20 ring-1 ring-white/15 transition duration-300 group-hover:scale-105 sm:size-11"
      />
      <span className="flex flex-col gap-1">
        <span
          className={cn(
            "font-display text-lg font-extrabold leading-none tracking-tight sm:text-xl",
            tone === "dark" ? "text-white" : "text-slate-900",
          )}
        >
          {site.name}
        </span>
        <span
          className={cn(
            "text-xs font-semibold leading-none",
            tone === "dark" ? "text-sky-300" : "text-brand-600",
          )}
        >
          {site.nameAr}
        </span>
      </span>
    </Link>
  );
}
