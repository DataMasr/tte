import Link from "next/link";
import { Clock, Headset, Mail, PackageSearch, Phone } from "lucide-react";
import { areaPages } from "@/config/areas";
import { servicePages } from "@/config/services";
import { site } from "@/config/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { telHref, whatsappHref } from "@/lib/contact";

const contactLinks = [
  { icon: Phone, label: site.contact.phone.display, href: telHref() },
  { icon: WhatsAppIcon, label: site.contact.whatsapp.display, href: whatsappHref(), external: true },
  { icon: Headset, label: `${site.contact.emergency.display} (طوارئ)`, href: telHref(site.contact.emergency.tel) },
  { icon: Mail, label: site.contact.email, href: `mailto:${site.contact.email}` },
];

const socialLinks = [
  { icon: FacebookIcon, label: "فيسبوك", href: site.social.facebook },
  { icon: InstagramIcon, label: "انستجرام", href: site.social.instagram },
  { icon: WhatsAppIcon, label: "واتساب", href: whatsappHref() },
];

const footerAreas = ["new-cairo", "nasr-city", "maadi", "heliopolis", "sheikh-zayed", "october", "new-capital", "alexandria"]
  .map((slug) => areaPages.find((area) => area.slug === slug))
  .filter((area) => area !== undefined);

const linkClass = "transition hover:text-white";

export function Footer() {
  return (
    <footer className="bg-ink-950 pb-24 text-[15px] text-slate-400 md:pb-0">
      <Container className="py-14 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-2 lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs leading-relaxed">{site.tagline}.</p>
            <ul className="mt-6 flex gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full bg-white/5 text-slate-300 ring-1 ring-inset ring-white/10 transition hover:bg-brand-600 hover:text-white hover:ring-brand-600"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/track" className={`${buttonClasses({ variant: "glass", size: "sm" })} mt-6`}>
              <PackageSearch className="size-[18px] text-sky-300" aria-hidden="true" />
              تتبع طلبك
            </Link>
          </div>

          <div className="min-w-0 lg:col-span-2">
            <h2 className="font-display text-sm font-bold text-white">خدماتنا</h2>
            <ul className="mt-4 space-y-3">
              {servicePages.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className={linkClass}>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-3">
            <h2 className="font-display text-sm font-bold text-white">مناطق الخدمة</h2>
            <ul className="mt-4 space-y-3">
              {footerAreas.map((area) => (
                <li key={area.slug}>
                  <Link href={`/areas/${area.slug}`} className={linkClass}>
                    نقل عفش {area.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/areas" className="font-semibold text-sky-300 transition hover:text-sky-200">
                  كل المناطق
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 min-w-0 lg:col-span-3">
            <h2 className="font-display text-sm font-bold text-white">تواصل معنا</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {contactLinks.map(({ icon: Icon, label, href, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex items-center gap-2.5 transition hover:text-white"
                  >
                    <Icon className="size-4 shrink-0 text-sky-400" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-sky-400" aria-hidden="true" />
                {site.contact.hours}
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-slate-500">{site.address.street}، القاهرة</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} | {site.nameAr}. جميع الحقوق محفوظة.
          </p>
          <Link href="/admin" className="text-slate-500 transition hover:text-slate-300">
            دخول الإدارة
          </Link>
        </div>
      </Container>
    </footer>
  );
}
