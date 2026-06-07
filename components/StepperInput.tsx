"use client";

import { cn } from "@/lib/utils";
import { clientSpinBtn, clientSpinInput } from "@/lib/client-ui";

export function StepperInput({
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder = "0",
  className,
  inputMode = "decimal",
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  inputMode?: "decimal" | "numeric";
  compact?: boolean;
}) {
  function adjust(delta: number) {
    const current = value === "" ? 0 : Number(value);
    if (Number.isNaN(current)) return;
    const next = Math.max(min, current + delta);
    const formatted = Number.isInteger(step) ? String(Math.round(next)) : String(next);
    onChange(formatted);
  }

  return (
    <div className={cn(clientSpinInput, className)}>
      <button
        type="button"
        onClick={() => adjust(-step)}
        className={cn(clientSpinBtn, compact && "h-9 w-7 text-base sm:h-11 sm:w-[38px] sm:text-lg")}
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "min-w-0 flex-1 bg-transparent font-semibold text-white placeholder:text-white/30 focus:outline-none",
          compact ? "px-1 py-2 text-sm sm:px-3.5 sm:py-3 sm:text-[15px]" : "px-3.5 py-3 text-[15px]"
        )}
      />
      <button
        type="button"
        onClick={() => adjust(step)}
        className={cn(clientSpinBtn, compact && "h-9 w-7 text-base sm:h-11 sm:w-[38px] sm:text-lg")}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
