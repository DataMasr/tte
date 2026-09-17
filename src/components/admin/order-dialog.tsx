"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LoaderCircle, X } from "lucide-react";
import { moveSizes } from "@/config/site";
import { buttonClasses } from "@/components/ui/button";
import { ServiceChips } from "@/components/ui/service-chips";
import { inputClasses, labelClasses } from "@/components/ui/styles";
import {
  isServiceColumn,
  ORDER_STATUSES,
  orderPrice,
  orderServices,
  orderSize,
  type Order,
  type OrderInput,
  type OrderStatus,
} from "@/lib/orders";
import { normalizeEgyptianMobile, toLatinDigits } from "@/lib/phone";
import { cn } from "@/lib/utils";

export function OrderDialog({
  order,
  onClose,
  onSave,
}: {
  order: Order | null;
  onClose: () => void;
  onSave: (input: OrderInput, order: Order | null) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const size = order ? orderSize(order) : null;
  const sizeOptions: string[] = size && !(moveSizes as readonly string[]).includes(size) ? [...moveSizes, size] : [...moveSizes];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const price = Number(toLatinDigits(text("price")).replace(/[^\d.]/g, ""));

    const input: OrderInput = {
      clientName: text("clientName"),
      phone: normalizeEgyptianMobile(text("phone")) ?? toLatinDigits(text("phone")),
      fromArea: text("fromArea"),
      toArea: text("toArea"),
      moveDate: text("moveDate") || null,
      size: text("size") || null,
      services: data.getAll("services").map(String).filter(isServiceColumn),
      notes: text("notes"),
      price: Number.isFinite(price) ? price : 0,
      status: text("status") as OrderStatus,
    };

    setPending(true);
    setError(null);
    try {
      await onSave(input, order);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}
      aria-labelledby="order-dialog-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100%-2rem))] overflow-y-auto rounded-[2rem] bg-white p-0 text-slate-700 shadow-2xl backdrop:bg-ink-950/60 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="order-dialog-title" className="font-display text-xl font-extrabold text-slate-900">
              {order ? "تعديل الطلب" : "إضافة طلب جديد"}
            </h2>
            {order && (
              <p dir="ltr" className="mt-1 text-end font-mono text-sm text-slate-500">
                {order.booking_code}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="إغلاق"
            className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="اسم العميل" name="clientName" defaultValue={order?.client_name} required />
          <Field label="رقم الموبايل" name="phone" type="tel" defaultValue={order?.phone} required />
          <Field label="النقل من" name="fromArea" defaultValue={order?.from_area} required />
          <Field label="النقل إلى" name="toArea" defaultValue={order?.to_area} required />
          <Field label="تاريخ النقل" name="moveDate" type="date" defaultValue={order?.move_date ?? ""} />
          <Field
            label="القيمة المتفق عليها (جنيه)"
            name="price"
            inputMode="numeric"
            defaultValue={order && orderPrice(order) ? String(orderPrice(order)) : ""}
            placeholder="مثال: 18000"
          />
          <SelectField label="حجم النقل" name="size" defaultValue={size ?? ""}>
            <option value="">غير محدد</option>
            {sizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
          <SelectField label="الحالة" name="status" defaultValue={order?.status ?? "جديد"}>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectField>
        </div>

        <fieldset className="mt-5">
          <legend className={labelClasses}>الخدمات</legend>
          <ServiceChips defaultValue={order ? orderServices(order) : []} />
        </fieldset>

        <div className="mt-5">
          <label htmlFor="order-notes" className={labelClasses}>
            ملاحظات
          </label>
          <textarea
            id="order-notes"
            name="notes"
            rows={3}
            defaultValue={order?.notes ?? ""}
            className={cn(inputClasses, "mt-2 resize-y")}
          />
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl bg-rose-50 p-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
            تعذّر الحفظ: {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={buttonClasses({ variant: "light" })}
          >
            إلغاء
          </button>
          <button type="submit" disabled={pending} className={buttonClasses()}>
            {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
            {pending ? "جاري الحفظ..." : order ? "حفظ التعديلات" : "إضافة الطلب"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function Field({ label, name, ...props }: React.ComponentProps<"input"> & { label: string; name: string }) {
  const id = `order-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <input id={id} name={name} className={cn(inputClasses, "mt-2 min-h-[3.25rem]")} {...props} />
    </div>
  );
}

function SelectField({
  label,
  name,
  children,
  ...props
}: React.ComponentProps<"select"> & { label: string; name: string }) {
  const id = `order-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <div className="relative mt-2">
        <select id={id} name={name} className={cn(inputClasses, "appearance-none pe-11")} {...props}>
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
