import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { servicePages } from "@/config/services";
import { JsonLd } from "@/components/json-ld";
import { HeroActions } from "@/components/landing-blocks";
import { PageHero } from "@/components/page-hero";
import { FinalCta } from "@/components/sections/final-cta";
import { ServiceIcon } from "@/components/service-icon";
import { Container } from "@/components/ui/container";
import { breadcrumbNode, webPageNode, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const title = "خدمات نقل العفش في مصر";
const description =
  "كل خدمات نقل العفش في مكان واحد: نقل بسيارات مغلقة، ونش رفع حتى الدور 25، تغليف، فك وتركيب، نقل مكاتب، ونقل بين المحافظات.";
const crumbs: Crumb[] = [
  { name: "الرئيسية", path: "/" },
  { name: "الخدمات", path: "/services" },
];

export const metadata: Metadata = pageMetadata({ title, description, path: "/services" });

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ path: "/services", name: title, description, breadcrumb: true }),
          breadcrumbNode("/services", crumbs),
        ]}
      />
      <PageHero breadcrumbs={crumbs} eyebrow="متاحون 24 ساعة" title={title} description={description}>
        <HeroActions message="مرحبًا NA2LAX، أريد الاستفسار عن خدمات نقل العفش." />
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicePages.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-slate-200/80 transition hover:shadow-xl hover:shadow-slate-900/5 hover:ring-brand-200 sm:p-7"
                >
                  <ServiceIcon name={service.icon} />
                  <h2 className="mt-5 font-display text-xl font-bold text-slate-900 group-hover:text-brand-700">
                    {service.name}
                  </h2>
                  <p className="mt-2 flex-1 leading-relaxed text-slate-600">{service.cardText}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                    تفاصيل الخدمة
                    <ArrowLeft className="size-4 transition group-hover:-translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
