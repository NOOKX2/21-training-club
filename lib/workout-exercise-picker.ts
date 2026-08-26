export const EXERCISE_PICKER_TYPES = EXERCISE_CATALOG_TYPES;
export type ExercisePickerType = ExerciseCatalogType;
export {
  EXERCISE_CATALOG_TYPES,
  EXERCISE_CATALOG_TYPE_LABELS,
  EXERCISE_CATALOG_TYPE_LABELS_TH,
  formatExerciseCatalogType,
  isExerciseCatalogType,
  isExerciseCatalogType as isExercisePickerType,
  resolveExerciseCatalogType,
} from "./exercise-catalog-types";
import {
  EXERCISE_CATALOG_TYPES,
  type ExerciseCatalogType,
  isExerciseCatalogType,
} from "./exercise-catalog-types";

export function availableExercisePickerTypes(
  exercises: ExercisePickerItem[]
): ExercisePickerType[] {
  const present = new Set<string>();
  for (const exercise of exercises) {
    if (exercise.type && isExerciseCatalogType(exercise.type)) {
      present.add(exercise.type);
    }
  }
  return EXERCISE_PICKER_TYPES.filter((type) => present.has(type));
}

export type ExercisePickerItem = {
  id: string;
  name: string;
  hasMedia: boolean;
  source: "library" | "custom";
  type?: string;
  muscle_target?: string;
  equipment?: string;
  difficulty?: string;
  description?: string;
  preview?: {
    type: "image" | "video";
    video_url?: string;
    has_uploaded_file?: boolean;
    media_id?: string;
  };
};

export function exercisePickerVideoSource(
  exercise: ExercisePickerItem
): {
  id: string;
  video_url?: string;
  has_uploaded_file?: boolean;
  media_id?: string;
} | null {
  const preview = exercise.preview;
  if (!preview || preview.type === "image") return null;
  if (!preview.video_url && !preview.has_uploaded_file) return null;
  return {
    id: exercise.id,
    video_url: preview.video_url,
    has_uploaded_file: preview.has_uploaded_file,
    media_id: preview.media_id,
  };
}

export type ExercisePickerContext = {
  programId: string;
  day: number;
  existingVideoIds: string[];
};

export type ExercisePickerResult = {
  programId: string;
  day: number;
  selectedIds: string[];
};

export const EXERCISE_PICKER_CONTEXT_KEY = "workout-exercise-picker-context";
export const EXERCISE_PICKER_RESULT_KEY = "workout-exercise-picker-result";

export function exercisePickerHref(
  programId: string,
  day: number,
  focusId?: string
) {
  const params = new URLSearchParams({ program: programId, day: String(day) });
  if (focusId) params.set("focus", focusId);
  return `/workouts/program/edit/exercises?${params.toString()}`;
}

export function openExercisePickerHref(
  context: ExercisePickerContext,
  focusId?: string
) {
  writeExercisePickerContext(context);
  return exercisePickerHref(context.programId, context.day, focusId);
}

export function editorHref(programId: string, day: number) {
  const params = new URLSearchParams({
    program: programId,
    day: String(day),
    mode: "edit",
  });
  return `/workouts/program/edit?${params.toString()}`;
}

export function writeExercisePickerContext(context: ExercisePickerContext) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EXERCISE_PICKER_CONTEXT_KEY, JSON.stringify(context));
}

export function readExercisePickerContext(): ExercisePickerContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(EXERCISE_PICKER_CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ExercisePickerContext;
  } catch {
    return null;
  }
}

export function writeExercisePickerResult(result: ExercisePickerResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EXERCISE_PICKER_RESULT_KEY, JSON.stringify(result));
}

export function consumeExercisePickerResult(): ExercisePickerResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(EXERCISE_PICKER_RESULT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(EXERCISE_PICKER_RESULT_KEY);
  try {
    return JSON.parse(raw) as ExercisePickerResult;
  } catch {
    return null;
  }
}
