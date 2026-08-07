"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { clientDayTab, clientDayTabActive } from "@/lib/client-ui";
import { cn } from "@/lib/utils";

const PROGRAM_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export function ProgramDayTabs({
  editDay,
  onSelect,
}: {
  editDay: number;
  onSelect: (day: number) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-2 flex gap-1 sm:flex-wrap sm:gap-2">
      {PROGRAM_DAYS.map((day) => {
        const active = editDay === day;
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
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
                active ? "text-black" : "text-white"
              )}
            >
              {day}
            </span>
          </button>
        );
      })}
    </div>
  );
}
