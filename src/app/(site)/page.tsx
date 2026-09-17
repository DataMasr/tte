import type { Metadata } from "next";
import { faqs, site } from "@/config/site";
import { JsonLd } from "@/components/json-ld";
import { Areas } from "@/components/sections/areas";
import { Booking } from "@/components/sections/booking";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Services } from "@/components/sections/services";
import { WhyUs } from "@/components/sections/why-us";
import { faqNode, webPageNode } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: site.seo.title,
  description: site.seo.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ path: "/", name: site.seo.title, description: site.seo.description }),
          faqNode("/", faqs),
        ]}
      />
      <Hero />
      <Services />
      <WhyUs />
      <HowItWorks />
      <Areas />
      <Booking />
      <Faq />
      <FinalCta />
    </>
  );
}
