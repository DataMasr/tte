import { Clock, Headset, Mail, Phone } from "lucide-react";
import { site } from "@/config/site";
import { BookingForm } from "@/components/booking-form";
import { WhatsAppIcon } from "@/components/icons";
import { TrackShortcut } from "@/components/track-shortcut";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { telHref, whatsappHref } from "@/lib/contact";
import type { ServiceColumn } from "@/lib/orders";
import { cn } from "@/lib/utils";

const channels = [
  {
    label: "واتساب",
    value: site.contact.whatsapp.display,
    href: whatsappHref(),
    icon: WhatsAppIcon,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    external: true,
  },
  {
    label: "اتصال مباشر",
    value: site.contact.phone.display,
    href: telHref(),
    icon: Phone,
    tone: "bg-brand-50 text-brand-600 ring-brand-100",
  },
  {
    label: "خط الطوارئ",
    value: site.contact.emergency.display,
    href: telHref(site.contact.emergency.tel),
    icon: Headset,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    label: "البريد الإلكتروني",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
    icon: Mail,
    tone: "bg-slate-100 text-slate-600 ring-slate-200",
  },
];

export function Booking({
  title = "احجز نقل عفشك الآن",
  description = "اترك بياناتك وسنتواصل معك لتأكيد الموعد والمعاينة.",
  defaultServices,
  areaHint,
}: {
  title?: string;
  description?: string;
  defaultServices?: ServiceColumn[];
  areaHint?: string;
}) {
  return (
    <section id="booking" className="bg-slate-50 py-20 sm:py-24 lg:py-28">
      <Container className="grid gap-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-8">
        <SectionHeading
          align="start"
          className="lg:col-span-5"
          eyebrow="احجز الآن"
          title={title}
          description={description}
        />

        <div className="min-w-0 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 sm:p-8 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:p-10">
          <BookingForm defaultServices={defaultServices} areaHint={areaHint} />
        </div>

        <div className="min-w-0 lg:col-span-5 lg:row-start-2">
          <p className="font-display font-bold text-slate-900">تفضّل التواصل المباشر؟</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
            {channels.map(({ label, value, href, icon: Icon, tone, external }) => (
              <li key={label} className="min-w-0">
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80 transition hover:shadow-lg hover:shadow-slate-900/5 hover:ring-brand-200 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset sm:size-12", tone)}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-slate-500">{label}</span>
                    <span className="block truncate font-bold text-slate-900 transition group-hover:text-brand-700">
                      {value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <Clock className="size-4" aria-hidden="true" />
            متاحون {site.contact.hours}
          </p>
          <TrackShortcut className="mt-6" />
        </div>
      </Container>
    </section>
  );
}
