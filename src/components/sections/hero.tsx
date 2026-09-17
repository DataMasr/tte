import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, PackageSearch, Phone } from "lucide-react";
import { site, stats } from "@/config/site";
import { DarkBackdrop } from "@/components/backdrop";
import { WhatsAppIcon, WinchIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink-950 pt-28 pb-32 sm:pt-32 lg:pt-40 lg:pb-40">
        <DarkBackdrop />
        <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="text-center lg:col-span-7 lg:text-start">
            <p className="inline-flex items-center gap-2.5 rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-200 ring-1 ring-inset ring-white/10">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              متاحون 24 ساعة • القاهرة وكل المحافظات
            </p>

            <h1 className="mt-6 font-display text-[1.95rem] font-extrabold leading-[1.35] text-white min-[400px]:text-[2.1rem] sm:text-5xl sm:leading-[1.25] xl:text-[3.5rem]">
              نقل عفش في مصر
              <span className="block bg-linear-to-l from-sky-300 via-blue-300 to-brand-400 bg-clip-text pb-2 text-transparent">
                بأمان وسرعة
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-slate-300 lg:mx-0">
              فك وتغليف ونقل بسيارات مغلقة، وونش رفع حتى الدور 25 — في القاهرة والجيزة وكل المحافظات، بفريق محترف
              وضمان على سلامة عفشك.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href={whatsappHref()}
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

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[15px] font-semibold lg:justify-start">
              <Link
                href="#booking"
                className="group inline-flex items-center gap-2 text-sky-300 transition hover:text-sky-200"
              >
                احجز معاينة من الموقع
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-slate-200 ring-1 ring-inset ring-white/15 transition hover:bg-white/10 hover:text-white"
              >
                <PackageSearch className="size-4 text-sky-300" aria-hidden="true" />
                تتبع طلبك
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:col-span-5 lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-12 -z-10 bg-[radial-gradient(closest-side,rgb(30_91_241/0.4),transparent)]"
            />
            <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40 ring-1 ring-white/15">
              <Image
                src="/assets/hero-lift.webp"
                alt="ونش رفع أثاث هيدروليكي يرفع قطعة أثاث مغلّفة إلى شرفة في دور مرتفع"
                width={1024}
                height={572}
                preload
                sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, (min-width: 640px) 576px, 100vw"
                className="aspect-[4/3] h-auto w-full object-cover object-[60%_50%] lg:aspect-[5/4]"
              />
            </div>
            <div className="absolute -bottom-6 start-4 flex items-center gap-3 rounded-2xl bg-white p-3 pe-5 shadow-xl shadow-black/20 ring-1 ring-slate-900/5 motion-safe:animate-float sm:start-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                <WinchIcon className="size-6" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">ونش رفع هيدروليكي</span>
                <span className="block text-xs text-slate-500">آمن حتى الدور 25</span>
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="أرقامنا" className="relative z-10 -mt-16">
        <Container>
          <dl className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "flex flex-col items-center px-3 py-6 text-center sm:py-8",
                  index % 2 === 1 && "border-s border-slate-100",
                  index >= 2 && "border-t border-slate-100 lg:border-t-0",
                  index === 2 && "lg:border-s",
                )}
              >
                <dt className="order-2 mt-1.5 text-sm text-slate-500">{stat.label}</dt>
                <dd dir="ltr" className="order-1 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </>
  );
}
