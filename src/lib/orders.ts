import type { SupabaseClient } from "@supabase/supabase-js";
import { moveSizes, serviceOptions } from "@/config/site";
import { toLatinDigits } from "./phone";

export const ORDER_STATUSES = ["جديد", "جاري التواصل", "مؤكد", "مكتمل", "ملغي"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ServiceColumn = (typeof serviceOptions)[number]["column"];

export interface Order {
  id: string;
  booking_code: string;
  client_name: string;
  phone: string;
  whatsapp?: string | null;
  from_area: string;
  to_area: string;
  rooms_count?: string | null;
  floor_from?: number | null;
  floor_to?: number | null;
  has_winch?: boolean | null;
  has_packaging?: boolean | null;
  has_carpentry?: boolean | null;
  has_ac?: boolean | null;
  services?: string[] | string | null;
  move_date?: string | null;
  estimated_price?: number | string | null;
  status: string;
  notes?: string | null;
  created_at?: string | null;
}

export interface OrderInput {
  clientName: string;
  phone: string;
  fromArea: string;
  toArea: string;
  moveDate: string | null;
  size: string | null;
  services: ServiceColumn[];
  notes: string;
  /** لوحة الإدارة فقط */
  price?: number | null;
  status?: OrderStatus;
}

export type TrackedOrder = Pick<Order, "booking_code" | "status" | "move_date" | "from_area" | "to_area">;
export type TrackResult =
  | { kind: "found"; order: TrackedOrder }
  | { kind: "not-found" }
  | { kind: "error" };

type DbError = { code?: string; message: string };
type Row = Record<string, unknown>;

const TABLE = "orders";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBookingCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `NQ-${Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")}`;
}

export function normalizeBookingCode(value: string) {
  const raw = toLatinDigits(value).toUpperCase().replace(/[\s_\-–—]+/g, "");
  const body = raw.startsWith("NQ") ? raw.slice(2) : raw;
  return body ? `NQ-${body}` : "";
}

export function isServiceColumn(value: string): value is ServiceColumn {
  return serviceOptions.some((option) => option.column === value);
}

function toRow(input: OrderInput): Row {
  const labels = serviceOptions
    .filter((option) => input.services.includes(option.column))
    .map((option) => option.label);

  const row: Row = {
    client_name: input.clientName,
    phone: input.phone,
    whatsapp: input.phone,
    from_area: input.fromArea,
    to_area: input.toArea,
    move_date: input.moveDate,
    services: input.size ? [input.size, ...labels] : labels,
    notes: input.notes,
    status: input.status ?? "جديد",
  };
  for (const option of serviceOptions) row[option.column] = input.services.includes(option.column);
  if (input.size) row.rooms_count = input.size;
  if (input.price != null) row.estimated_price = input.price;
  return row;
}

/**
 * قاعدة البيانات الحالية قد لا تحتوي على كل الأعمدة (مثل services أو has_ac).
 * لو Supabase رفض عمودًا غير موجود نحذفه ونعيد المحاولة، حتى لا يضيع أي طلب.
 */
async function withColumnFallback(row: Row, run: (row: Row) => PromiseLike<DbError | null>) {
  const current = { ...row };
  for (;;) {
    const error = await run(current);
    const column =
      error?.code === "PGRST204" ? /'([^']+)' column/.exec(error.message)?.[1] : undefined;
    if (!error || !column || !(column in current)) return error;
    delete current[column];
  }
}

async function insertOrder(client: SupabaseClient, input: OrderInput) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateBookingCode();
    const error = await withColumnFallback({ ...toRow(input), booking_code: code }, (row) =>
      client
        .from(TABLE)
        .insert(row)
        .then(({ error }) => error),
    );
    if (!error) return { ok: true as const, code };
    if (error.code !== "23505") return { ok: false as const, error: error.message };
  }
  return { ok: false as const, error: "تعذّر إنشاء رقم طلب فريد" };
}

/* ============ الزوار ============ */

export async function createBooking(input: OrderInput) {
  // تحميل Supabase عند الإرسال فقط لتخفيف الصفحة الرئيسية
  const { getPublicClient } = await import("./supabase");
  try {
    return await insertOrder(getPublicClient(), input);
  } catch (error) {
    return { ok: false as const, error: String(error) };
  }
}

export async function trackOrder(rawCode: string): Promise<TrackResult> {
  const code = normalizeBookingCode(rawCode);
  if (!code) return { kind: "not-found" };

  try {
    const { getPublicClient } = await import("./supabase");
    const client = getPublicClient();

    // track_order تُرجع البيانات العامة فقط (بدون الاسم أو الموبايل)
    const rpc = await client.rpc("track_order", { p_code: code });
    let rows = rpc.data as TrackedOrder[] | null;

    if (rpc.error?.code === "PGRST202") {
      // الدالة غير موجودة بعد (قبل تشغيل supabase/schema.sql)
      const fallback = await client
        .from(TABLE)
        .select("booking_code,status,move_date,from_area,to_area")
        .eq("booking_code", code)
        .limit(1);
      if (fallback.error) return { kind: "error" };
      rows = fallback.data;
    } else if (rpc.error) {
      return { kind: "error" };
    }

    return rows?.length ? { kind: "found", order: rows[0] } : { kind: "not-found" };
  } catch {
    return { kind: "error" };
  }
}

/* ============ لوحة الإدارة ============ */

export async function checkAdminAccess(client: SupabaseClient): Promise<"allowed" | "denied" | "unknown"> {
  const { data, error } = await client.rpc("is_admin");
  if (!error) return data === true ? "allowed" : "denied";
  // قبل تشغيل schema.sql لا توجد الدالة، فنسمح بالدخول كما كان سابقًا
  return error.code === "PGRST202" ? "allowed" : "unknown";
}

export async function listOrders(client: SupabaseClient) {
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export function createOrder(client: SupabaseClient, input: OrderInput) {
  return insertOrder(client, input);
}

export async function updateOrder(client: SupabaseClient, id: string, input: OrderInput) {
  const error = await withColumnFallback(toRow(input), (row) =>
    client
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select("id")
      .then(({ data, error }) =>
        error ?? (data?.length ? null : { message: "لا توجد صلاحية لتعديل الطلب" }),
      ),
  );
  if (error) throw new Error(error.message);
}

export async function updateOrderStatus(client: SupabaseClient, id: string, status: OrderStatus) {
  const { data, error } = await client.from(TABLE).update({ status }).eq("id", id).select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("لا توجد صلاحية لتعديل الطلب");
}

export async function deleteOrder(client: SupabaseClient, id: string) {
  const { data, error } = await client.from(TABLE).delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("لا توجد صلاحية لحذف الطلب");
}

/* ============ قراءة بيانات الطلب (تدعم الطلبات القديمة) ============ */

function servicesList(order: Order): string[] {
  if (Array.isArray(order.services)) return order.services.filter(Boolean);
  if (typeof order.services === "string") {
    try {
      const parsed: unknown = JSON.parse(order.services);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return order.services.replace(/[{}"]/g, "").split(",").filter(Boolean);
    }
  }
  return [];
}

export function orderServices(order: Order): ServiceColumn[] {
  const list = servicesList(order);
  if (!list.length) return serviceOptions.filter((o) => order[o.column]).map((o) => o.column);

  const has = (word: string) => list.some((item) => item.includes(word));
  const flags: Record<ServiceColumn, boolean> = {
    has_winch: has("ونش"),
    has_packaging: has("تغليف"),
    has_carpentry: list.some((item) => item.includes("فك وتركيب") && !item.includes("تكييف")),
    has_ac: has("تكييف"),
  };
  return serviceOptions.filter((o) => flags[o.column]).map((o) => o.column);
}

export function orderSize(order: Order) {
  const list = servicesList(order);
  return (
    list.find((item) => (moveSizes as readonly string[]).includes(item)) ??
    list.find((item) => /غرف|شقة|فيلا|دوبلكس|مكتب|استوديو/.test(item)) ??
    order.rooms_count ??
    null
  );
}

export function orderPrice(order: Order) {
  const value = Number(order.estimated_price);
  return Number.isFinite(value) ? value : 0;
}
