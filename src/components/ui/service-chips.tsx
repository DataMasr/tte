import { Check } from "lucide-react";
import { serviceOptions } from "@/config/site";
import type { ServiceColumn } from "@/lib/orders";

export function ServiceChips({ defaultValue = [] }: { defaultValue?: ServiceColumn[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {serviceOptions.map((option) => (
        <label
          key={option.column}
          className="group cursor-pointer select-none rounded-full bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:ring-slate-300 has-checked:bg-brand-50 has-checked:text-brand-700 has-checked:ring-brand-300 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-500"
        >
          <input
            type="checkbox"
            name="services"
            value={option.column}
            defaultChecked={defaultValue.includes(option.column)}
            className="sr-only"
          />
          <span className="inline-flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-white ring-1 ring-inset ring-slate-300 transition group-has-checked:bg-brand-600 group-has-checked:ring-brand-600">
              <Check
                className="size-3 text-white opacity-0 group-has-checked:opacity-100"
                strokeWidth={3}
                aria-hidden="true"
              />
            </span>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
