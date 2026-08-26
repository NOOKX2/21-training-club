import type { ExerciseLogState } from "@/app/(app)/workouts/_components/types";
import type { FormCheckSubmission, WorkoutExercise } from "@/lib/data";

export function ensureExerciseSets(
  exercise: WorkoutExercise,
  log?: ExerciseLogState
): ExerciseLogState {
  const count = Math.max(1, exercise.target_sets || 3);
  const targetReps = String(exercise.target_reps ?? "");

  if (log?.sets?.length) {
    const sets = [...log.sets];
    const lastWeight = sets[sets.length - 1]?.weight ?? "";
    while (sets.length < count) {
      sets.push({ weight: lastWeight, reps: targetReps });
    }
    return {
      actual_weight: log.actual_weight || sets[0]?.weight || "",
      actual_reps: log.actual_reps || sets[0]?.reps || "",
      sets,
    };
  }

  const weight = log?.actual_weight ?? "";
  const reps = log?.actual_reps ?? targetReps;
  const sets = Array.from({ length: count }, () => ({
    weight,
    reps: targetReps || reps,
  }));

  return { actual_weight: weight, actual_reps: reps, sets };
}

export function normalizeLogsForExercises(
  exercises: WorkoutExercise[],
  logs: Record<string, ExerciseLogState>
) {
  const result: Record<string, ExerciseLogState> = {};
  for (const exercise of exercises) {
    result[exercise.id] = ensureExerciseSets(exercise, logs[exercise.id]);
  }
  return result;
}

export function initialCompletedSets(
  exercises: WorkoutExercise[],
  logs: Record<string, ExerciseLogState>
) {
  const result: Record<string, boolean[]> = {};
  for (const exercise of exercises) {
    const sets = logs[exercise.id]?.sets ?? [];
    result[exercise.id] = sets.map(
      (set) => Boolean(set.weight.trim() && set.reps.trim())
    );
  }
  return result;
}

export function initialCustomSetsOpen(logs: Record<string, ExerciseLogState>) {
  const open: Record<string, boolean> = {};
  for (const [exerciseId, log] of Object.entries(logs)) {
    if (log.sets?.length) open[exerciseId] = true;
  }
  return open;
}

export function formChecksByExerciseId(formChecks: FormCheckSubmission[]) {
  const map: Record<string, FormCheckSubmission> = {};
  for (const fc of formChecks) {
    if (fc.exercise_id) map[fc.exercise_id] = fc;
  }
  return map;
}

export function countWorkoutSets(
  exercises: WorkoutExercise[],
  logs: Record<string, ExerciseLogState>
) {
  return exercises.reduce(
    (sum, exercise) => sum + (logs[exercise.id]?.sets?.length ?? exercise.target_sets),
    0
  );
}

export function countCompletedSets(completedSets: Record<string, boolean[]>) {
  return Object.values(completedSets).reduce(
    (sum, flags) => sum + flags.filter(Boolean).length,
    0
  );
}

export function bestWeightFromLog(log?: ExerciseLogState): string | null {
  if (!log) return null;
  const values = [
    ...(log.sets ?? []).map((set) => Number(set.weight)),
    Number(log.actual_weight),
  ].filter((value) => Number.isFinite(value) && value > 0);
  if (!values.length) return null;
  return String(Math.max(...values));
}
