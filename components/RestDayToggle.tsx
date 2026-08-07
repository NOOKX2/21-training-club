"use client";

import { BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";

export function RestDayToggle({
  checked,
  onChange,
  disabled = false,
  className,
  title = "Rest Day",
  description = "Client sees a recovery screen — no exercises or cardio for this day.",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-4 transition-colors",
        disabled ? "cursor-default opacity-70" : "cursor-pointer",
        checked
          ? "border-[#6B93B8]/40 bg-[#6B93B8]/10"
          : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700",
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[#6B93B8] disabled:cursor-default"
      />
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B93B8]/15 text-[#6B93B8]">
          <BedDouble className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-white">
            {title}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {description}
          </p>
        </div>
      </div>
    </label>
  );
}
