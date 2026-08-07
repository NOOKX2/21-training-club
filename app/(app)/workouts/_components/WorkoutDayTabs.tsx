"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { WORKOUT_DAYS } from "@/app/(app)/workouts/_components/types";
import { clientDayTab, clientDayTabActive } from "@/lib/client-ui";
import { cn } from "@/lib/utils";

export function WorkoutDayTabs({
  day,
  onSelect,
}: {
  day: number;
  onSelect: (day: number) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-9 flex gap-1 sm:flex-wrap sm:gap-2">
      {WORKOUT_DAYS.map((d) => {
        const active = day === d;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onSelect(d)}
            className={cn(
              clientDayTab,
              "min-w-0 flex-1 rounded-[10px] px-1 py-2 sm:min-w-[70px] sm:flex-none sm:rounded-[14px] sm:px-[18px] sm:py-3.5",
              active && clientDayTabActive
            )}
          >
            <span
              className={cn(
                "text-[7px] font-bold uppercase tracking-[0.1em] sm:text-[9px] sm:tracking-[0.18em]",
                active ? "text-black/50" : "text-white/45"
              )}
            >
              {t("common.day")}
            </span>
            <span
              className={cn(
                "font-[family-name:var(--font-inter)] text-lg font-extrabold leading-none tracking-[-0.04em] sm:text-[26px]",
                active ? "text-black" : "text-white/60"
              )}
            >
              {d}
            </span>
          </button>
        );
      })}
    </div>
  );
}
