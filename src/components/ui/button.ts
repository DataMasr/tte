import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 focus-visible:outline-brand-500",
  whatsapp:
    "bg-whatsapp text-white shadow-lg shadow-emerald-900/20 hover:bg-whatsapp-hover focus-visible:outline-emerald-600",
  glass:
    "bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur hover:bg-white/15 focus-visible:outline-white",
  light:
    "bg-white text-slate-800 ring-1 ring-inset ring-slate-200 shadow-sm hover:bg-slate-50 hover:ring-slate-300",
  white: "bg-white text-brand-700 shadow-lg shadow-black/10 hover:bg-brand-50 focus-visible:outline-white",
} as const;

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
  /** أزرار متجاورة في مساحة ضيقة (شريط الموبايل) */
  compact: "h-12 px-2 text-sm",
} as const;

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  block?: boolean;
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition duration-200 motion-safe:hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    block && "w-full",
  );
}
