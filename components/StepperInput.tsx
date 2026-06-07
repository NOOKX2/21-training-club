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
}: {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  inputMode?: "decimal" | "numeric";
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
        className={clientSpinBtn}
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
        className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[15px] font-semibold text-white placeholder:text-white/30 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => adjust(step)}
        className={clientSpinBtn}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
