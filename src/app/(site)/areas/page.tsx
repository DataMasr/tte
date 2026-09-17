import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { areaGroups, areaPages } from "@/config/areas";
import { JsonLd } from "@/components/json-ld";
import { HeroActions } from "@/components/landing-blocks";
import { PageHero } from "@/components/page-hero";
import { FinalCta } from "@/components/sections/final-cta";
import { Container } from "@/components/ui/container";
import { breadcrumbNode, webPageNode, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const title = "مناطق خدمة نقل العفش في مصر";
const description =
  "نقل عفش في القاهرة والجيزة والتجمع ومدينة نصر والمعادي والشيخ زايد و6 أكتوبر والعاصمة الإدارية والإسكندرية والساحل الشمالي وكل المحافظات.";
const crumbs: Crumb[] = [
  { name: "الرئيسية", path: "/" },
  { name: "المناطق", path: "/areas" },
];

export const metadata: Metadata = pageMetadata({ title, description, path: "/areas" });

export default function AreasPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ path: "/areas", name: title, description, breadcrumb: true }),
          breadcrumbNode("/areas", crumbs),
        ]}
      />
      <PageHero breadcrumbs={crumbs} eyebrow="نخدم كل المحافظات" title={title} description={description}>
        <HeroActions message="مرحبًا NA2LAX، أريد نقل عفش وأود معرفة هل تغطون منطقتي." />
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container className="space-y-14">
          {areaGroups.map((group) => (
            <div key={group.id}>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">{group.label}</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areaPages
                  .filter((area) => area.group === group.id)
                  .map((area) => (
                    <li key={area.slug}>
                      <Link
                        href={`/areas/${area.slug}`}
                        className="group flex h-full flex-col rounded-3xl bg-white p-5 ring-1 ring-slate-200/80 transition hover:shadow-xl hover:shadow-slate-900/5 hover:ring-brand-200 sm:p-6"
                      >
                        <span className="flex items-center gap-2 font-display text-lg font-bold text-slate-900 group-hover:text-brand-700">
                          <MapPin className="size-5 text-brand-600" aria-hidden="true" />
                          نقل عفش {area.name}
                        </span>
                        <span className="mt-2 line-clamp-2 flex-1 leading-relaxed text-slate-600">
                          {area.neighborhoods.slice(0, 5).join(" • ")}
                        </span>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                          التفاصيل والحجز
                          <ArrowLeft className="size-4 transition group-hover:-translate-x-1" aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <p className="rounded-3xl bg-slate-50 p-6 text-center leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-200/80">
            منطقتك غير موجودة؟ نغطي كل محافظات مصر، ومنها الدلتا والصعيد والقناة. تواصل معنا واحجز معاينتك.
          </p>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
