import { serviceOptions, site } from "@/config/site";
import { formatDate, formatNumber } from "./format";
import { orderPrice, orderServices, orderSize, type Order } from "./orders";

function csvCell(value: unknown) {
  let text = String(value ?? "").replace(/"/g, '""');
  // منع تنفيذ الصيغ عند فتح الملف في Excel
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text}"`;
}

export function exportOrdersCsv(orders: Order[]) {
  const headers = [
    "رقم الطلب",
    "العميل",
    "الموبايل",
    "من",
    "إلى",
    "حجم النقل",
    ...serviceOptions.map((option) => option.label),
    "تاريخ النقل",
    "القيمة (جنيه)",
    "الحالة",
    "تاريخ الطلب",
    "ملاحظات",
  ];

  const rows = orders.map((order) => {
    const services = orderServices(order);
    return [
      order.booking_code,
      order.client_name,
      order.phone,
      order.from_area,
      order.to_area,
      orderSize(order) ?? "",
      ...serviceOptions.map((option) => (services.includes(option.column) ? "نعم" : "لا")),
      order.move_date ?? "",
      orderPrice(order),
      order.status,
      order.created_at ? formatDate(order.created_at, true) : "",
      order.notes ?? "",
    ].map(csvCell);
  });

  const csv = "﻿" + [headers.map(csvCell), ...rows].map((row) => row.join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `na2lax-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function printOrder(order: Order) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  const services = orderServices(order);
  const serviceText =
    serviceOptions
      .filter((option) => services.includes(option.column))
      .map((option) => option.label)
      .join(" • ") || "نقل فقط";
  const price = orderPrice(order);

  const rows: Array<[string, string]> = [
    ["العميل", order.client_name],
    ["الموبايل", order.phone],
    ["من", order.from_area],
    ["إلى", order.to_area],
    ["حجم النقل", orderSize(order) ?? "غير محدد"],
    ["تاريخ النقل", formatDate(order.move_date)],
    ["الخدمات", serviceText],
    ["القيمة المتفق عليها", price ? `${formatNumber(price)} جنيه` : "تُحدد بعد المعاينة"],
    ["الحالة", order.status],
    ["ملاحظات", order.notes || "—"],
  ];

  win.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>أمر تشغيل ${escapeHtml(order.booking_code)}</title>
<style>
  body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; color: #0f172a; margin: 40px; }
  header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; }
  h1 { margin: 0; font-size: 22px; }
  .muted { color: #475569; font-size: 13px; margin-top: 4px; }
  .code { border: 2px dashed #0f172a; padding: 8px 14px; font-weight: 700; font-size: 18px; direction: ltr; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: right; vertical-align: top; }
  th { background: #f1f5f9; width: 28%; }
  footer { display: flex; justify-content: space-between; margin-top: 64px; gap: 24px; }
  footer div { flex: 1; border-top: 1px solid #0f172a; padding-top: 8px; text-align: center; font-size: 13px; }
</style>
</head>
<body>
<header>
  <div>
    <h1>${escapeHtml(site.name)} | ${escapeHtml(site.nameAr)} — أمر تشغيل</h1>
    <div class="muted">هاتف: ${escapeHtml(site.contact.phone.display)} • واتساب: ${escapeHtml(site.contact.whatsapp.display)}</div>
  </div>
  <div class="code">${escapeHtml(order.booking_code)}</div>
</header>
<table>
  ${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}
</table>
<footer>
  <div>مسؤول التشغيل</div>
  <div>مشرف الفريق</div>
  <div>توقيع العميل بالاستلام</div>
</footer>
<script>window.onload = function () { window.print(); };</script>
</body>
</html>`);
  win.document.close();
}
