import Form from "next/form";
import { PackageSearch } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/styles";
import { cn } from "@/lib/utils";

/** مربع سريع لمتابعة الطلب برقم الطلب، يفتح صفحة /track */
export function TrackShortcut({ className }: { className?: string }) {
  return (
    <Form action="/track" className={cn("rounded-2xl bg-white p-4 ring-1 ring-slate-200/80 sm:p-5", className)}>
      <label htmlFor="track-shortcut" className="flex items-center gap-2 font-display font-bold text-slate-900">
        <PackageSearch className="size-5 text-brand-600" aria-hidden="true" />
        حجزت من قبل؟ تابع حالة طلبك
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="track-shortcut"
          name="code"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="رقم الطلب، مثل NQ-4K7P2Q"
          className={cn(inputClasses, "h-12 min-w-0 uppercase placeholder:normal-case")}
        />
        <button type="submit" className={cn(buttonClasses(), "shrink-0")}>
          تتبع
        </button>
      </div>
    </Form>
  );
}
