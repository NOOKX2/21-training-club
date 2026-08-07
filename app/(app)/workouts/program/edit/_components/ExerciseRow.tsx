"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { Input } from "@/components/ui/Input";
import { clientField } from "@/lib/client-ui";
import type { ProgramExercise } from "@/lib/data";
import { openExercisePickerHref } from "@/lib/workout-exercise-picker";
import { cn } from "@/lib/utils";

export function ExerciseRow({
  exercise,
  readOnly = false,
  programId,
  editDay,
  existingVideoIds,
  onUpdate,
  onRemove,
}: {
  exercise: ProgramExercise;
  readOnly?: boolean;
  programId?: string;
  editDay?: number;
  existingVideoIds?: string[];
  onUpdate: (patch: Partial<ProgramExercise>) => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const canOpenPicker =
    !readOnly && programId != null && editDay != null && existingVideoIds != null;
  const pickerHref = canOpenPicker
    ? openExercisePickerHref(
        { programId, day: editDay, existingVideoIds },
        exercise.demo_video_id ?? undefined
      )
    : null;

  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:items-center">
        <p className="min-w-0 flex-1 truncate px-1 text-sm font-medium text-white">
          {exercise.name || t("workouts.exerciseName")}
        </p>
        <p className="w-16 text-center text-sm text-white/70">{exercise.target_sets}</p>
        <p className="w-20 text-center text-sm text-white/70">{exercise.target_reps}</p>
        <div className="w-10 shrink-0" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
      {pickerHref ? (
        <Link
          href={pickerHref}
          className={cn(
            "flex h-11 min-w-0 flex-1 items-center truncate px-3 text-sm font-medium text-white transition-colors hover:bg-white/5",
            clientField
          )}
        >
          {exercise.name || t("workouts.exerciseName")}
        </Link>
      ) : exercise.name ? (
        <p
          className={cn(
            "flex h-11 min-w-0 flex-1 items-center truncate px-3 text-sm font-medium text-white",
            clientField
          )}
        >
          {exercise.name}
        </p>
      ) : (
        <Input
          placeholder={t("workouts.exerciseName")}
          value={exercise.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="min-w-0 flex-1"
        />
      )}
      <Input
        type="number"
        min={1}
        placeholder={t("workouts.sets")}
        value={exercise.target_sets}
        onChange={(e) => onUpdate({ target_sets: Number(e.target.value) })}
        className="w-16"
      />
      <Input
        type="number"
        min={1}
        placeholder={t("workouts.reps")}
        value={exercise.target_reps}
        onChange={(e) => onUpdate({ target_reps: e.target.value })}
        className="w-20"
      />
      <button
        type="button"
        onClick={onRemove}
        className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg bg-red-950/50 text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
