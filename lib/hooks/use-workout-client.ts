"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { useMuscleReward } from "@/components/MuscleStreakContext";
import type { ExerciseLogState } from "@/app/(app)/workouts/_components/types";
import { api } from "@/lib/api-client";
import type { CardioLog, FormCheckSubmission, WorkoutExercise, WorkoutSetEntry } from "@/lib/data";
import { workoutWeekKey, type WorkoutWeekPageData } from "@/lib/hooks/use-app-page";
import { useWorkoutFormChecks } from "@/lib/hooks/workout/use-workout-form-checks";
import {
  countCompletedSets,
  countWorkoutSets,
  formChecksByExerciseId,
  initialCompletedSets,
  normalizeLogsForExercises,
} from "@/lib/hooks/workout/workout-client-utils";

export function useWorkoutClient({
  userId,
  week,
  day,
  exercises,
  initialLogs,
  initialCardioLog,
  initialFormChecks = [],
  hasCardio = false,
  onNavigate,
  t,
}: {
  userId: string;
  week: number;
  day: number;
  exercises: WorkoutExercise[];
  initialLogs: Record<string, ExerciseLogState>;
  initialCardioLog: CardioLog;
  initialFormChecks?: FormCheckSubmission[];
  hasCardio?: boolean;
  onNavigate?: (day: number) => void;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { celebrateMuscleTask } = useMuscleReward();

  const normalizedInitialLogs = useMemo(
    () => normalizeLogsForExercises(exercises, initialLogs),
    [exercises, initialLogs]
  );

  const [logs, setLogs] = useState(normalizedInitialLogs);
  const [completedSets, setCompletedSets] = useState(() =>
    initialCompletedSets(exercises, normalizedInitialLogs)
  );
  const [cardioLog, setCardioLog] = useState(initialCardioLog);
  const [savingAll, setSavingAll] = useState(false);
  const [allSaved, setAllSaved] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const navigationKey = `${week}:${day}`;
  const prevNavigationKey = useRef<string | null>(null);

  const formChecksApi = useWorkoutFormChecks({
    day,
    week,
    initialFormChecks,
    t,
    setMessages,
  });
  const { resetFormChecks, uploadFormCheck, formCheckButtonLabel, formChecks, uploadingFormCheckId } =
    formChecksApi;

  useEffect(() => {
    const isNavigation = prevNavigationKey.current !== navigationKey;
    const nextLogs = normalizeLogsForExercises(exercises, initialLogs);

    if (isNavigation) {
      prevNavigationKey.current = navigationKey;
      setLogs(nextLogs);
      setCompletedSets(initialCompletedSets(exercises, nextLogs));
      setCardioLog(initialCardioLog);
      resetFormChecks(initialFormChecks);
      setAllSaved(false);
      setShowProgress(false);
      setMessages({});
      return;
    }

    setLogs((prev) => {
      const merged = { ...nextLogs };
      for (const exercise of exercises) {
        if (prev[exercise.id]) {
          merged[exercise.id] = ensureMergedLog(exercise, nextLogs[exercise.id], prev[exercise.id]);
        }
      }
      return merged;
    });
    setCardioLog((prev) => {
      const hasLocalCardio =
        prev.duration_minutes.trim() ||
        prev.distance_km.trim() ||
        prev.calories_burned.trim();
      return hasLocalCardio ? prev : initialCardioLog;
    });
  }, [
    navigationKey,
    exercises,
    initialLogs,
    initialCardioLog,
    initialFormChecks,
    resetFormChecks,
  ]);

  const totalSets = useMemo(() => countWorkoutSets(exercises, logs), [exercises, logs]);
  const completedSetCount = useMemo(
    () => countCompletedSets(completedSets),
    [completedSets]
  );

  const updateWorkoutWeekCache = useCallback(
    (updater: (slice: WorkoutWeekPageData["byDay"][number]) => WorkoutWeekPageData["byDay"][number]) => {
      void mutate(
        workoutWeekKey(week),
        (current?: WorkoutWeekPageData) => {
          if (!current?.byDay[day]) return current;
          return {
            ...current,
            byDay: { ...current.byDay, [day]: updater(current.byDay[day]) },
          };
        },
        { revalidate: false }
      );
    },
    [day, mutate, week]
  );

  const navigate = useCallback(
    (nextDay: number) => {
      if (onNavigate) {
        onNavigate(nextDay);
        return;
      }
      router.push(`/workouts?week=${week}&day=${nextDay}`);
    },
    [onNavigate, router, week]
  );

  const addSet = useCallback((exerciseId: string) => {
    setLogs((prev) => {
      const entry = prev[exerciseId];
      const sets = [...(entry?.sets ?? [])];
      sets.push({
        weight: sets.at(-1)?.weight ?? "",
        reps: sets.at(-1)?.reps ?? "",
      });
      return {
        ...prev,
        [exerciseId]: {
          actual_weight: entry?.actual_weight ?? "",
          actual_reps: entry?.actual_reps ?? "",
          sets,
        },
      };
    });
    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] ?? []), false],
    }));
  }, []);

  const removeSet = useCallback((exerciseId: string, setIndex: number) => {
    setLogs((prev) => {
      const entry = prev[exerciseId];
      const sets = [...(entry?.sets ?? [])];
      if (sets.length <= 1) return prev;
      sets.splice(setIndex, 1);
      return {
        ...prev,
        [exerciseId]: {
          actual_weight: entry?.actual_weight ?? "",
          actual_reps: entry?.actual_reps ?? "",
          sets,
        },
      };
    });
    setCompletedSets((prev) => {
      const flags = [...(prev[exerciseId] ?? [])];
      if (flags.length <= 1) return prev;
      flags.splice(setIndex, 1);
      return { ...prev, [exerciseId]: flags };
    });
  }, []);

  const updateSet = useCallback(
    (exerciseId: string, setIndex: number, field: "weight" | "reps", value: string) => {
      setLogs((prev) => {
        const entry = prev[exerciseId];
        const sets = [...(entry?.sets ?? [])];
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        return {
          ...prev,
          [exerciseId]: {
            actual_weight: entry?.actual_weight ?? "",
            actual_reps: entry?.actual_reps ?? "",
            sets,
          },
        };
      });
    },
    []
  );

  const toggleSetComplete = useCallback((exerciseId: string, setIndex: number) => {
    setShowProgress(true);
    setCompletedSets((prev) => {
      const flags = [...(prev[exerciseId] ?? [])];
      flags[setIndex] = !flags[setIndex];
      return { ...prev, [exerciseId]: flags };
    });
  }, []);

  const saveExerciseLog = useCallback(
    async (exerciseId: string, entry: ExerciseLogState, exerciseName?: string) => {
      const sets = entry.sets ?? [];
      const saved = await api<{
        exercise_id: string;
        actual_weight: string;
        actual_reps: string;
        sets?: WorkoutSetEntry[];
      }>("workouts/log", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          week,
          day,
          actual_weight: sets[0]?.weight ?? entry.actual_weight ?? "0",
          actual_reps: sets[0]?.reps ?? entry.actual_reps ?? "0",
          sets,
        }),
      });

      const logEntry: ExerciseLogState = {
        actual_weight: saved.actual_weight,
        actual_reps: saved.actual_reps,
        sets: saved.sets,
      };

      setLogs((prev) => ({ ...prev, [exerciseId]: logEntry }));
      updateWorkoutWeekCache((slice) => ({
        ...slice,
        logs: {
          ...slice.logs,
          [exerciseId]: {
            exercise_id: exerciseId,
            exercise_name: exerciseName,
            actual_weight: saved.actual_weight,
            actual_reps: saved.actual_reps,
            sets: saved.sets,
          },
        },
      }));

      return logEntry;
    },
    [day, updateWorkoutWeekCache, userId, week]
  );

  const saveCardioLog = useCallback(async () => {
    const saved = await api<CardioLog>("workouts/cardio-log", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        week,
        day,
        duration_minutes: cardioLog.duration_minutes,
        distance_km: cardioLog.distance_km,
        calories_burned: cardioLog.calories_burned,
      }),
    });
    setCardioLog(saved);
    updateWorkoutWeekCache((slice) => ({ ...slice, cardioLog: saved }));
  }, [cardioLog, day, updateWorkoutWeekCache, userId, week]);

  const saveAllLogs = useCallback(async () => {
    if (!exercises.length && !hasCardio) return;

    setSavingAll(true);
    setMessages((m) => ({ ...m, _all: "" }));

    let savedAny = false;
    const errors: string[] = [];

    try {
      for (const exercise of exercises) {
        const entry = logs[exercise.id];
        if (!entry?.sets?.length) continue;

        try {
          await saveExerciseLog(exercise.id, entry, exercise.name);
          savedAny = true;
        } catch (err) {
          const message = err instanceof Error ? err.message : t("common.saveFailed");
          errors.push(`${exercise.name}: ${message}`);
          setMessages((m) => ({ ...m, [exercise.id]: message }));
        }
      }

      const hasCardioData =
        cardioLog.duration_minutes.trim() ||
        cardioLog.distance_km.trim() ||
        cardioLog.calories_burned.trim();

      if (hasCardio && hasCardioData) {
        try {
          await saveCardioLog();
          savedAny = true;
        } catch (err) {
          const message = err instanceof Error ? err.message : t("common.saveFailed");
          errors.push(message);
          setMessages((m) => ({ ...m, cardio: message }));
        }
      }

      if (errors.length) {
        setMessages((m) => ({ ...m, _all: errors[0] }));
      } else if (savedAny) {
        setCompletedSets((prev) => {
          const next: Record<string, boolean[]> = { ...prev };
          for (const exercise of exercises) {
            const sets = logs[exercise.id]?.sets ?? [];
            next[exercise.id] = sets.map(
              (set, index) =>
                Boolean(prev[exercise.id]?.[index]) ||
                Boolean(set.weight.trim() && set.reps.trim())
            );
          }
          return next;
        });
        setAllSaved(true);
        setShowProgress(true);
        setTimeout(() => setAllSaved(false), 2000);
        celebrateMuscleTask("workout");
      }
    } finally {
      setSavingAll(false);
    }
  }, [
    cardioLog,
    celebrateMuscleTask,
    exercises,
    hasCardio,
    logs,
    saveCardioLog,
    saveExerciseLog,
    t,
  ]);

  return {
    logs,
    completedSets,
    cardioLog,
    setCardioLog,
    formChecks,
    uploadingFormCheckId,
    savingAll,
    allSaved,
    showProgress,
    totalSets,
    completedSetCount,
    messages,
    navigate,
    uploadFormCheck,
    formCheckButtonLabel,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    saveAllLogs,
  };
}

function ensureMergedLog(
  exercise: WorkoutExercise,
  serverLog: ExerciseLogState,
  localLog: ExerciseLogState
): ExerciseLogState {
  if (!localLog.sets?.length) return serverLog;
  if (!serverLog.sets?.length) return localLog;

  const sets = localLog.sets.map((set, index) => {
    const saved = serverLog.sets?.[index];
    if (!saved) return set;
    const hasLocal =
      set.weight.trim() !== saved.weight.trim() || set.reps.trim() !== saved.reps.trim();
    return hasLocal ? set : saved;
  });

  return {
    actual_weight: localLog.actual_weight || serverLog.actual_weight,
    actual_reps: localLog.actual_reps || serverLog.actual_reps,
    sets,
  };
}

// Re-export for tests or other modules that need initial form check mapping.
export { formChecksByExerciseId };
