import { ChevronDown } from "lucide-react";
import { faqs as defaultFaqs, type Faq as FaqItem } from "@/config/site";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function Faq({
  items = defaultFaqs,
  title = "أسئلة شائعة عن نقل العفش",
  description = "أهم الإجابات باختصار، وإن لم تجد إجابتك تواصل معنا مباشرة.",
}: {
  items?: FaqItem[];
  title?: string;
  description?: string;
}) {
  return (
    <section id="faq" className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="الأسئلة الشائعة" title={title} description={description} />

        <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          {items.map((faq, index) => (
            <details key={faq.q} name="faq" open={index === 0} className="group px-5 sm:px-7">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-base font-bold text-slate-900 transition hover:text-brand-700 sm:text-lg [&::-webkit-details-marker]:hidden">
                <h3>{faq.q}</h3>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition duration-300 group-open:rotate-180 group-open:bg-brand-600 group-open:text-white">
                  <ChevronDown className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="pb-6 leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
