import { cn } from "@/lib/utils";

const eyebrowTones = {
  light: "bg-brand-50 text-brand-700 ring-brand-100",
  dark: "bg-white/10 text-sky-300 ring-white/15",
  brand: "bg-white/15 text-white ring-white/25",
};

export function Eyebrow({
  tone = "light",
  children,
}: {
  tone?: keyof typeof eyebrowTones;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-sm font-bold ring-1 ring-inset",
        eyebrowTones[tone],
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "mt-4 text-balance font-display text-3xl font-extrabold leading-snug sm:text-4xl",
          tone === "dark" ? "text-white" : "text-slate-900",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-pretty text-lg leading-relaxed",
            tone === "dark" ? "text-slate-300" : "text-slate-600",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
