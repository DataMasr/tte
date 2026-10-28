// src/components/logo.tsx
// typescript / react / nextjs / browser

import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({
  tone = "dark",
  className,
  variant = "mark",
}: {
  tone?: "dark" | "light";
  className?: string;
  variant?: "mark" | "full";
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} ${site.nameAr} — الصفحة الرئيسية`}
      className={cn("group inline-flex shrink-0 items-center gap-3 rounded-xl", className)}
    >
      {variant === "full" ? (
        <Image
          src={tone === "dark" ? "/assets/logo-dark.webp" : "/assets/logo.webp"}
          alt={`${site.name} ${site.nameAr}`}
          width={180}
          height={100}
          className="h-10 w-auto object-contain transition duration-300 group-hover:scale-105 sm:h-12"
          priority
        />
      ) : (
        <>
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-white/5 p-1 ring-1 ring-white/10 backdrop-blur-sm transition duration-300 group-hover:scale-105 group-hover:ring-brand-500/30 sm:size-11">
            <Image
              src="/assets/logo-mark.webp"
              alt={site.name}
              width={48}
              height={48}
              className="size-full object-contain drop-shadow-[0_2px_8px_rgba(30,91,241,0.35)]"
              priority
            />
          </div>
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
        </>
      )}
    </Link>
  );
}
