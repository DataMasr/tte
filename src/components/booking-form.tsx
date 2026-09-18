"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleCheckBig,
  Copy,
  Gift,
  LoaderCircle,
  MapPin,
  Send,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { moveSizes, serviceOptions } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { ServiceChips } from "@/components/ui/service-chips";
import { inputClasses } from "@/components/ui/styles";
import { whatsappHref } from "@/lib/contact";
import { formatDate, todayISO } from "@/lib/format";
import {
  offer,
  offerEligibility,
  offerLastDay,
  offerRemaining,
  offerTitle,
  refreshOffer,
  snoozeOffer,
  useOffer,
} from "@/lib/offer";
import { createBooking, isServiceColumn, type OrderInput, type ServiceColumn } from "@/lib/orders";
import { normalizeEgyptianMobile } from "@/lib/phone";
import { cn } from "@/lib/utils";

type Field = "clientName" | "phone" | "fromArea" | "toArea" | "moveDate";
type Errors = Partial<Record<Field, string>>;
type OfferMatch = ReturnType<typeof offerEligibility>;
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; code: string; input: OrderInput; offerMatch: OfferMatch }
  | { kind: "failed"; input: OrderInput };

const FIELDS: Field[] = ["clientName", "phone", "fromArea", "toArea", "moveDate"];

function readForm(data: FormData) {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const rawPhone = text("phone");
  const phone = normalizeEgyptianMobile(rawPhone);

  const input: OrderInput = {
    clientName: text("clientName").slice(0, 80),
    phone: phone ?? rawPhone,
    fromArea: text("fromArea").slice(0, 120),
    toArea: text("toArea").slice(0, 120),
    moveDate: text("moveDate") || null,
    size: text("size") || null,
    services: data.getAll("services").map(String).filter(isServiceColumn),
    notes: text("notes").slice(0, 1000),
  };

  const errors: Errors = {};
  if (input.clientName.length < 2) errors.clientName = "من فضلك اكتب اسمك";
  if (!rawPhone) errors.phone = "من فضلك اكتب رقم الموبايل";
  else if (!phone) errors.phone = "اكتب رقم موبايل مصري صحيح (11 رقم)";
  if (input.fromArea.length < 2) errors.fromArea = "اكتب منطقة التحميل";
  if (input.toArea.length < 2) errors.toArea = "اكتب منطقة التوصيل";
  if (!input.moveDate) errors.moveDate = "اختر تاريخ النقل";
  else if (input.moveDate < todayISO()) errors.moveDate = "اختر تاريخًا من اليوم فصاعدًا";

  return { input, errors };
}

function whatsappSummary(input: OrderInput, offerMatch: OfferMatch, code?: string) {
  const services = serviceOptions
    .filter((option) => input.services.includes(option.column))
    .map((option) => option.label);

  return [
    code ? "مرحبًا NA2LAX، أرسلت طلب نقل من الموقع." : "مرحبًا NA2LAX، أريد حجز نقل عفش.",
    code && `رقم الطلب: ${code}`,
    offerMatch !== "no" && `العرض: ${offerTitle}`,
    `الاسم: ${input.clientName}`,
    `الموبايل: ${input.phone}`,
    `من: ${input.fromArea}`,
    `إلى: ${input.toArea}`,
    input.moveDate && `تاريخ النقل: ${formatDate(input.moveDate)}`,
    input.size && `حجم النقل: ${input.size}`,
    services.length > 0 && `الخدمات: ${services.join("، ")}`,
    input.notes && `ملاحظات: ${input.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function BookingForm({
  defaultServices,
  areaHint = "التجمع الخامس",
}: {
  /** خدمات محددة مسبقًا (مثل الونش في صفحة خدمة الونش) */
  defaultServices?: ServiceColumn[];
  /** اسم منطقة يظهر كمثال في خانة "النقل من" */
  areaHint?: string;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const dateRef = useRef<HTMLInputElement>(null);
  const offerMatch = offerEligibility(useOffer());

  // يتم ضبطه بعد التحميل لتفادي اختلاف التاريخ بين السيرفر والمتصفح
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayISO();
  }, [status.kind]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return; // حقل مخفي لاصطياد البوتات

    const { input, errors } = readForm(data);
    setErrors(errors);
    const firstInvalid = FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    const result = await createBooking(input);
    if (!result.ok) {
      setStatus({ kind: "failed", input });
      return;
    }
    // لو كانت هناك أماكن متاحة في العرض لحظة الإرسال، فالطلب داخله
    setStatus({ kind: "sent", code: result.code, input, offerMatch });
    snoozeOffer({ booked: true });
    void refreshOffer();
  }

  function clearError(event: React.FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name as Field;
    if (!errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  if (status.kind === "sent") {
    return (
      <BookingSuccess
        code={status.code}
        input={status.input}
        offerMatch={status.offerMatch}
        onReset={() => setStatus({ kind: "idle" })}
      />
    );
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={handleSubmit} onInput={clearError} noValidate>
      {offerMatch !== "no" && <OfferNote />}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="clientName" label="الاسم" autoComplete="name" placeholder="اسمك بالكامل" error={errors.clientName} />
        <TextField
          name="phone"
          label="رقم الموبايل"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01xxxxxxxxx"
          error={errors.phone}
        />
        <TextField name="fromArea" label="النقل من" placeholder={`مثال: ${areaHint}`} icon={MapPin} error={errors.fromArea} />
        <TextField
          name="toArea"
          label="النقل إلى"
          placeholder={areaHint === "الشيخ زايد" ? "مثال: 6 أكتوبر" : "مثال: الشيخ زايد"}
          icon={MapPin}
          error={errors.toArea}
        />
        <TextField ref={dateRef} name="moveDate" label="تاريخ النقل" type="date" error={errors.moveDate} />

        <div>
          <label htmlFor="booking-size" className="text-sm font-semibold text-slate-800">
            حجم النقل <span className="font-normal text-slate-400">(اختياري)</span>
          </label>
          <div className="relative mt-2">
            <select id="booking-size" name="size" defaultValue="" className={cn(inputClasses, "appearance-none pe-11")}>
              <option value="">اختر حجم النقل</option>
              {moveSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-slate-800">
          الخدمات المطلوبة <span className="font-normal text-slate-400">(اختياري)</span>
        </legend>
        <ServiceChips defaultValue={defaultServices} />
      </fieldset>

      <div className="mt-6">
        <label htmlFor="booking-notes" className="text-sm font-semibold text-slate-800">
          ملاحظات <span className="font-normal text-slate-400">(اختياري)</span>
        </label>
        <textarea
          id="booking-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          placeholder="مثال: الدور الخامس بدون مصعد، ويوجد قطع زجاج"
          className={cn(inputClasses, "mt-2 resize-y")}
        />
      </div>

      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status.kind === "failed" && <FailedNotice input={status.input} offerMatch={offerMatch} />}

      <button type="submit" disabled={sending} className={cn(buttonClasses({ size: "lg", block: true }), "mt-8")}>
        {sending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Send className="size-5 -scale-x-100" aria-hidden="true" />
            إرسال الطلب
          </>
        )}
      </button>
      <p className="mt-4 text-center text-sm text-slate-500">بدون أي التزام — سنتصل بك لتأكيد التفاصيل والسعر.</p>
    </form>
  );
}

function TextField({
  name,
  label,
  error,
  icon: Icon,
  ...props
}: React.ComponentProps<"input"> & { name: Field; label: string; error?: string; icon?: LucideIcon }) {
  const id = `booking-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative mt-2">
        {Icon && (
          <Icon
            className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          name={name}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputClasses, "min-h-[3.25rem]", Icon && "ps-12")}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

function OfferNote() {
  const status = useOffer();
  const remaining = status.phase === "running" ? offerRemaining(status) : null;

  return (
    <p className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-3.5 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200 ring-inset">
      <Gift className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
      <span>
        <strong className="font-bold">{offerTitle}</strong> — حتى {offerLastDay}
        {remaining !== null && (
          <>
            {" "}
            (متبقٍ {remaining} من {offer.limit})
          </>
        )}
      </span>
    </p>
  );
}

function FailedNotice({ input, offerMatch }: { input: OrderInput; offerMatch: OfferMatch }) {
  return (
    <div role="alert" className="mt-6 flex gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-inset ring-amber-200">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
      <div>
        <p className="font-bold text-amber-900">تعذّر إرسال الطلب الآن</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-800">
          أرسل نفس البيانات عبر واتساب بضغطة واحدة، وسنرد عليك في أسرع وقت.
        </p>
        <a
          href={whatsappHref(whatsappSummary(input, offerMatch))}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonClasses({ variant: "whatsapp", size: "sm" }), "mt-3")}
        >
          <WhatsAppIcon className="size-4" />
          إرسال الطلب عبر واتساب
        </a>
      </div>
    </div>
  );
}

function BookingSuccess({
  code,
  input,
  offerMatch,
  onReset,
}: {
  code: string;
  input: OrderInput;
  offerMatch: OfferMatch;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // المتصفح لا يسمح بالنسخ، الرقم ظاهر أمام العميل
    }
  }

  return (
    <div className="py-4 text-center sm:py-8">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
        <CircleCheckBig className="size-8" aria-hidden="true" />
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 scroll-mt-28 font-display text-2xl font-extrabold text-slate-900 focus:outline-none"
      >
        تم استلام طلبك بنجاح
      </h3>
      <p className="mt-2 text-slate-600">
        سنتواصل معك قريبًا على <span className="font-semibold text-slate-800">{input.phone}</span> لتأكيد الموعد.
      </p>

      {offerMatch !== "no" && (
        <p className="mx-auto mt-5 flex max-w-md items-start gap-3 rounded-2xl bg-amber-50 p-3.5 text-start text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200 ring-inset">
          <Gift className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
          {offerMatch === "yes" ? (
            <span>
              <strong className="font-bold">طلبك ضمن أول {offer.limit} طلب</strong> وله خصم {offer.discount}% على سعر
              النقل.
            </span>
          ) : (
            <span>
              <strong className="font-bold">{offerTitle}</strong> — سنؤكد لك الخصم عند التواصل.
            </span>
          )}
        </p>
      )}

      <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-slate-50 py-2 ps-5 pe-2 ring-1 ring-inset ring-slate-200">
        <span className="text-sm text-slate-500">رقم طلبك</span>
        <span dir="ltr" className="font-mono text-lg font-bold tracking-wider text-slate-900">
          {code}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100"
        >
          {copied ? <Check className="size-4 text-emerald-600" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? "تم النسخ" : "نسخ"}
        </button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <a
          href={whatsappHref(whatsappSummary(input, offerMatch, code))}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "whatsapp", block: true })}
        >
          <WhatsAppIcon className="size-5" />
          تأكيد سريع عبر واتساب
        </a>
        <Link href={`/track/?code=${encodeURIComponent(code)}`} className={buttonClasses({ variant: "light", block: true })}>
          تتبع طلبك
        </Link>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 text-sm font-semibold text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline"
      >
        إرسال طلب آخر
      </button>
    </div>
  );
}
