import type { MetadataRoute } from "next";
import { areaPages } from "@/config/areas";
import { servicePages } from "@/config/services";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = site.updatedAt;

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: ["/assets/hero-lift.webp", "/assets/fleet.webp", "/assets/packing.webp"].map((path) =>
        absoluteUrl(path),
      ),
    },
    { url: absoluteUrl("/services"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...servicePages.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      ...(service.image && { images: [absoluteUrl(service.image.src)] }),
    })),
    { url: absoluteUrl("/areas"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    ...areaPages.map((area) => ({
      url: absoluteUrl(`/areas/${area.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/track"), lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
