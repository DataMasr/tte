import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { areaGroups, areaPages } from "@/config/areas";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function Areas() {
  return (
    <section id="areas" className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="مناطق الخدمة"
          title="نقل عفش في كل مناطق مصر"
          description="اختر منطقتك لمعرفة تفاصيل الخدمة فيها، أو احجز مباشرة من أي مكان."
        />

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {areaGroups.map((group) => (
            <div key={group.id} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-inset ring-slate-200/80 sm:p-6">
              <h3 className="font-display text-lg font-bold text-slate-900">{group.label}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {areaPages
                  .filter((area) => area.group === group.id)
                  .map((area) => (
                    <li key={area.slug}>
                      <Link
                        href={`/areas/${area.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-brand-600 hover:text-white hover:ring-brand-600"
                      >
                        <MapPin className="size-3.5" aria-hidden="true" />
                        نقل عفش {area.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/areas"
            className="group inline-flex items-center gap-2 font-bold text-brand-700 transition hover:text-brand-600"
          >
            كل مناطق الخدمة
            <ArrowLeft className="size-4 transition group-hover:-translate-x-1" aria-hidden="true" />
          </Link>
        </p>
      </Container>
    </section>
  );
}
