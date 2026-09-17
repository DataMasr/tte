import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { areaPages } from "@/config/areas";
import { getServicePage, servicePages } from "@/config/services";
import { priceFaq, steps } from "@/config/site";
import { JsonLd } from "@/components/json-ld";
import { CheckList, HeroActions, PriceNote, RelatedLinks } from "@/components/landing-blocks";
import { PageHero } from "@/components/page-hero";
import { Booking } from "@/components/sections/booking";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Container } from "@/components/ui/container";
import { breadcrumbNode, faqNode, serviceNode, webPageNode, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getServicePage(slug);
  if (!service) return {};
  return pageMetadata({ title: service.title, description: service.description, path: `/services/${slug}` });
}

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const service = getServicePage(slug);
  if (!service) notFound();

  const path = `/services/${service.slug}`;
  const crumbs: Crumb[] = [
    { name: "الرئيسية", path: "/" },
    { name: "الخدمات", path: "/services" },
    { name: service.name, path },
  ];
  const faqs = [...service.faqs, priceFaq(service.name)];
  const otherServices = servicePages.filter((item) => item.slug !== service.slug);

  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ path, name: service.title, description: service.description, breadcrumb: true }),
          breadcrumbNode(path, crumbs),
          serviceNode({ path, name: service.h1, description: service.description }),
          faqNode(path, faqs),
        ]}
      />

      <PageHero breadcrumbs={crumbs} eyebrow="متاحون 24 ساعة • كل المحافظات" title={service.h1} description={service.intro}>
        <HeroActions message={`مرحبًا NA2LAX، أريد الاستفسار عن خدمة ${service.name}.`} />
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-extrabold text-slate-900">ماذا تشمل الخدمة؟</h2>
            <CheckList items={service.highlights} className="mt-6" />
            <PriceNote className="mt-6" />
          </div>

          {service.image ? (
            <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 lg:sticky lg:top-28">
              <Image
                src={service.image.src}
                alt={service.image.alt}
                width={1024}
                height={572}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/3] h-auto w-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-[2rem] bg-ink-950 p-6 text-white sm:p-8 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl font-extrabold">كيف نبدأ؟</h2>
              <ol className="mt-6 space-y-5">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 font-display font-bold">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block font-bold">{step.title}</span>
                      <span className="mt-1 block leading-relaxed text-slate-400">{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Container>
      </section>

      <Booking
        title={`احجز ${service.name}`}
        description="اترك بياناتك وسنتواصل معك لتأكيد التفاصيل والموعد."
        defaultServices={service.preselect}
      />
      <Faq items={faqs} title={`أسئلة شائعة عن ${service.name}`} />
      <RelatedLinks
        groups={[
          {
            title: "خدمات أخرى",
            links: otherServices.map((item) => ({
              href: `/services/${item.slug}`,
              label: item.name,
              hint: item.cardText,
            })),
          },
          {
            title: "نخدمك في كل المناطق",
            links: areaPages.slice(0, 9).map((area) => ({ href: `/areas/${area.slug}`, label: `نقل عفش ${area.name}` })),
          },
        ]}
      />
      <FinalCta />
    </>
  );
}
