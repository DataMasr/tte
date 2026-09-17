"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { bookingHref, telHref, whatsappHref } from "@/lib/contact";
import { useScrolledPast } from "@/lib/use-scrolled-past";
import { cn } from "@/lib/utils";

/** شريط تواصل سريع أسفل شاشة الموبايل + زر واتساب عائم على الكمبيوتر */
export function ContactShortcuts() {
  const pathname = usePathname();
  const visible = useScrolledPast(520);

  return (
    <>
      <div
        inert={!visible}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgb(15_23_42/0.1)] backdrop-blur-xl transition-transform duration-300 md:hidden",
          visible ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="grid grid-cols-3 gap-2">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "whatsapp", size: "compact" })}
          >
            <WhatsAppIcon className="size-5" />
            واتساب
          </a>
          <a href={telHref()} className={buttonClasses({ variant: "light", size: "compact" })}>
            <Phone className="size-5 text-brand-600" aria-hidden="true" />
            اتصال
          </a>
          <Link href={bookingHref(pathname)} className={buttonClasses({ size: "compact" })}>
            <CalendarCheck className="size-5" aria-hidden="true" />
            احجز
          </Link>
        </div>
      </div>

      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا عبر واتساب"
        className="group fixed bottom-6 end-6 z-40 hidden size-14 place-items-center rounded-full bg-whatsapp text-white shadow-xl shadow-emerald-950/30 transition hover:scale-105 hover:bg-whatsapp-hover md:grid"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-whatsapp opacity-40 motion-safe:animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_4]"
        />
        <WhatsAppIcon className="relative size-7" />
        <span className="pointer-events-none absolute end-full me-3 whitespace-nowrap rounded-full bg-ink-950 px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
          تواصل معنا الآن
        </span>
      </a>
    </>
  );
}
