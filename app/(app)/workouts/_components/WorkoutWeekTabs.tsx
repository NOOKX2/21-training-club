"use client";

import { useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { clientDayTab, clientDayTabActive } from "@/lib/client-ui";
import { MAX_WORKOUT_LOG_WEEK } from "@/lib/app-page-keys";
import { cn } from "@/lib/utils";

export function WorkoutWeekTabs({
  week,
  weeks,
  deleting = false,
  onSelect,
  onAddWeek,
  onDeleteWeek,
}: {
  week: number;
  weeks: number[];
  deleting?: boolean;
  onSelect: (week: number) => void;
  onAddWeek: () => void;
  onDeleteWeek: () => void;
}) {
  const { t } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const canAdd = weeks.length > 0 && Math.max(...weeks) < MAX_WORKOUT_LOG_WEEK;
  const canDelete = weeks.length > 1;

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [week]);

  return (
    <div
      ref={scrollerRef}
      className="mb-2 flex gap-1 overflow-x-auto pb-1 sm:mb-3 sm:gap-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {weeks.map((value) => {
        const active = week === value;
        return (
          <button
            key={value}
            ref={active ? activeRef : undefined}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              clientDayTab,
              "min-w-[4.25rem] flex-none rounded-[10px] px-2 py-2 sm:min-w-[70px] sm:rounded-[14px] sm:px-[14px] sm:py-3",
              active && clientDayTabActive
            )}
          >
            <span
              className={cn(
                "text-[7px] font-bold uppercase tracking-[0.1em] sm:text-[9px] sm:tracking-[0.18em]",
                active ? "text-black/50" : "text-white/45"
              )}
            >
              {t("common.week")}
            </span>
            <span
              className={cn(
                "font-[family-name:var(--font-inter)] text-lg font-extrabold leading-none tracking-[-0.04em] sm:text-[22px]",
                active ? "text-black" : "text-white/60"
              )}
            >
              {value}
            </span>
          </button>
        );
      })}
      {canAdd ? (
        <button
          type="button"
          onClick={onAddWeek}
          className={cn(
            clientDayTab,
            "min-w-[4.25rem] flex-none rounded-[10px] px-2 py-2 sm:min-w-[70px] sm:rounded-[14px] sm:px-[14px] sm:py-3"
          )}
          aria-label={t("workouts.addWeek")}
        >
          <Plus className="h-4 w-4 text-white/55" />
          <span className="text-[7px] font-bold uppercase tracking-[0.08em] text-white/45 sm:text-[9px]">
            {t("workouts.addWeek")}
          </span>
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          disabled={deleting}
          onClick={onDeleteWeek}
          className={cn(
            clientDayTab,
            "min-w-[4.25rem] flex-none rounded-[10px] px-2 py-2 text-red-300 hover:border-red-400/30 hover:bg-red-400/10 sm:min-w-[70px] sm:rounded-[14px] sm:px-[14px] sm:py-3"
          )}
          aria-label={t("workouts.deleteWeek")}
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-[7px] font-bold uppercase tracking-[0.08em] sm:text-[9px]">
            {t("workouts.deleteWeek")}
          </span>
        </button>
      ) : null}
    </div>
  );
}
