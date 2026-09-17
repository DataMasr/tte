import Link from "next/link";
import { ArrowLeft, Clock, ReceiptText, ShieldCheck, UsersRound } from "lucide-react";
import { features } from "@/config/site";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const icons = { shield: ShieldCheck, receipt: ReceiptText, users: UsersRound, clock: Clock };

export function WhyUs() {
  return (
    <section id="why-us" className="bg-slate-50 py-20 sm:py-24 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="text-center lg:col-span-4 lg:text-start">
          <SectionHeading
            align="start"
            className="mx-auto lg:mx-0"
            eyebrow="لماذا نحن؟"
            title="لماذا تختار NA2LAX لنقل عفشك؟"
            description="نتعامل مع كل قطعة في بيتك كأنها ملكنا، من أول مكالمة حتى آخر مسمار."
          />
          <Link href="/#booking" className={`${buttonClasses()} mt-8`}>
            احجز معاينة
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {features.map((feature) => {
            const Icon = icons[feature.icon];
            return (
              <li
                key={feature.title}
                className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition duration-300 hover:shadow-xl hover:shadow-slate-900/5 motion-safe:hover:-translate-y-1 sm:block sm:p-7"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 sm:mt-5">{feature.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-slate-600 sm:mt-2">{feature.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
