import { site } from "@/config/site";
import { normalizeEgyptianMobile } from "./phone";

export function telHref(tel: string = site.contact.phone.tel) {
  return `tel:${tel}`;
}

export function whatsappHref(message: string = site.contact.whatsappGreeting) {
  return `https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/** رابط الحجز: نفس الصفحة لو فيها نموذج الحجز، وإلا الصفحة الرئيسية */
export function bookingHref(pathname: string) {
  return pathname === "/" || /^\/(services|areas)\/[^/]+\/?$/.test(pathname) ? "#booking" : "/#booking";
}

/** رابط واتساب لمراسلة عميل على رقمه المصري */
export function customerWhatsappHref(phone: string, message: string) {
  const mobile = normalizeEgyptianMobile(phone);
  if (!mobile) return null;
  return `https://wa.me/20${mobile.slice(1)}?text=${encodeURIComponent(message)}`;
}
