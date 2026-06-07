import { clientField } from "@/lib/client-ui";
import { cn } from "@/lib/utils";

export function FitSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "min-w-[160px] px-4 py-2.5 text-sm text-white focus:border-white/25 focus:outline-none",
          clientField
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
