"use client";

import { clientCardInner } from "@/lib/client-ui";
import { limitValueClass } from "@/lib/nutrition-utils";
import { cn } from "@/lib/utils";

export function MacroLimitBox({
  label,
  consumed,
  limit,
}: {
  label: string;
  consumed: number;
  limit?: number;
}) {
  return (
    <div className={cn(clientCardInner, "px-4 py-3 text-center")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${limitValueClass(consumed, limit)}`}>
        {consumed}
        {limit ? <span className="text-sm font-normal text-white/45"> / {limit}</span> : null}
        <span className="ml-1 text-sm font-normal text-white/45">g</span>
      </p>
    </div>
  );
}
