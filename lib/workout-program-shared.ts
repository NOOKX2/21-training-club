/** Client-safe workout program types and constants (no MongoDB / server imports). */

import type { ProgramCardio } from "./program-cardio";

export const DEFAULT_WORKOUT_PROGRAM_ID = "main";
export const WORKOUT_PROGRAM_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export type WorkoutProgramStatus = "active" | "inactive";

export type WorkoutProgramExercise = {
  id: string;
  name: string;
  target_sets: number;
  target_reps: string;
  demo_video_id?: string | null;
};

export type WorkoutProgramDayEntry = {
  day: number;
  exercises: WorkoutProgramExercise[];
  cardio: ProgramCardio | null;
  rest_day: boolean;
};

export type UserWorkoutProgram = {
  id: string;
  user_id: string;
  name: string;
  status: WorkoutProgramStatus;
  days: WorkoutProgramDayEntry[];
  created_at: string;
  updated_at: string;
};

export type UserWorkoutDayDoc = {
  user_id: string;
  day: number;
  exercises: WorkoutProgramExercise[];
  cardio: ProgramCardio | null;
  rest_day: boolean;
  updated_at: string;
};

export type UserWorkoutTemplate = {
  id: string;
  user_id: string;
  name: string;
  days: WorkoutProgramDayEntry[];
  created_at: string;
  updated_at: string;
  is_enabled?: boolean;
};

export type ActiveWorkoutProgramInfo = {
  id: string;
  name: string;
};

export type ExerciseVideoOption = { id: string; name: string };

export type WorkoutProgramListStatus = "draft" | "enabled" | "disabled";

export type WorkoutProgramListItem = {
  id: string;
  kind: "main" | "template";
  name: string;
  status: WorkoutProgramListStatus;
  isEnabled: boolean;
  hasContent: boolean;
  updatedAt: string | null;
  exerciseCount: number;
  trainingDays: number;
  tags: string[];
  editHref: string;
  viewHref: string;
};

export type WorkoutProgramListFilter = "all" | "active" | "drafts";

export function parseWorkoutProgramDay(value?: string | null, fallback = 1) {
  return Math.min(7, Math.max(1, parseInt(value ?? String(fallback), 10) || fallback));
}

export function parseWorkoutProgramId(value?: string | null) {
  const id = value?.trim();
  return id || DEFAULT_WORKOUT_PROGRAM_ID;
}

export function dayHasTrainingContent(day: {
  exercises?: WorkoutProgramExercise[];
  cardio?: ProgramCardio | null;
}): boolean {
  return (day.exercises?.length ?? 0) > 0 || Boolean(day.cardio);
}

/** Empty days default to rest day until exercises or cardio are added. */
export function resolveProgramDayRestDay(day: {
  exercises?: WorkoutProgramExercise[];
  cardio?: ProgramCardio | null;
  rest_day?: boolean;
}): boolean {
  return !dayHasTrainingContent(day);
}
