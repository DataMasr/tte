import Link from "next/link";
import { ArrowLeft, CircleCheck, Lightbulb, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { telHref, whatsappHref } from "@/lib/contact";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** أزرار التواصل السريع أسفل عنوان الصفحة */
export function HeroActions({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a
        href={whatsappHref(message)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses({ variant: "whatsapp", size: "lg" })}
      >
        <WhatsAppIcon className="size-5" />
        تواصل عبر واتساب
      </a>
      <a href={telHref()} className={buttonClasses({ variant: "glass", size: "lg" })}>
        <Phone className="size-5" aria-hidden="true" />
        اتصل: {site.contact.phone.display}
      </a>
    </div>
  );
}

export function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="font-medium leading-relaxed text-slate-800">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function TipList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-4">
      {items.map((tip) => (
        <li key={tip} className="flex items-start gap-3">
          <Lightbulb className="mt-1 size-5 shrink-0 text-amber-500" aria-hidden="true" />
          <span className="leading-relaxed text-slate-700">{tip}</span>
        </li>
      ))}
    </ul>
  );
}

export function ChipList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200"
        >
          <MapPin className="size-3.5 text-brand-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** ملخص الأسعار المختصر في صفحات الخدمات والمناطق */
export function PriceNote({ className }: { className?: string }) {
  const { show, from, upTo, currency } = site.pricing;
  return (
    <div
      className={cn(
        "rounded-3xl bg-linear-to-bl from-brand-500 via-brand-600 to-brand-800 p-6 text-white shadow-xl shadow-brand-600/20",
        className,
      )}
    >
      <p className="text-sm font-semibold text-blue-100">الأسعار</p>
      {show ? (
        <p className="mt-2 font-display text-2xl font-extrabold leading-snug">
          تبدأ من {formatNumber(from)} {currency}
          <span className="block text-base font-semibold text-blue-100">
            وقد تتجاوز {formatNumber(upTo)} {currency} حسب حجم ونوع النقل والخدمة المطلوبة
          </span>
        </p>
      ) : (
        <p className="mt-2 font-display text-xl font-extrabold">سعر واضح ونهائي بعد المعاينة</p>
      )}
      <p className="mt-3 text-sm text-blue-100">السعر النهائي بعد المعاينة • بدون مصاريف مخفية</p>
    </div>
  );
}

type LinkGroup = { title: string; links: { href: string; label: string; hint?: string }[] };

/** روابط داخلية لصفحات مرتبطة (مناطق أو خدمات) */
export function RelatedLinks({ groups }: { groups: LinkGroup[] }) {
  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <Container className="space-y-12">
        {groups
          .filter((group) => group.links.length)
          .map((group) => (
            <div key={group.title}>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">{group.title}</h2>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.links.map((link) => (
                  <li key={link.href} className="min-w-0">
                    <Link
                      href={link.href}
                      className="group flex h-full items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80 transition hover:shadow-lg hover:shadow-slate-900/5 hover:ring-brand-200"
                    >
                      <span className="min-w-0">
                        <span className="block font-bold text-slate-900 group-hover:text-brand-700">{link.label}</span>
                        {link.hint && <span className="mt-0.5 block truncate text-sm text-slate-500">{link.hint}</span>}
                      </span>
                      <ArrowLeft
                        className="size-4 shrink-0 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-brand-600"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </Container>
    </section>
  );
}
