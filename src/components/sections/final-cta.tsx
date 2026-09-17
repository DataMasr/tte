import { Phone } from "lucide-react";
import { site } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { telHref, whatsappHref } from "@/lib/contact";

export function FinalCta() {
  return (
    <section className="bg-white pb-20 sm:pb-24">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-12 text-center sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:py-14 lg:text-start">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_90%_at_0%_0%,rgb(30_91_241/0.5),transparent_70%),radial-gradient(ellipse_45%_80%_at_100%_100%,rgb(14_165_233/0.18),transparent_70%)]"
          />
          <div>
            <h2 className="text-balance font-display text-3xl font-extrabold leading-snug text-white sm:text-4xl">
              جاهز للنقل؟
            </h2>
            <p className="mt-3 text-lg text-slate-300">
              تواصل معنا الآن — فريقنا متاح {site.contact.hours} للرد عليك.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:mt-0 lg:shrink-0">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "whatsapp", size: "lg" })}
            >
              <WhatsAppIcon className="size-5" />
              واتساب
            </a>
            <a href={telHref()} className={buttonClasses({ variant: "white", size: "lg" })}>
              <Phone className="size-5" aria-hidden="true" />
              {site.contact.phone.display}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
