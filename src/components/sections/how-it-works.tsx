import { CircleCheck, ClipboardCheck, MessageCircle, Truck } from "lucide-react";
import { site, steps } from "@/config/site";
import { DarkBackdrop } from "@/components/backdrop";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { whatsappHref } from "@/lib/contact";
import { formatNumber } from "@/lib/format";

const stepIcons = [MessageCircle, ClipboardCheck, Truck];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative isolate overflow-hidden bg-ink-950 py-20 sm:py-24 lg:py-28">
      <DarkBackdrop />
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow="طريقة العمل"
          title="خطوات نقل العفش معنا"
          description="3 خطوات بسيطة من أول رسالة حتى استلام بيتك الجديد."
        />

        <ol className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-14">
          {steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <li
                key={step.title}
                className="relative flex gap-4 overflow-hidden rounded-3xl bg-white/[0.04] p-5 ring-1 ring-inset ring-white/10 sm:p-8 md:block"
              >
                <span
                  aria-hidden="true"
                  className="absolute end-5 top-4 font-display text-4xl font-extrabold text-white/10 sm:end-8 sm:top-7 sm:text-5xl"
                >
                  0{index + 1}
                </span>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white md:mt-6">{step.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-slate-400 md:mt-2">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {site.pricing.show && <Pricing />}
      </Container>
    </section>
  );
}

function Pricing() {
  const { from, upTo, currency } = site.pricing;

  return (
    <div
      id="pricing"
      className="relative isolate mt-5 overflow-hidden rounded-[2rem] bg-linear-to-bl from-brand-500 via-brand-600 to-brand-900 p-5 shadow-2xl shadow-brand-950/50 sm:p-10 lg:mt-6 lg:p-12"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_70%_at_100%_0%,rgb(125_211_252/0.3),transparent_70%)]"
      />
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <Eyebrow tone="brand">الأسعار</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-snug text-white sm:text-4xl">
            أسعار نقل العفش في مصر
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-lg leading-relaxed text-blue-100">
            تبدأ الأسعار من {formatNumber(from)} {currency} وقد تتجاوز {formatNumber(upTo)} {currency} حسب
            حجم ونوع النقل والخدمة المطلوبة.
          </p>
        </div>

        <div className="min-w-0 rounded-3xl bg-white p-5 shadow-xl shadow-brand-950/30 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">تبدأ من</p>
              <p className="mt-1 font-display text-4xl font-extrabold text-slate-900 sm:text-5xl">
                {formatNumber(from)}
                <span className="ms-1.5 text-base font-bold text-slate-500">{currency}</span>
              </p>
            </div>
            <div className="text-end">
              <p className="text-sm font-medium text-slate-500">وقد تتجاوز</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-slate-400 sm:text-3xl">
                {formatNumber(upTo)}
                <span className="ms-1.5 text-sm font-bold">{currency}</span>
              </p>
            </div>
          </div>
          <div aria-hidden="true" className="mt-5 h-2.5 rounded-full bg-linear-to-l from-brand-600 via-sky-400 to-cyan-300" />

          <ul className="mt-6 space-y-3 text-[15px] text-slate-700">
            {["السعر النهائي يُحدَّد بعد المعاينة", "بدون أي مصاريف مخفية", "لا دفع قبل المعاينة"].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CircleCheck className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <a
            href={whatsappHref("مرحبًا NA2LAX، أريد عرض سعر لنقل عفش.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClasses({ variant: "whatsapp", block: true })} mt-7`}
          >
            <WhatsAppIcon className="size-5" />
            اطلب عرض سعر عبر واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
