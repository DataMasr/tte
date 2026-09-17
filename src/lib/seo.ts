import type { Metadata } from "next";
import { site } from "@/config/site";

/**
 * مسار الصفحة بالشكل النهائي على GitHub Pages: /services/winch/ (مع / في النهاية).
 * الملفات (مثل /og-image.jpg) والروابط الداخلية (#) تبقى كما هي.
 */
export function pagePath(path: string) {
  const index = path.search(/[?#]/);
  const base = index === -1 ? path : path.slice(0, index);
  const suffix = index === -1 ? "" : path.slice(index);
  if (base.endsWith("/") || /\.[a-z0-9]+$/i.test(base)) return path;
  return `${base}/${suffix}`;
}

export function absoluteUrl(path = "/") {
  return new URL(pagePath(path), site.url).toString();
}

/** صورة المعاينة عند مشاركة أي رابط من الموقع (واتساب، فيسبوك...) */
export const shareImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "ونش رفع أثاث هيدروليكي من NA2LAX يرفع قطعة أثاث إلى دور مرتفع",
};

/** metadata كاملة لصفحة: العنوان والوصف والرابط الأساسي ومعاينة المشاركة */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  /** true لو العنوان يحتوي على اسم الشركة بالفعل */
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: pagePath(path) },
    openGraph: {
      type: "website",
      locale: "ar_EG",
      siteName: `${site.name} | ${site.nameAr}`,
      url: pagePath(path),
      title: fullTitle,
      description,
      images: [shareImage],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [shareImage] },
  };
}
