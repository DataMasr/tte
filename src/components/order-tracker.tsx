"use client";

import { Suspense, use, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  CircleX,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  SearchX,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { whatsappHref } from "@/lib/contact";
import { formatDate } from "@/lib/format";
import { statusStyle } from "@/lib/order-status";
import { normalizeBookingCode, trackOrder, type TrackResult } from "@/lib/orders";
import { useIsClient } from "@/lib/use-is-client";
import { cn } from "@/lib/utils";

const STEPS = ["تم استلام الطلب", "جاري التواصل والمعاينة", "تم تأكيد الموعد", "تم النقل بنجاح"];
const STATUS_STEP: Record<string, number> = { جديد: 0, "جاري التواصل": 1, مؤكد: 2, مكتمل: 3 };

// نفس البحث يرجع نفس الـ Promise حتى لا يتكرر الطلب مع كل إعادة رسم
const lookups = new Map<string, Promise<TrackResult>>();
function lookup(key: string, code: string) {
  let promise = lookups.get(key);
  if (!promise) {
    promise = trackOrder(code);
    lookups.set(key, promise);
  }
  return promise;
}

export function OrderTracker() {
  const initialCode = normalizeBookingCode(useSearchParams().get("code") ?? "");
  const [query, setQuery] = useState(initialCode ? { code: initialCode, attempt: 0 } : null);
  // البحث يتم في المتصفح فقط، وليس أثناء الرندر على السيرفر
  const isClient = useIsClient();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = normalizeBookingCode(String(new FormData(event.currentTarget).get("code") ?? ""));
    if (!code) return;
    setQuery((current) => ({ code, attempt: (current?.attempt ?? 0) + 1 }));
    window.history.replaceState(null, "", `${window.location.pathname}?code=${encodeURIComponent(code)}`);
  }

  const retry = () => setQuery((current) => current && { ...current, attempt: current.attempt + 1 });
  const key = query && `${query.code}#${query.attempt}`;

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 sm:p-7"
      >
        <label htmlFor="track-code" className="font-display font-bold text-slate-900">
          رقم الطلب
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="track-code"
              name="code"
              defaultValue={initialCode}
              required
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="مثال: NQ-4K7P2Q"
              className="block h-14 w-full rounded-2xl border-0 bg-slate-50 ps-12 pe-4 text-base font-semibold uppercase text-slate-900 ring-1 ring-inset ring-slate-200 transition placeholder:font-normal placeholder:normal-case placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button type="submit" className={buttonClasses({ size: "lg" })}>
            تتبع الطلب
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {isClient && query && key && (
          <Suspense key={key} fallback={<LoadingCard />}>
            <TrackResultCard promise={lookup(key, query.code)} onRetry={retry} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function TrackResultCard({ promise, onRetry }: { promise: Promise<TrackResult>; onRetry: () => void }) {
  const result = use(promise);

  if (result.kind === "error") {
    return (
      <Notice icon={WifiOff} tone="rose" title="تعذّر الاتصال الآن" text="تأكد من اتصالك بالإنترنت وحاول مرة أخرى.">
        <button type="button" onClick={onRetry} className={buttonClasses({ variant: "light" })}>
          <RefreshCw className="size-4" aria-hidden="true" />
          إعادة المحاولة
        </button>
      </Notice>
    );
  }

  if (result.kind === "not-found") {
    return (
      <Notice
        icon={SearchX}
        tone="amber"
        title="لم نجد طلبًا بهذا الرقم"
        text="تأكد من كتابة الرقم كما هو في رسالة التأكيد، أو تواصل معنا وسنساعدك."
      >
        <a
          href={whatsappHref("مرحبًا NA2LAX، أريد الاستفسار عن حالة طلبي.")}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "whatsapp" })}
        >
          <WhatsAppIcon className="size-5" />
          تواصل عبر واتساب
        </a>
      </Notice>
    );
  }

  const { order } = result;
  const cancelled = order.status === "ملغي";
  const current = STATUS_STEP[order.status] ?? 0;
  const style = statusStyle(order.status);

  return (
    <article className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">رقم الطلب</p>
          <p dir="ltr" className="mt-1 font-mono text-xl font-bold tracking-wider text-slate-900">
            {order.booking_code}
          </p>
        </div>
        <span
          className={cn("inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 ring-inset", style.badge)}
        >
          <span className={cn("size-2 rounded-full", style.dot)} />
          {order.status}
        </span>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoItem icon={MapPin} label="خط السير" value={`${order.from_area} ← ${order.to_area}`} />
        <InfoItem icon={CalendarDays} label="موعد النقل" value={formatDate(order.move_date)} />
      </dl>

      {cancelled ? (
        <p className="mt-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-800 ring-1 ring-inset ring-rose-200">
          <CircleX className="size-5 shrink-0" aria-hidden="true" />
          تم إلغاء هذا الطلب. للاستفسار تواصل معنا.
        </p>
      ) : (
        <ol className="mt-8 grid gap-4 sm:grid-cols-4 sm:gap-2">
          {STEPS.map((label, index) => {
            const reached = index <= current;
            return (
              <li key={label} className="relative flex items-center gap-3 sm:flex-col sm:gap-2.5 sm:text-center">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute end-1/2 top-5 hidden h-0.5 w-full sm:block",
                      reached ? "bg-brand-600" : "bg-slate-200",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ring-4 ring-white",
                    reached ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400",
                  )}
                >
                  {reached ? <Check className="size-5" aria-hidden="true" /> : index + 1}
                </span>
                <span className={cn("text-sm font-semibold", reached ? "text-slate-900" : "text-slate-400")}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
      <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
      <div>
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-[2rem] bg-white p-10 text-slate-500 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70">
      <LoaderCircle className="size-5 animate-spin text-brand-600" aria-hidden="true" />
      جاري البحث عن طلبك...
    </div>
  );
}

function Notice({
  icon: Icon,
  tone,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  tone: "rose" | "amber";
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 text-center shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 sm:p-8">
      <span
        className={cn(
          "mx-auto grid size-14 place-items-center rounded-full",
          tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600",
        )}
      >
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-slate-600">{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
