"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  ClipboardList,
  Download,
  Globe,
  Inbox,
  LockKeyhole,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { serviceOptions, site } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";
import { exportOrdersCsv, printOrder } from "@/lib/admin-export";
import { customerWhatsappHref } from "@/lib/contact";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { statusStyle } from "@/lib/order-status";
import {
  checkAdminAccess,
  createOrder,
  deleteOrder,
  listOrders,
  orderPrice,
  orderServices,
  orderSize,
  ORDER_STATUSES,
  updateOrder,
  updateOrderStatus,
  type Order,
  type OrderInput,
  type OrderStatus,
} from "@/lib/orders";
import { toLatinDigits } from "@/lib/phone";
import { getAdminClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { OrderDialog } from "./order-dialog";

type Filter = "all" | OrderStatus;
type LoadState = "loading" | "ready" | "error" | "denied";

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export function Dashboard({ email }: { email: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Order | "new" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await listOrders(getAdminClient()));
      setLoadError(null);
      setState("ready");
    } catch (error) {
      setLoadError(errorMessage(error));
      setState((current) => (current === "loading" ? "error" : current));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    (async () => {
      const access = await checkAdminAccess(getAdminClient());
      if (cancelled) return;
      if (access === "denied") {
        setState("denied");
        return;
      }
      await load();
      if (cancelled) return;
      // تحديث تلقائي كل 30 ثانية لإظهار الطلبات الجديدة
      timer = window.setInterval(() => {
        if (document.visibilityState === "visible") void load();
      }, 30_000);
    })();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>;
    let confirmedValue = 0;
    for (const order of orders) {
      if (order.status in byStatus) byStatus[order.status as OrderStatus] += 1;
      if (order.status === "مؤكد" || order.status === "مكتمل") confirmedValue += orderPrice(order);
    }
    return { byStatus, confirmedValue };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const search = toLatinDigits(query.trim().toLowerCase());
    return orders.filter(
      (order) =>
        (filter === "all" || order.status === filter) &&
        (!search ||
          [order.booking_code, order.client_name, order.phone, order.from_area, order.to_area].some((value) =>
            value?.toLowerCase().includes(search),
          )),
    );
  }, [orders, filter, query]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function changeStatus(order: Order, status: OrderStatus) {
    const previous = order.status;
    setOrders((list) => list.map((item) => (item.id === order.id ? { ...item, status } : item)));
    try {
      await updateOrderStatus(getAdminClient(), order.id, status);
    } catch (error) {
      setOrders((list) => list.map((item) => (item.id === order.id ? { ...item, status: previous } : item)));
      setNotice(`تعذّر تحديث الحالة: ${errorMessage(error)}`);
    }
  }

  async function remove(order: Order) {
    if (!window.confirm(`حذف الطلب ${order.booking_code} نهائيًا؟ لا يمكن التراجع عن هذه الخطوة.`)) return;
    try {
      await deleteOrder(getAdminClient(), order.id);
      setOrders((list) => list.filter((item) => item.id !== order.id));
      setNotice("تم حذف الطلب");
    } catch (error) {
      setNotice(`تعذّر حذف الطلب: ${errorMessage(error)}`);
    }
  }

  async function save(input: OrderInput, order: Order | null) {
    const client = getAdminClient();
    if (order) {
      await updateOrder(client, order.id, input);
    } else {
      const result = await createOrder(client, input);
      if (!result.ok) throw new Error(result.error);
    }
    await load();
    setEditing(null);
    setNotice(order ? "تم حفظ التعديلات" : "تمت إضافة الطلب");
  }

  const signOut = () => getAdminClient().auth.signOut();

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="bg-ink-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-sky-300 ring-1 ring-inset ring-white/15 sm:inline">
              لوحة الطلبات
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 md:inline" dir="ltr">
              {email}
            </span>
            <Link href="/" className={buttonClasses({ variant: "glass", size: "sm" })}>
              <Globe className="size-4" aria-hidden="true" />
              <span className="max-sm:sr-only">الموقع</span>
            </Link>
            <button type="button" onClick={signOut} className={buttonClasses({ variant: "glass", size: "sm" })}>
              <LogOut className="size-4" aria-hidden="true" />
              <span className="max-sm:sr-only">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {state === "denied" ? (
          <AccessDenied email={email} onSignOut={signOut} />
        ) : (
          <>
            <section aria-label="ملخص الطلبات" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Kpi icon={ClipboardList} label="إجمالي الطلبات" value={orders.length} tone="bg-slate-100 text-slate-600" />
              <Kpi icon={Inbox} label="طلبات جديدة" value={stats.byStatus["جديد"]} tone="bg-sky-50 text-sky-600" />
              <Kpi
                icon={Truck}
                label="قيد المتابعة"
                value={stats.byStatus["جاري التواصل"] + stats.byStatus["مؤكد"]}
                tone="bg-amber-50 text-amber-600"
              />
              <Kpi icon={CircleCheck} label="مكتملة" value={stats.byStatus["مكتمل"]} tone="bg-emerald-50 text-emerald-600" />
              <Kpi
                icon={Banknote}
                label="قيمة المؤكد والمكتمل"
                value={`${formatNumber(stats.confirmedValue)} جنيه`}
                tone="bg-brand-50 text-brand-600"
                className="col-span-2 lg:col-span-1"
              />
            </section>

            <section className="mt-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative lg:w-96">
                  <Search
                    className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ابحث: الاسم، الموبايل، رقم الطلب"
                    aria-label="بحث في الطلبات"
                    className="block h-12 w-full rounded-2xl border-0 bg-slate-50 ps-12 pe-4 text-base text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={refresh}
                    disabled={refreshing}
                    className={buttonClasses({ variant: "light", size: "sm" })}
                  >
                    <RefreshCw className={cn("size-4", refreshing && "animate-spin")} aria-hidden="true" />
                    تحديث
                  </button>
                  <button
                    type="button"
                    onClick={() => exportOrdersCsv(visibleOrders)}
                    disabled={!visibleOrders.length}
                    className={buttonClasses({ variant: "light", size: "sm" })}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Excel
                  </button>
                  <button type="button" onClick={() => setEditing("new")} className={buttonClasses({ size: "sm" })}>
                    <Plus className="size-4" aria-hidden="true" />
                    طلب جديد
                  </button>
                </div>
              </div>

              <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <div className="flex w-max gap-2 pb-1" role="group" aria-label="تصفية حسب الحالة">
                  {(["all", ...ORDER_STATUSES] as const).map((value) => {
                    const active = filter === value;
                    const count = value === "all" ? orders.length : stats.byStatus[value];
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-inset transition",
                          active
                            ? "bg-ink-950 text-white ring-ink-950"
                            : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                        )}
                      >
                        {value === "all" ? "الكل" : value}
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-xs",
                            active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {loadError && state !== "loading" && (
              <div
                role="alert"
                className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900 ring-1 ring-inset ring-amber-200"
              >
                <p className="flex items-center gap-2 text-sm font-medium">
                  <TriangleAlert className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
                  تعذّر تحميل الطلبات: {loadError}
                </p>
                <button type="button" onClick={refresh} className={buttonClasses({ variant: "light", size: "sm" })}>
                  إعادة المحاولة
                </button>
              </div>
            )}

            <section aria-label="الطلبات" className="mt-5">
              {state === "loading" ? (
                <div className="space-y-3" aria-hidden="true">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200/70" />
                  ))}
                </div>
              ) : visibleOrders.length === 0 ? (
                <EmptyState hasOrders={orders.length > 0} />
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 lg:block">
                    <table className="w-full text-start text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          {["الطلب", "العميل", "خط السير", "الخدمات", "القيمة", "الحالة"].map((heading) => (
                            <th key={heading} scope="col" className="px-4 py-3 text-start font-semibold">
                              {heading}
                            </th>
                          ))}
                          <th scope="col" className="px-4 py-3">
                            <span className="sr-only">إجراءات</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleOrders.map((order) => (
                          <tr key={order.id} className="align-top transition hover:bg-slate-50/60">
                            <td className="px-4 py-4">
                              <p dir="ltr" className="text-end font-mono font-bold text-slate-900">
                                {order.booking_code}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">{formatDateTime(order.created_at)}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-900">{order.client_name}</p>
                              <a href={`tel:${order.phone}`} className="mt-1 block text-slate-500 hover:text-brand-600">
                                {order.phone}
                              </a>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-medium text-slate-800">
                                {order.from_area} <span className="text-slate-400">←</span> {order.to_area}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                النقل: {formatDate(order.move_date)}
                                <FloorsText order={order} />
                              </p>
                            </td>
                            <td className="max-w-56 px-4 py-4">
                              <ServiceBadges order={order} />
                              {order.notes && (
                                <p className="mt-2 line-clamp-2 text-xs text-slate-500" title={order.notes}>
                                  {order.notes}
                                </p>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                              <PriceText order={order} />
                            </td>
                            <td className="px-4 py-4">
                              <StatusSelect order={order} onChange={changeStatus} />
                            </td>
                            <td className="px-4 py-4">
                              <OrderActions order={order} onEdit={() => setEditing(order)} onDelete={() => remove(order)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ul className="grid gap-3 md:grid-cols-2 lg:hidden">
                    {visibleOrders.map((order) => (
                      <li key={order.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{order.client_name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              <span dir="ltr" className="font-mono font-semibold">
                                {order.booking_code}
                              </span>{" "}
                              • {formatDateTime(order.created_at)}
                            </p>
                          </div>
                          <StatusSelect order={order} onChange={changeStatus} />
                        </div>

                        <ul className="mt-4 space-y-2 text-sm text-slate-700">
                          <InfoLine icon={MapPin}>
                            {order.from_area} <span className="text-slate-400">←</span> {order.to_area}
                          </InfoLine>
                          <InfoLine icon={CalendarDays}>
                            {formatDate(order.move_date)}
                            <FloorsText order={order} />
                          </InfoLine>
                          <InfoLine icon={Phone}>
                            <a href={`tel:${order.phone}`} className="hover:text-brand-600">
                              {order.phone}
                            </a>
                          </InfoLine>
                        </ul>

                        <div className="mt-3">
                          <ServiceBadges order={order} />
                        </div>
                        {order.notes && (
                          <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                            {order.notes}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                          <p className="text-sm font-semibold text-slate-900">
                            <PriceText order={order} />
                          </p>
                          <OrderActions order={order} onEdit={() => setEditing(order)} onDelete={() => remove(order)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </>
        )}
      </main>

      {editing && (
        <OrderDialog
          key={editing === "new" ? "new" : editing.id}
          order={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {notice && (
          <p className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{notice}</p>
        )}
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70", className)}>
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", tone)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="truncate font-display text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusSelect({ order, onChange }: { order: Order; onChange: (order: Order, status: OrderStatus) => void }) {
  const style = statusStyle(order.status);
  return (
    <div className="relative shrink-0">
      <select
        value={order.status}
        onChange={(event) => onChange(order, event.target.value as OrderStatus)}
        aria-label={`حالة الطلب ${order.booking_code}`}
        className={cn(
          "h-9 cursor-pointer appearance-none rounded-full border-0 ps-3 pe-8 text-sm font-bold ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-brand-500",
          style.badge,
        )}
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 opacity-60"
        aria-hidden="true"
      />
    </div>
  );
}

function ServiceBadges({ order }: { order: Order }) {
  const size = orderSize(order);
  const services = orderServices(order);
  const labels = serviceOptions.filter((option) => services.includes(option.column)).map((option) => option.label);
  if (!size && !labels.length) return <span className="text-xs text-slate-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {size && (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{size}</span>
      )}
      {labels.map((label) => (
        <span key={label} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {label}
        </span>
      ))}
    </div>
  );
}

function FloorsText({ order }: { order: Order }) {
  const from = Number(order.floor_from) || 1;
  const to = Number(order.floor_to) || 1;
  if (from <= 1 && to <= 1) return null;
  return (
    <>
      {" "}
      • الدور {from} ← {to}
    </>
  );
}

function PriceText({ order }: { order: Order }) {
  const price = orderPrice(order);
  return price ? <>{formatNumber(price)} جنيه</> : <span className="font-normal text-slate-400">بعد المعاينة</span>;
}

function InfoLine({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

function OrderActions({ order, onEdit, onDelete }: { order: Order; onEdit: () => void; onDelete: () => void }) {
  const whatsapp = customerWhatsappHref(
    order.phone,
    `مرحبًا ${order.client_name}، معك فريق ${site.name} بخصوص طلب النقل رقم ${order.booking_code} من ${order.from_area} إلى ${order.to_area}.`,
  );
  const iconButton =
    "grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900";

  return (
    <div className="flex items-center gap-0.5">
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="مراسلة العميل على واتساب"
          title="واتساب"
          className={cn(iconButton, "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800")}
        >
          <WhatsAppIcon className="size-[18px]" />
        </a>
      )}
      <button type="button" onClick={onEdit} aria-label="تعديل الطلب" title="تعديل" className={iconButton}>
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => printOrder(order)}
        aria-label="طباعة أمر التشغيل"
        title="طباعة"
        className={iconButton}
      >
        <Printer className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="حذف الطلب"
        title="حذف"
        className={cn(iconButton, "hover:bg-rose-50 hover:text-rose-600")}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function EmptyState({ hasOrders }: { hasOrders: boolean }) {
  return (
    <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200/70">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500">
        <Inbox className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
        {hasOrders ? "لا توجد نتائج مطابقة" : "لا توجد طلبات بعد"}
      </h2>
      <p className="mt-1.5 text-slate-500">
        {hasOrders ? "جرّب كلمة بحث أخرى أو حالة مختلفة." : "طلبات الحجز من الموقع ستظهر هنا تلقائيًا."}
      </p>
    </div>
  );
}

function AccessDenied({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-rose-600">
        <LockKeyhole className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-slate-900">لا توجد صلاحية</h1>
      <p className="mt-2 leading-relaxed text-slate-600">
        الحساب{" "}
        <span dir="ltr" className="font-semibold text-slate-900">
          {email}
        </span>{" "}
        غير مسجّل كمسؤول. أضِفه إلى جدول admin_users في Supabase (الخطوات في ملف supabase/schema.sql).
      </p>
      <button type="button" onClick={onSignOut} className={cn(buttonClasses({ variant: "light" }), "mt-6")}>
        <LogOut className="size-4" aria-hidden="true" />
        تسجيل الخروج
      </button>
    </div>
  );
}
