import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/lib/api-client";
import { CLIENT_WORKOUT_LOG_WEEK, workoutWeekKey } from "@/lib/app-page-keys";
import { replaceAppUrl } from "@/lib/sync-url";
import type { ProgramExercise } from "@/lib/data";
import type {
  ExerciseVideoOption,
  UserWorkoutDayDoc,
} from "@/lib/workout-program-shared";
import { resolveProgramDayRestDay } from "@/lib/workout-program-shared";
import { consumeExercisePickerResult } from "@/lib/workout-exercise-picker";

export type DayDraft = {
  restDay: boolean;
  exercises: ProgramExercise[];
};

type Feedback = { error: string; message: string };

const emptyFeedback: Feedback = { error: "", message: "" };

export function dayDraftFromSaved(days: UserWorkoutDayDoc[], day: number): DayDraft {
  const dayDoc = days.find((entry) => entry.day === day);
  const exercises = dayDoc?.exercises?.length
    ? dayDoc.exercises.map((exercise) => ({ ...exercise }))
    : [];
  return {
    restDay: resolveProgramDayRestDay({
      exercises,
      cardio: dayDoc?.cardio ?? null,
      rest_day: dayDoc?.rest_day,
    }),
    exercises,
  };
}

export function dayHasSavedProgram(days: UserWorkoutDayDoc[], day: number): boolean {
  const dayDoc = days.find((entry) => entry.day === day);
  if (!dayDoc) return false;
  return Boolean(dayDoc.rest_day) || (dayDoc.exercises?.length ?? 0) > 0;
}

function initialEditingByDay(
  days: UserWorkoutDayDoc[],
  startInEditMode: boolean
): Record<number, boolean> {
  const editing: Record<number, boolean> = {};
  for (let day = 1; day <= 7; day++) {
    editing[day] = startInEditMode || !dayHasSavedProgram(days, day);
  }
  return editing;
}

function newExerciseRow(): ProgramExercise {
  return {
    id: uuidv4(),
    name: "",
    target_sets: 3,
    target_reps: "12",
    demo_video_id: null,
  };
}

export function useWorkoutProgramEditor({
  programId,
  returnDay = 1,
  initialProgramName,
  initialDays,
  initialVideos,
  startInEditMode = false,
  t,
}: {
  programId: string;
  returnDay?: number;
  initialProgramName: string;
  initialDays: UserWorkoutDayDoc[];
  initialVideos: ExerciseVideoOption[];
  startInEditMode?: boolean;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [editDay, setEditDay] = useState(returnDay);
  const [savedDays, setSavedDays] = useState(initialDays);
  const [drafts, setDrafts] = useState<Record<number, DayDraft>>({});
  const [videos, setVideos] = useState(initialVideos);
  const [programName, setProgramName] = useState(initialProgramName);
  const [savedProgramName, setSavedProgramName] = useState(initialProgramName);
  const [feedback, setFeedback] = useState<Feedback>(emptyFeedback);
  const [saving, setSaving] = useState(false);
  const [editingByDay, setEditingByDay] = useState(() =>
    initialEditingByDay(initialDays, startInEditMode)
  );
  const [createExerciseOpen, setCreateExerciseOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [creatingExercise, setCreatingExercise] = useState(false);

  useEffect(() => {
    setEditDay(returnDay);
  }, [returnDay]);

  useEffect(() => {
    const result = consumeExercisePickerResult();
    if (!result || result.programId !== programId || result.day !== editDay) return;

    setEditingByDay((current) => ({ ...current, [editDay]: true }));
    setDrafts((current) => {
      const base = current[editDay] ?? dayDraftFromSaved(savedDays, editDay);
      const byVideoId = new Map(
        base.exercises
          .filter((exercise) => exercise.demo_video_id)
          .map((exercise) => [exercise.demo_video_id as string, exercise])
      );

      const nextExercises: ProgramExercise[] = [];
      for (const videoId of result.selectedIds) {
        const existing = byVideoId.get(videoId);
        if (existing) {
          nextExercises.push(existing);
          continue;
        }
        const video = videos.find((entry) => entry.id === videoId);
        if (!video) continue;
        nextExercises.push({
          id: uuidv4(),
          name: video.name,
          target_sets: 3,
          target_reps: "12",
          demo_video_id: videoId,
        });
      }

      for (const exercise of base.exercises) {
        if (!exercise.demo_video_id) {
          nextExercises.push(exercise);
        }
      }

      return {
        ...current,
        [editDay]: {
          restDay: nextExercises.length === 0 ? base.restDay : false,
          exercises: nextExercises,
        },
      };
    });
    setFeedback({ error: "", message: t("workouts.exercisePickerAdded") });
  }, [editDay, programId, savedDays, t, videos]);

  const draft = drafts[editDay] ?? dayDraftFromSaved(savedDays, editDay);
  const isEditing = editingByDay[editDay] ?? true;
  const dayIsSaved = dayHasSavedProgram(savedDays, editDay);

  const updateDraft = useCallback(
    (updater: (current: DayDraft) => DayDraft) => {
      if (!isEditing) return;
      setDrafts((current) => ({
        ...current,
        [editDay]: updater(current[editDay] ?? dayDraftFromSaved(savedDays, editDay)),
      }));
    },
    [editDay, isEditing, savedDays]
  );

  const selectDay = useCallback((day: number) => {
    setEditDay(day);
    replaceAppUrl("/workouts/program/edit", {
      program: programId,
      day,
      mode: startInEditMode || editingByDay[day] ? "edit" : undefined,
    });
    setFeedback(emptyFeedback);
    setCreateExerciseOpen(false);
    setNewExerciseName("");
  }, [editingByDay, programId, startInEditMode]);

  const startEditing = useCallback(() => {
    setEditingByDay((current) => ({ ...current, [editDay]: true }));
    setFeedback(emptyFeedback);
  }, [editDay]);

  const cancelEditing = useCallback(() => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[editDay];
      return next;
    });
    setCreateExerciseOpen(false);
    setNewExerciseName("");
    setEditingByDay((current) => ({ ...current, [editDay]: false }));
    setFeedback(emptyFeedback);
  }, [editDay]);

  const refreshWorkoutCache = useCallback(() => {
    void mutate(workoutWeekKey(CLIENT_WORKOUT_LOG_WEEK));
  }, [mutate]);

  const addExercise = useCallback(() => {
    updateDraft((current) => ({
      ...current,
      exercises: [...current.exercises, newExerciseRow()],
    }));
  }, [updateDraft]);

  const updateExercise = useCallback(
    (id: string, patch: Partial<ProgramExercise>) => {
      updateDraft((current) => ({
        ...current,
        exercises: current.exercises.map((exercise) =>
          exercise.id === id ? { ...exercise, ...patch } : exercise
        ),
      }));
    },
    [updateDraft]
  );

  const removeExercise = useCallback(
    (id: string) => {
      updateDraft((current) => ({
        ...current,
        exercises: current.exercises.filter((exercise) => exercise.id !== id),
      }));
    },
    [updateDraft]
  );

  const selectVideo = useCallback(
    (id: string, videoId: string) => {
      const video = videos.find((entry) => entry.id === videoId);
      updateExercise(id, {
        demo_video_id: videoId || null,
        name: video?.name ?? "",
      });
    },
    [updateExercise, videos]
  );

  const setRestDay = useCallback(
    (checked: boolean) => {
      updateDraft((current) => ({
        restDay: checked,
        exercises: checked ? [] : current.exercises,
      }));
    },
    [updateDraft]
  );

  const closeCreateExercise = useCallback(() => {
    setCreateExerciseOpen(false);
    setNewExerciseName("");
  }, []);

  const createExerciseOption = useCallback(async () => {
    const name = newExerciseName.trim();
    if (!name) {
      setFeedback({ error: t("workouts.exerciseNameRequired"), message: "" });
      return;
    }
    setCreatingExercise(true);
    setFeedback(emptyFeedback);
    try {
      const created = await api<ExerciseVideoOption>("workouts/exercises", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setVideos((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      closeCreateExercise();
      setFeedback({ error: "", message: t("workouts.exerciseCreated") });
    } catch (err) {
      setFeedback({
        error: err instanceof Error ? err.message : t("common.saveFailed"),
        message: "",
      });
    } finally {
      setCreatingExercise(false);
    }
  }, [closeCreateExercise, newExerciseName, t]);

  const saveProgramName = useCallback(async () => {
    const nextName = programName.trim();
    if (nextName === savedProgramName.trim()) return;
    await api<{ id: string; name: string }>(`workouts/programs/${programId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: nextName }),
    });
    setSavedProgramName(nextName);
    setProgramName(nextName);
  }, [programId, programName, savedProgramName]);

  const saveDay = useCallback(async () => {
    if (!isEditing) return;
    setSaving(true);
    setFeedback(emptyFeedback);
    try {
      if (programName.trim() !== savedProgramName.trim()) {
        await saveProgramName();
      }
      const saved = await api<UserWorkoutDayDoc>(
        `workouts/programs/${programId}/day/${editDay}`,
        {
          method: "PUT",
          body: JSON.stringify({
            exercises: draft.exercises,
            rest_day: draft.restDay,
            cardio: null,
          }),
        }
      );
      setSavedDays((current) =>
        current.map((entry) => (entry.day === editDay ? saved : entry))
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[editDay];
        return next;
      });
      setEditingByDay((current) => ({ ...current, [editDay]: false }));
      refreshWorkoutCache();
      router.refresh();
    } catch (err) {
      setFeedback({
        error: err instanceof Error ? err.message : t("common.saveFailed"),
        message: "",
      });
    } finally {
      setSaving(false);
    }
  }, [
    draft,
    editDay,
    isEditing,
    programId,
    programName,
    refreshWorkoutCache,
    router,
    saveProgramName,
    savedProgramName,
    t,
  ]);

  const persistProgramName = useCallback(async () => {
    if (programName.trim() === savedProgramName.trim()) return;
    setSaving(true);
    setFeedback(emptyFeedback);
    try {
      await saveProgramName();
      setFeedback({ error: "", message: t("workouts.programNameSaved") });
      router.refresh();
    } catch (err) {
      setFeedback({
        error: err instanceof Error ? err.message : t("common.saveFailed"),
        message: "",
      });
    } finally {
      setSaving(false);
    }
  }, [programName, router, saveProgramName, savedProgramName, t]);

  return {
    editDay,
    selectDay,
    draft,
    videos,
    programName,
    setProgramName,
    persistProgramName,
    feedback,
    saving,
    isEditing,
    dayIsSaved,
    startEditing,
    cancelEditing,
    createExerciseOpen,
    setCreateExerciseOpen,
    newExerciseName,
    setNewExerciseName,
    creatingExercise,
    addExercise,
    updateExercise,
    removeExercise,
    selectVideo,
    setRestDay,
    closeCreateExercise,
    createExerciseOption,
    saveDay,
  };
}
