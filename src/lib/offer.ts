"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/config/site";
import type { Order } from "./orders";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config";

export const offer = site.offer;

const START = Date.parse(offer.startsAt);
const END = Date.parse(offer.endsAt);
const DAY = 86_400_000;

/** آخر يوم في العرض بتوقيت القاهرة، مثل: 30 سبتمبر */
export const offerLastDay = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "long",
  timeZone: "Africa/Cairo",
}).format(END - 1);

export const offerTitle = `خصم ${offer.discount}% لأول ${offer.limit} طلب`;
export const offerWhatsappMessage = `مرحبًا ${site.name}، أريد الاستفادة من عرض ${offerTitle}.`;

export type RunningOffer = {
  phase: "running";
  daysLeft: number;
  /** عدد الطلبات المحسوبة في العرض، أو null لو العدّاد غير متاح */
  used: number | null;
};
export type OfferStatus = { phase: "checking" } | { phase: "ended" } | RunningOffer;

/** الأماكن المتبقية، أو null لو غير معروفة */
export function offerRemaining(status: RunningOffer) {
  return status.used === null ? null : Math.max(0, offer.limit - status.used);
}

/** هل الحجز الآن داخل العرض؟ unknown لو العدّاد غير متاح */
export function offerEligibility(status: OfferStatus): "yes" | "unknown" | "no" {
  if (status.phase !== "running") return "no";
  const remaining = offerRemaining(status);
  if (remaining === null) return "unknown";
  return remaining > 0 ? "yes" : "no";
}

export function offerCountdown(daysLeft: number) {
  if (daysLeft <= 1) return "ينتهي اليوم";
  if (daysLeft === 2) return "ينتهي بعد يومين";
  return `ينتهي بعد ${daysLeft} ${daysLeft <= 10 ? "أيام" : "يومًا"}`;
}

/* ============ حالة العرض (تُحسب مرة واحدة في كل زيارة) ============ */

const CHECKING: OfferStatus = { phase: "checking" };
const ENDED: OfferStatus = { phase: "ended" };
let status: OfferStatus = CHECKING;
let started = false;
const listeners = new Set<() => void>();

function setStatus(next: OfferStatus) {
  status = next;
  for (const listener of listeners) listener();
}

/** عدد طلبات العرض من دالة offer_orders_count (رقم فقط، بدون أي بيانات عملاء) */
async function fetchUsedCount(): Promise<number | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/offer_orders_count`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_since: offer.startsAt }),
      signal: AbortSignal.timeout(5000),
    });
    // قبل تشغيل schema.sql لا توجد الدالة، فيظهر العرض بدون عدّاد
    if (!response.ok) return null;
    const count: unknown = await response.json();
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

/** إعادة حساب حالة العرض (عند فتح الموقع وبعد كل حجز) */
export async function refreshOffer() {
  const now = Date.now();
  if (!offer.show || now < START || now >= END) {
    setStatus(ENDED);
    return;
  }
  const used = await fetchUsedCount();
  setStatus({ phase: "running", daysLeft: Math.ceil((END - now) / DAY), used });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void refreshOffer();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useOffer() {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => CHECKING,
  );
}

/* ============ لوحة الإدارة ============ */

/** أول {limit} طلب غير ملغي خلال فترة العرض (نفس طريقة العد في offer_orders_count) */
export function offerOrderIds(orders: Order[]) {
  const eligible = orders
    .map((order) => ({ id: order.id, status: order.status, time: Date.parse(order.created_at ?? "") }))
    .filter((order) => order.status !== "ملغي" && order.time >= START && order.time < END)
    .sort((a, b) => a.time - b.time)
    .slice(0, offer.limit);
  return new Set(eligible.map((order) => order.id));
}
