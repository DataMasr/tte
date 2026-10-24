import type { NextConfig } from "next";

/**
 * الموقع يُنشر كملفات static على GitHub Pages (الدومين na2lax.com).
 * GitHub Pages لا يشغّل سيرفر، لذلك:
 * - output: "export" يُخرج الموقع في مجلد out
 * - trailingSlash: كل صفحة تصبح /page/index.html (الشكل الأنسب لـ GitHub Pages)
 * - الصور تُعرض كما هي (ملفات webp مضغوطة بالفعل)
 * - التحويلات من روابط الموقع القديم موجودة كصفحات HTML في مجلد public
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: "/api/whatsapp/:path*",
        destination: "http://167.235.10.203:5050/api/whatsapp/:path*",
      },
    ];
  },
};

export default nextConfig;
