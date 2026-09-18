"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarClock, Gift, X } from "lucide-react";
import { DarkBackdrop } from "@/components/backdrop";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { bookingHref, whatsappHref } from "@/lib/contact";
import {
  offer,
  offerCountdown,
  offerEligibility,
  offerLastDay,
  offerRemaining,
  offerWhatsappMessage,
  useOffer,
  type RunningOffer,
} from "@/lib/offer";
import { cn } from "@/lib/utils";

/**
 * رسالة العرض: تظهر في كل مرة يُفتح فيها الموقع (وبعد كل تحديث للصفحة)،
 * ومرة واحدة فقط أثناء التنقل بين الصفحات حتى لا تقاطع الزائر
 */
export function OfferPopup() {
  const status = useOffer();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const available = offerEligibility(status) !== "no";

  useEffect(() => {
    if (!available) return;
    const timer = window.setTimeout(() => setOpen(true), 800);
    return () => window.clearTimeout(timer);
  }, [available]);

  if (!open || !available || status.phase !== "running") return null;

  return <OfferDialog status={status} bookingLink={bookingHref(pathname)} onClose={() => setOpen(false)} />;
}

function OfferDialog({
  status,
  bookingLink,
  onClose,
}: {
  status: RunningOffer;
  bookingLink: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const remaining = offerRemaining(status);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // الكمبيوتر: رسالة في منتصف الشاشة. الموبايل: بطاقة أسفل الشاشة لا تغطي الصفحة،
    // لأن جوجل يخفض ترتيب الصفحات التي تغطيها نافذة منبثقة على الموبايل
    if (window.matchMedia("(min-width: 768px)").matches) dialog.showModal();
    else dialog.show();
    // قارئ الشاشة يبدأ بعنوان العرض بدلًا من زر الإغلاق
    titleRef.current?.focus({ preventScroll: true });

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dialog.close();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
      aria-labelledby="offer-title"
      aria-describedby="offer-text"
      className="fixed inset-x-3 top-auto bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[60] m-0 max-h-[calc(100dvh-1.5rem)] w-auto max-w-none overflow-y-auto rounded-[1.75rem] bg-ink-950 p-0 text-white shadow-2xl shadow-ink-950/40 ring-1 ring-white/10 backdrop:bg-ink-950/60 backdrop:backdrop-blur-sm motion-safe:animate-pop-in motion-safe:backdrop:animate-fade-in md:inset-0 md:m-auto md:h-fit md:w-[min(30rem,calc(100%-3rem))]"
    >
      <div className="relative isolate p-5 sm:p-7">
        <DarkBackdrop />
        <button
          type="button"
          onClick={close}
          aria-label="إغلاق"
          className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white sm:end-4 sm:top-4"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-inset ring-amber-300/25">
          <Gift className="size-3.5" aria-hidden="true" />
          عرض لفترة محدودة
        </p>
        <h2
          ref={titleRef}
          id="offer-title"
          tabIndex={-1}
          className="mt-3 pe-10 font-display text-2xl leading-snug font-extrabold text-balance focus:outline-none sm:text-3xl"
        >
          خصم <span className="text-amber-300">{offer.discount}%</span> لأول {offer.limit} طلب
        </h2>
        <p id="offer-text" className="mt-2 text-slate-300 max-sm:sr-only sm:leading-relaxed">
          احجز نقل عفشك الآن واحصل على خصم {offer.discount}% على سعر النقل.
        </p>

        <div className="mt-4 rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 ring-inset">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="size-4 shrink-0 text-amber-300" aria-hidden="true" />
            حتى {offerLastDay} · {offerCountdown(status.daysLeft)}
          </p>
          {remaining !== null && (
            <div className="mt-3">
              <p className="flex justify-between gap-3 text-xs text-slate-400">
                <span>الأماكن المتبقية</span>
                <span className="font-bold text-white">
                  {remaining} من {offer.limit}
                </span>
              </p>
              <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-300"
                  style={{ width: `${(remaining / offer.limit) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <Link href={bookingLink} onClick={close} className={cn(buttonClasses({ variant: "white" }), "flex-1")}>
            احجز بالخصم الآن
          </Link>
          <a
            href={whatsappHref(offerWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className={buttonClasses({ variant: "whatsapp" })}
          >
            <WhatsAppIcon className="size-5" />
            <span className="max-[400px]:sr-only">واتساب</span>
          </a>
        </div>
      </div>
    </dialog>
  );
}
