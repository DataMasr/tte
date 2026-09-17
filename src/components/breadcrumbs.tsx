import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Crumb } from "@/lib/schema";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسار الصفحة">
      <ol className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="font-semibold text-slate-200">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="text-slate-400 transition hover:text-white">
                    {item.name}
                  </Link>
                  <ChevronLeft className="size-4 text-slate-600" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
