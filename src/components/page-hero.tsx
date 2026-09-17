import { DarkBackdrop } from "@/components/backdrop";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/ui/container";
import type { Crumb } from "@/lib/schema";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  description,
  breadcrumbs,
  eyebrow,
  children,
  overlap = false,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  eyebrow?: string;
  children?: React.ReactNode;
  /** true لو المحتوى التالي يتداخل مع أسفل الهيدر (مثل صفحة التتبع) */
  overlap?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-ink-950 pt-28 text-center sm:pt-32 lg:pt-40",
        overlap ? "pb-28" : "pb-16 sm:pb-20",
      )}
    >
      <DarkBackdrop />
      <Container className="max-w-4xl">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && (
          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-200 ring-1 ring-inset ring-white/10">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-5 text-balance font-display text-[2rem] font-extrabold leading-snug text-white sm:text-5xl sm:leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
