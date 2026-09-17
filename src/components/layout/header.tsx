"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Menu, PackageSearch, Phone, X } from "lucide-react";
import { nav, site } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { bookingHref, telHref, whatsappHref } from "@/lib/contact";
import { useScrolledPast } from "@/lib/use-scrolled-past";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(12);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const desktop = window.matchMedia("(min-width: 64rem)");
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", close);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", close);
    };
  }, [open]);

  const solid = scrolled || open;
  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);
  const trackActive = pathname.replace(/\/$/, "") === "/track";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        solid
          ? "border-white/10 bg-ink-950/85 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-3 lg:h-20">
        <Logo />

        <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[15px] font-medium transition hover:bg-white/10 hover:text-white",
                    isActive(item.href) ? "bg-white/10 text-white" : "text-slate-300",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref()}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-200 transition hover:text-white xl:inline-flex"
          >
            <Phone className="size-4 text-sky-300" aria-hidden="true" />
            {site.contact.phone.display}
          </a>
          <Link
            href="/track"
            aria-current={trackActive ? "page" : undefined}
            className={cn(buttonClasses({ variant: "glass", size: "sm" }), "aria-[current=page]:ring-sky-300/70")}
          >
            <PackageSearch className="size-[18px] text-sky-300" aria-hidden="true" />
            <span>
              تتبع<span className="max-[400px]:hidden"> طلبك</span>
            </span>
          </Link>
          <Link href={bookingHref(pathname)} className={cn(buttonClasses({ size: "sm" }), "max-sm:hidden")}>
            احجز الآن
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/20 lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <div id="mobile-menu" hidden={!open} className="border-t border-white/10 lg:hidden">
        <Container className="max-h-[calc(100dvh-4rem)] overflow-y-auto py-4">
          <nav aria-label="قائمة الموبايل">
            <ul className="grid gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="block rounded-2xl px-4 py-3.5 text-base font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <Link
              href={bookingHref(pathname)}
              onClick={() => setOpen(false)}
              className={cn(buttonClasses(), "col-span-2")}
            >
              <CalendarCheck className="size-5" aria-hidden="true" />
              احجز الآن
            </Link>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "whatsapp" })}
            >
              <WhatsAppIcon className="size-5" />
              واتساب
            </a>
            <a href={telHref()} className={buttonClasses({ variant: "glass" })}>
              <Phone className="size-5" aria-hidden="true" />
              اتصال
            </a>
          </div>
        </Container>
      </div>
    </header>
  );
}
