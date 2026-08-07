"use client";

import { Play } from "lucide-react";
import { forwardRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { ExercisePickerPreview } from "@/app/(app)/workouts/program/edit/exercises/_components/ExercisePickerPreview";
import { clientCard } from "@/lib/client-ui";
import type { ExercisePickerItem } from "@/lib/workout-exercise-picker";
import { cn } from "@/lib/utils";

export const ExercisePickerCard = forwardRef<
  HTMLDivElement,
  {
    exercise: ExercisePickerItem;
    selected: boolean;
    onToggle: () => void;
  }
>(function ExercisePickerCard({ exercise, selected, onToggle }, ref) {
  const { t } = useLanguage();

  return (
    <div
      ref={ref}
      className={cn(
        clientCard,
        "relative overflow-hidden text-left transition-colors",
        selected
          ? "border-[#6B93B8]/70 ring-1 ring-[#6B93B8]/40"
          : "hover:border-white/25"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-3 z-10"
        aria-label={
          selected
            ? t("workouts.exercisePickerDeselect", { name: exercise.name })
            : t("workouts.exercisePickerSelect", { name: exercise.name })
        }
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border",
            selected
              ? "border-[#6B93B8] bg-[#6B93B8] text-white"
              : "border-white/25 bg-black/40"
          )}
          aria-hidden
        >
          {selected ? (
            <svg viewBox="0 0 12 10" className="h-3 w-3 fill-none stroke-current stroke-[2]">
              <path d="M1 5.5L4.5 9 11 1" />
            </svg>
          ) : null}
        </span>
      </button>

      <button
        type="button"
        onClick={onToggle}
        className="w-full border-t border-white/10 px-3 py-3 text-left"
      >
        <p className="truncate pr-8 text-sm font-semibold text-white">{exercise.name}</p>
      </button>

      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-black/35">
        {exercise.preview ? (
          <ExercisePickerPreview exercise={exercise} />
        ) : exercise.hasMedia ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70">
            <Play className="h-5 w-5 fill-current" />
          </div>
        ) : (
          <p className="px-4 text-center text-[10px] font-bold uppercase tracking-wide text-white/30">
            {exercise.source === "custom"
              ? t("workouts.exercisePickerCustom")
              : t("workouts.exercisePickerNoMedia")}
          </p>
        )}
      </div>
    </div>
  );
});
