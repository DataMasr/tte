import { JsonLd } from "@/components/json-ld";
import { ContactShortcuts } from "@/components/layout/contact-shortcuts";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { OfferPopup } from "@/components/offer-popup";
import { organizationNode, websiteNode } from "@/lib/schema";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd nodes={[organizationNode(), websiteNode()]} />
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-white font-bold text-slate-900 focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:px-4 focus:py-2"
      >
        تخطَّ إلى المحتوى
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ContactShortcuts />
      <OfferPopup />
    </>
  );
}
