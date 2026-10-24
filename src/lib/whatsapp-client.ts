import { getAdminClient } from "./supabase";

export interface WhatsAppStatus {
  status: "disconnected" | "connecting" | "qr" | "connected" | "error";
  user: string | null;
  userName: string | null;
  qrDataUrl: string | null;
  lastConnectedAt: string | null;
  lastError: string | null;
  settings: {
    autoReply: boolean;
    autoMessageNewOrders: boolean;
    template: string;
  };
  stats: {
    sentCount: number;
    logsCount: number;
  };
}

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  type: "sent" | "received" | "system" | "error";
  phone?: string;
  bookingCode?: string;
  clientName?: string;
  message: string;
  status?: string;
}

export const DEFAULT_BOT_URL =
  process.env.NEXT_PUBLIC_WA_BOT_URL || "http://167.235.10.203:5050";

export function getStoredBotUrl(): string {
  if (typeof window === "undefined") return DEFAULT_BOT_URL;
  return localStorage.getItem("wa_bot_url") || DEFAULT_BOT_URL;
}

export function setStoredBotUrl(url: string) {
  if (typeof window === "undefined") return;
  const clean = url.trim().replace(/\/+$/, "");
  if (clean) {
    localStorage.setItem("wa_bot_url", clean);
  } else {
    localStorage.removeItem("wa_bot_url");
  }
}

const PRIMARY_URL = "/api/whatsapp";
const FALLBACK_URL = `${DEFAULT_BOT_URL}/api/whatsapp`;

async function fetchWithFallback(endpoint: string, options?: RequestInit) {
  const targetBase = getStoredBotUrl() || DEFAULT_BOT_URL;
  if (targetBase) {
    try {
      const res = await fetch(`${targetBase}/api/whatsapp${endpoint}`, options);
      return await res.json();
    } catch {
      // Direct call failed (e.g. Mixed Content HTTP block on HTTPS host)
    }
  }

  try {
    const res = await fetch(`${PRIMARY_URL}${endpoint}`, options);
    if (res.status !== 404 && res.status !== 502) {
      return await res.json();
    }
  } catch {
    // Network error on primary rewrite
  }

  // Fallback direct to port 5050 on VPS
  try {
    const fallbackRes = await fetch(`${FALLBACK_URL}${endpoint}`, options);
    return await fallbackRes.json();
  } catch {
    return { ok: false, status: "disconnected", error: "تعذّر الاتصال المباشر بسيرفر البوت على 167.235.10.203:5050" };
  }
}

/**
 * جلب حالة البوت - يدعم الاستعلام السحابي عبر Supabase لتجاوز قيود Mixed Content (HTTPS -> HTTP)
 */
export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  const direct = await fetchWithFallback("/status", { cache: "no-store" });
  if (direct && direct.status && direct.status !== "disconnected") {
    return direct as WhatsAppStatus;
  }

  // مزامنة سحابية من Supabase
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("notes, created_at")
      .eq("booking_code", "WA_BOT_STATUS")
      .limit(1);

    if (data && data[0]?.notes) {
      const parsed = JSON.parse(data[0].notes);
      return {
        status: parsed.status || "connected",
        user: parsed.user || null,
        userName: parsed.userName || null,
        qrDataUrl: parsed.qrDataUrl || null,
        lastConnectedAt: parsed.lastConnectedAt || null,
        lastError: parsed.lastError || null,
        settings: parsed.settings || {
          autoReply: true,
          autoMessageNewOrders: true,
          template: "",
        },
        stats: parsed.stats || {
          sentCount: 0,
          logsCount: Array.isArray(parsed.logs) ? parsed.logs.length : 0,
        },
      };
    }
  } catch (err) {
    console.warn("Failed to read WA bot status from Supabase cloud sync:", err);
  }

  return (direct || {
    status: "disconnected",
    user: null,
    userName: null,
    qrDataUrl: null,
    lastConnectedAt: null,
    lastError: null,
    settings: { autoReply: true, autoMessageNewOrders: true, template: "" },
    stats: { sentCount: 0, logsCount: 0 },
  }) as WhatsAppStatus;
}

export async function connectWhatsApp(forceFresh = false) {
  return await fetchWithFallback("/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forceFresh }),
  });
}

export async function disconnectWhatsApp() {
  return await fetchWithFallback("/disconnect", {
    method: "POST",
  });
}

/**
 * إرسال رسالة تأكيد للطلب عبر البوت
 * يدعم الإرسال الفوري المباشر مع Fallback سحابي يوجه أمر الإرسال للـ VPS عبر قاعدة البيانات
 */
export async function sendOrderWhatsApp(
  order: {
    booking_code: string;
    client_name: string;
    phone: string;
    from_area: string;
    to_area: string;
    move_date?: string | null;
    services?: unknown;
    notes?: string | null;
  },
  force = true
): Promise<{ ok: boolean; error?: string; message?: string }> {
  const direct = await fetchWithFallback("/send-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order, force }),
  });

  if (direct && direct.ok) {
    return direct;
  }

  // Fallback سحابي: وسم الطلب بـ [TRIGGER_SEND_WA] في Supabase ليرسله سيرفر الـ VPS فوراً
  try {
    const supabase = getAdminClient();
    const { data: existing } = await supabase
      .from("orders")
      .select("id, notes")
      .eq("booking_code", order.booking_code)
      .limit(1);

    if (existing && existing[0]) {
      const currentNotes = existing[0].notes || "";
      const updatedNotes = currentNotes.includes("[TRIGGER_SEND_WA]")
        ? currentNotes
        : `${currentNotes} [TRIGGER_SEND_WA]`.trim();

      await supabase
        .from("orders")
        .update({ notes: updatedNotes })
        .eq("id", existing[0].id);

      return {
        ok: true,
        message: `تم توجيه أمر الإرسال لسيرفر البوت على VPS بنجاح للطلب (${order.booking_code})`,
      };
    }
  } catch (err: unknown) {
    console.error("Cloud trigger fallback error:", err);
  }

  return direct || { ok: false, error: "تعذّر إرسال الرسالة إلى البوت." };
}

export async function repairWhatsAppSession() {
  return await fetchWithFallback("/repair-session", {
    method: "POST",
  });
}

export async function sendTestWhatsApp(phone: string, message: string) {
  return await fetchWithFallback("/test-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message }),
  });
}

/**
 * جلب سجل نشاط البوت مع دعم الاسترجاع السحابي من Supabase
 */
export async function getWhatsAppLogs(): Promise<{ ok: boolean; logs: WhatsAppLog[] }> {
  const direct = await fetchWithFallback("/logs", { cache: "no-store" });
  if (direct && direct.ok && Array.isArray(direct.logs) && direct.logs.length > 0) {
    return direct;
  }

  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("notes")
      .eq("booking_code", "WA_BOT_STATUS")
      .limit(1);

    if (data && data[0]?.notes) {
      const parsed = JSON.parse(data[0].notes);
      if (Array.isArray(parsed.logs)) {
        return { ok: true, logs: parsed.logs };
      }
    }
  } catch (err) {
    console.warn("Failed to read WA bot logs from Supabase:", err);
  }

  return (direct && Array.isArray(direct.logs))
    ? direct
    : { ok: true, logs: [] };
}

export async function saveWhatsAppSettings(settings: {
  autoReply?: boolean;
  autoMessageNewOrders?: boolean;
  template?: string;
}) {
  const direct = await fetchWithFallback("/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (direct && direct.ok) return direct;

  // مزامنة الإعدادات سحابياً أيضاً
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("notes")
      .eq("booking_code", "WA_BOT_STATUS")
      .limit(1);

    if (data && data[0]?.notes) {
      const parsed = JSON.parse(data[0].notes);
      parsed.settings = { ...(parsed.settings || {}), ...settings };
      parsed.pendingSettings = settings;
      await supabase
        .from("orders")
        .update({ notes: JSON.stringify(parsed) })
        .eq("booking_code", "WA_BOT_STATUS");

      return { ok: true, settings: parsed.settings };
    }
  } catch {
    // fallback failed
  }

  return direct;
}

export async function resetWhatsAppTemplate() {
  return await fetchWithFallback("/settings/reset-template", {
    method: "POST",
  });
}

/**
 * دالة مساعدة تُستدعى لحظة إنشاء العميل للطلب في الموقع
 * لترسل له رسالة فورية دون انتظار فحص قاعدة البيانات.
 */
export async function notifyNewOrderInstant(order: {
  booking_code: string;
  client_name: string;
  phone: string;
  from_area: string;
  to_area: string;
  move_date?: string | null;
  services?: unknown;
  notes?: string | null;
}) {
  try {
    await sendOrderWhatsApp(order);
  } catch (err) {
    console.warn("Could not send instant WhatsApp message:", err);
  }
}
