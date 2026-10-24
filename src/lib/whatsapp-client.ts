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
  const custom = getStoredBotUrl();
  if (custom) {
    try {
      const res = await fetch(`${custom}/api/whatsapp${endpoint}`, options);
      if (res.ok) return await res.json();
    } catch {}
  }

  try {
    const res = await fetch(`${PRIMARY_URL}${endpoint}`, options);
    if (res.status !== 404 && res.status !== 502) {
      return await res.json();
    }
  } catch {
    // Network error on primary rewrite (e.g. static host or direct port access)
  }

  // Fallback direct to port 5050 on VPS (167.235.10.203)
  try {
    const fallbackRes = await fetch(`${FALLBACK_URL}${endpoint}`, options);
    return await fallbackRes.json();
  } catch {
    return { ok: false, status: "disconnected", error: "تعذّر الاتصال بسيرفر البوت على 167.235.10.203:5050" };
  }
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  return await fetchWithFallback("/status", { cache: "no-store" });
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
) {
  return await fetchWithFallback("/send-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order, force }),
  });
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

export async function getWhatsAppLogs(): Promise<{ ok: boolean; logs: WhatsAppLog[] }> {
  return await fetchWithFallback("/logs", { cache: "no-store" });
}

export async function saveWhatsAppSettings(settings: {
  autoReply?: boolean;
  autoMessageNewOrders?: boolean;
  template?: string;
}) {
  return await fetchWithFallback("/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
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
    // عدم تعطيل واجهة العميل لو كان البوت غير متصل في تلك اللحظة
    console.warn("Could not send instant WhatsApp message:", err);
  }
}
