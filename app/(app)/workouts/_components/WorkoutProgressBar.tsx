"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

export function WorkoutProgressBar({
  completedSets,
  totalSets,
  className,
}: {
  completedSets: number;
  totalSets: number;
  className?: string;
}) {
  const { t } = useLanguage();
  const safeTotal = Math.max(0, totalSets);
  const safeCompleted = Math.min(Math.max(0, completedSets), safeTotal);
  const percent = safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A8C5DC]">
          {t("workouts.setsProgress", {
            completed: safeCompleted,
            total: safeTotal,
          })}
        </p>
        <p className="text-sm font-semibold tabular-nums text-white/80">{percent}%</p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCompleted}
        aria-label={t("workouts.setsProgress", {
          completed: safeCompleted,
          total: safeTotal,
        })}
      >
        <div
          className="h-full rounded-full bg-[#6B93B8] transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
