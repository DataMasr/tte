import type { OrderStatus } from "./orders";

export const statusStyles: Record<OrderStatus, { badge: string; dot: string }> = {
  جديد: { badge: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  "جاري التواصل": { badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  مؤكد: { badge: "bg-brand-50 text-brand-700 ring-brand-200", dot: "bg-brand-600" },
  مكتمل: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  ملغي: { badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
};

export function statusStyle(status: string) {
  return statusStyles[status as OrderStatus] ?? statusStyles["جديد"];
}
