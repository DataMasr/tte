import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areaPages, getAreaPage } from "@/config/areas";
import { servicePages } from "@/config/services";
import { priceFaq } from "@/config/site";
import { JsonLd } from "@/components/json-ld";
import { ChipList, HeroActions, PriceNote, RelatedLinks, TipList } from "@/components/landing-blocks";
import { PageHero } from "@/components/page-hero";
import { Booking } from "@/components/sections/booking";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { ServiceIcon } from "@/components/service-icon";
import { Container } from "@/components/ui/container";
import { breadcrumbNode, faqNode, serviceNode, webPageNode, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return areaPages.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata(props: PageProps<"/areas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const area = getAreaPage(slug);
  if (!area) return {};
  return pageMetadata({ title: area.title, description: area.description, path: `/areas/${slug}` });
}

export default async function AreaPage(props: PageProps<"/areas/[slug]">) {
  const { slug } = await props.params;
  const area = getAreaPage(slug);
  if (!area) notFound();

  const path = `/areas/${area.slug}`;
  const crumbs: Crumb[] = [
    { name: "الرئيسية", path: "/" },
    { name: "المناطق", path: "/areas" },
    { name: `نقل عفش ${area.name}`, path },
  ];
  const faqs = [...area.faqs, priceFaq(`نقل العفش في ${area.name}`)];
  const nearby = area.nearby
    .map((nearbySlug) => areaPages.find((item) => item.slug === nearbySlug))
    .filter((item) => item !== undefined);

  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ path, name: area.title, description: area.description, breadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: area.h1, description: area.description, areaName: area.name }),
          faqNode(path, faqs),
        ]}
      />

      <PageHero breadcrumbs={crumbs} eyebrow={`متاحون 24 ساعة في ${area.name}`} title={area.h1} description={area.intro}>
        <HeroActions message={`مرحبًا NA2LAX، أريد نقل عفش في ${area.name}.`} />
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <h2 className="font-display text-3xl font-extrabold text-slate-900">خدماتنا في {area.name}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {servicePages.slice(0, 4).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex h-full items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80 transition hover:shadow-lg hover:shadow-slate-900/5 hover:ring-brand-200"
                  >
                    <ServiceIcon name={service.icon} />
                    <span className="min-w-0">
                      <span className="block font-bold text-slate-900 group-hover:text-brand-700">{service.cardTitle}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-slate-600">{service.cardText}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-2xl font-extrabold text-slate-900">
              المناطق التي نغطيها في {area.name}
            </h2>
            <div className="mt-5">
              <ChipList items={area.neighborhoods} />
            </div>
          </div>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:col-span-5">
            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-inset ring-slate-200/80">
              <h2 className="font-display text-xl font-extrabold text-slate-900">نصائح قبل النقل في {area.name}</h2>
              <TipList items={area.tips} />
            </div>
            <PriceNote />
          </aside>
        </Container>
      </section>

      <Booking title={`احجز نقل عفشك في ${area.name}`} areaHint={area.name} />
      <Faq items={faqs} title={`أسئلة شائعة عن نقل العفش في ${area.name}`} />
      <RelatedLinks
        groups={[
          {
            title: "مناطق قريبة",
            links: nearby.map((item) => ({
              href: `/areas/${item.slug}`,
              label: `نقل عفش ${item.name}`,
              hint: item.neighborhoods.slice(0, 3).join(" • "),
            })),
          },
          {
            title: "كل خدماتنا",
            links: servicePages.map((service) => ({
              href: `/services/${service.slug}`,
              label: service.name,
              hint: service.cardText,
            })),
          },
        ]}
      />
      <FinalCta />
    </>
  );
}
