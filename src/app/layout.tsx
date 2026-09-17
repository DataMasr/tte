import type { Metadata, Viewport } from "next";
import { Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import { site } from "@/config/site";
import { shareImage } from "@/lib/seo";
import "./globals.css";

const display = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: `%s | ${site.name}` },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  applicationName: site.name,
  category: "نقل عفش",
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: `${site.name} | ${site.nameAr}`,
    title: site.seo.title,
    description: site.seo.description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: [shareImage],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
  ...(site.seo.googleVerification ? { verification: { google: site.seo.googleVerification } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#070d1c",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: إضافات المتصفح (مثل محافظ الكريبتو) تضيف attributes على html و body
    // قبل تحميل React، فيظهر تحذير hydration غير حقيقي. التأثير على هذين العنصرين فقط وليس على المحتوى.
    <html
      lang="ar-EG"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
