import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleHelp } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { OrderTracker } from "@/components/order-tracker";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { whatsappHref } from "@/lib/contact";
import { breadcrumbNode, webPageNode, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const title = "تتبع طلب نقل العفش";
const description = "اعرف حالة طلب نقل العفش الخاص بك في أي وقت باستخدام رقم الطلب الموجود في رسالة التأكيد.";
const crumbs: Crumb[] = [
  { name: "الرئيسية", path: "/" },
  { name: "تتبع طلبك", path: "/track" },
];

export const metadata: Metadata = pageMetadata({ title, description, path: "/track" });

export default function TrackPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ path: "/track", name: title, description, breadcrumb: true }),
          breadcrumbNode("/track", crumbs),
        ]}
      />
      <PageHero
        overlap
        breadcrumbs={crumbs}
        title="تتبع طلبك"
        description="اكتب رقم الطلب الموجود في رسالة التأكيد لمعرفة حالته."
      />
      <section className="relative z-10 -mt-20 pb-20 sm:pb-28">
        <Container className="max-w-2xl">
          <Suspense
            fallback={<div className="h-44 animate-pulse rounded-[2rem] bg-white shadow-xl ring-1 ring-slate-200/70" />}
          >
            <OrderTracker />
          </Suspense>

          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-200/80">
            <CircleHelp className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
            <p>
              رقم الطلب يظهر لك بعد الحجز مباشرة، ويبدأ بـ <span dir="ltr" className="font-mono font-semibold">NQ-</span>.
              لو لم تجده،{" "}
              <a
                href={whatsappHref("مرحبًا NA2LAX، أريد معرفة حالة طلبي ولا أجد رقم الطلب.")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-700 underline-offset-4 hover:underline"
              >
                تواصل معنا عبر واتساب
              </a>{" "}
              وسنساعدك.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
