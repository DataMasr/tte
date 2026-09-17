import { areaPages } from "@/config/areas";
import { servicePages } from "@/config/services";
import { site, type Faq } from "@/config/site";
import { absoluteUrl } from "./seo";

/**
 * بيانات منظمة (schema.org) تساعد جوجل على فهم الشركة والخدمات والمناطق.
 * اختبرها على: https://search.google.com/test/rich-results
 */

type Node = Record<string, unknown>;
export type Crumb = { name: string; path: string };

const ORG_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

export function organizationNode(): Node {
  return {
    "@type": "MovingCompany",
    "@id": ORG_ID,
    name: site.name,
    alternateName: [site.nameAr, "نقلكس", `${site.name} | ${site.nameAr}`],
    description: site.seo.description,
    slogan: site.tagline,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/android-chrome-512x512.png"),
      width: 512,
      height: 512,
    },
    image: ["/assets/hero-lift.webp", "/assets/fleet.webp", "/assets/packing.webp"].map((path) =>
      absoluteUrl(path),
    ),
    telephone: site.contact.phone.tel,
    email: site.contact.email,
    ...(site.pricing.show && { priceRange: `EGP ${site.pricing.from.toLocaleString("en-US")}+` }),
    currenciesAccepted: "EGP",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: "EG",
    },
    areaServed: [
      { "@type": "Country", name: "مصر" },
      ...areaPages.map((area) => ({ "@type": "Place", name: area.name })),
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.contact.phone.tel,
        contactType: "customer service",
        areaServed: "EG",
        availableLanguage: ["ar"],
      },
      {
        "@type": "ContactPoint",
        telephone: `+${site.contact.whatsapp.number}`,
        contactType: "reservations",
        areaServed: "EG",
        availableLanguage: ["ar"],
      },
    ],
    sameAs: [site.social.facebook, site.social.instagram],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "خدمات نقل العفش",
      itemListElement: servicePages.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          url: absoluteUrl(`/services/${service.slug}`),
        },
      })),
    },
  };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: site.name,
    alternateName: site.nameAr,
    inLanguage: "ar-EG",
    publisher: { "@id": ORG_ID },
  };
}

export function webPageNode({
  path,
  name,
  description,
  breadcrumb = false,
}: {
  path: string;
  name: string;
  description: string;
  breadcrumb?: boolean;
}): Node {
  const url = absoluteUrl(path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "ar-EG",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    ...(breadcrumb && { breadcrumb: { "@id": `${url}#breadcrumb` } }),
  };
}

export function breadcrumbNode(path: string, items: Crumb[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqNode(path: string, faqs: Faq[]): Node {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function serviceNode({
  path,
  name,
  description,
  areaName,
}: {
  path: string;
  name: string;
  description: string;
  areaName?: string;
}): Node {
  const url = absoluteUrl(path);
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    serviceType: "نقل عفش",
    description,
    url,
    provider: { "@id": ORG_ID },
    areaServed: areaName ? { "@type": "Place", name: areaName } : { "@type": "Country", name: "مصر" },
    ...(site.pricing.show && {
      offers: {
        "@type": "Offer",
        priceCurrency: "EGP",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: site.pricing.from,
          priceCurrency: "EGP",
        },
      },
    }),
  };
}
