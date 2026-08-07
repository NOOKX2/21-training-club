import type { WorkoutSetEntry } from "@/lib/data";

export type ExerciseLogState = {
  actual_weight: string;
  actual_reps: string;
  sets?: WorkoutSetEntry[];
};

export const WORKOUT_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export const exerciseMediaClass =
  "h-[4.75rem] w-[4.75rem] rounded-lg sm:h-28 sm:w-44 sm:rounded-xl";
