import { Building2, PackageCheck, Route, Truck, Wrench } from "lucide-react";
import type { ServiceIconName } from "@/config/services";
import { WinchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const icons = {
  truck: Truck,
  winch: WinchIcon,
  packing: PackageCheck,
  assembly: Wrench,
  office: Building2,
  intercity: Route,
};

const tones = {
  glass: "bg-white/15 text-white ring-white/25 backdrop-blur",
  brand: "bg-brand-600 text-white shadow-lg shadow-brand-600/25 ring-brand-500",
  soft: "bg-brand-50 text-brand-600 ring-brand-100",
};

export function ServiceIcon({
  name,
  tone = "soft",
  className,
}: {
  name: ServiceIconName;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const Icon = icons[name];
  return (
    <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset", tones[tone], className)}>
      <Icon className="size-6" aria-hidden="true" />
    </span>
  );
}
