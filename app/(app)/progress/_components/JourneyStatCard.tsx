import { clientCardInner } from "@/lib/client-ui";
import { cn } from "@/lib/utils";

export function JourneyStatCard({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn(clientCardInner, "px-4 py-4")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className={cn("mt-1 text-xl font-bold sm:text-2xl", valueClassName ?? "text-white")}>
        {value}
      </p>
      <p className="mt-1 text-[10px] leading-snug text-white/35">{hint}</p>
    </div>
  );
}
