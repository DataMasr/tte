import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { servicePages, type ServicePage } from "@/config/services";
import { WinchIcon } from "@/components/icons";
import { ServiceIcon } from "@/components/service-icon";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const bySlug = (slug: string) => servicePages.find((service) => service.slug === slug)!;
const href = (service: ServicePage) => `/services/${service.slug}`;

export function Services() {
  const homeMoving = bySlug("home-moving");
  const winch = bySlug("winch");
  const assembly = bySlug("assembly");
  const packing = bySlug("packing");
  const more = [bySlug("office-moving"), bySlug("intercity")];

  return (
    <section id="services" className="py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="خدماتنا"
          title="خدمات نقل العفش والأثاث"
          description="خدمة متكاملة من الفك والتغليف حتى التركيب في مكانك الجديد."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-3">
          <PhotoCard service={homeMoving} className="sm:col-span-2" />

          <Link
            href={href(winch)}
            className="group relative isolate flex flex-col justify-end overflow-hidden rounded-3xl bg-linear-to-br from-brand-500 via-brand-600 to-brand-800 p-6 text-white shadow-xl shadow-brand-600/20 transition hover:shadow-2xl hover:shadow-brand-600/30 sm:min-h-72 sm:p-8"
          >
            <WinchIcon
              aria-hidden="true"
              className="absolute -top-6 -end-6 -z-10 size-48 text-white/10"
              strokeWidth={1.25}
            />
            <ServiceIcon name={winch.icon} tone="glass" />
            <p className="mt-6 font-display text-6xl font-extrabold leading-none">
              25
              <span className="ms-2 text-xl font-bold text-blue-100">دور</span>
            </p>
            <h3 className="mt-4 font-display text-xl font-bold">{winch.cardTitle}</h3>
            <p className="mt-2 leading-relaxed text-blue-100">{winch.cardText}</p>
            <MoreLink tone="light" />
          </Link>

          <Link
            href={href(assembly)}
            className="group flex flex-col justify-end rounded-3xl bg-slate-50 p-6 ring-1 ring-inset ring-slate-200/80 transition hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 sm:min-h-72 sm:p-8"
          >
            <ServiceIcon name={assembly.icon} tone="brand" />
            <h3 className="mt-6 font-display text-xl font-bold text-slate-900">{assembly.cardTitle}</h3>
            <p className="mt-2 leading-relaxed text-slate-600">{assembly.cardText}</p>
            <MoreLink />
          </Link>

          <PhotoCard service={packing} className="sm:col-span-2" />
        </div>

        <ul className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5">
          {more.map((service) => (
            <li key={service.slug}>
              <Link
                href={href(service)}
                className="group flex h-full items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200/80 transition hover:shadow-xl hover:shadow-slate-900/5 hover:ring-brand-200 sm:p-6"
              >
                <ServiceIcon name={service.icon} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold text-slate-900 group-hover:text-brand-700">
                    {service.cardTitle}
                  </span>
                  <span className="mt-1 block text-slate-600">{service.cardText}</span>
                </span>
                <ArrowLeft
                  className="size-5 shrink-0 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function MoreLink({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span
      className={cn(
        "mt-5 inline-flex items-center gap-1.5 text-sm font-bold",
        tone === "light" ? "text-white" : "text-brand-700",
      )}
    >
      اعرف المزيد
      <ArrowLeft className="size-4 transition group-hover:-translate-x-1" aria-hidden="true" />
    </span>
  );
}

function PhotoCard({ service, className }: { service: ServicePage; className?: string }) {
  return (
    <Link
      href={href(service)}
      className={cn(
        "group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl bg-ink-900 p-6 sm:min-h-80 sm:p-8 lg:min-h-[22rem]",
        className,
      )}
    >
      {service.image && (
        <Image
          src={service.image.src}
          alt={service.image.alt}
          fill
          sizes="(min-width: 1280px) 820px, (min-width: 1024px) 66vw, 100vw"
          className="-z-20 object-cover transition duration-700 ease-out group-hover:scale-105"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950 via-ink-950/60 to-ink-950/0"
      />
      <ServiceIcon name={service.icon} tone="glass" />
      <h3 className="mt-5 font-display text-2xl font-bold text-white">{service.cardTitle}</h3>
      <p className="mt-2 max-w-md leading-relaxed text-slate-200">{service.cardText}</p>
      <MoreLink tone="light" />
    </Link>
  );
}
