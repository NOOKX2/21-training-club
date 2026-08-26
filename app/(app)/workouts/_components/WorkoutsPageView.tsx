"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { preload, useSWRConfig } from "swr";
import { WorkoutClient } from "@/app/(app)/workouts/_components/WorkoutClient";
import { useAppUser } from "@/components/AppUserProvider";
import { useLanguage } from "@/components/LanguageProvider";
import {
  MAX_WORKOUT_LOG_WEEK,
  parseWorkoutLogWeek,
  readStoredMaxWeek,
  workoutWeekKey,
  writeStoredMaxWeek,
} from "@/lib/app-page-keys";
import { DEFAULT_WORKOUT_PROGRAM_ID } from "@/lib/workout-program-shared";
import {
  resolveWorkoutWeekData,
  useWorkoutWeek,
} from "@/lib/hooks/use-app-page";
import { api } from "@/lib/api-client";
import { getProgramWeekDay, resolveProgramStartDate } from "@/lib/program-schedule";
import { replaceAppUrl } from "@/lib/sync-url";

const fetcher = <T,>(path: string) => api<T>(path);

function parseDay(rawDay: string | null, user: ReturnType<typeof useAppUser>) {
  if (rawDay !== null && rawDay !== "") {
    return Math.min(7, Math.max(1, parseInt(rawDay, 10) || 1));
  }
  return getProgramWeekDay(resolveProgramStartDate(user)).day;
}

export function WorkoutsPageView() {
  const user = useAppUser();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialDay = parseDay(searchParams.get("day"), user);
  const initialWeek = parseWorkoutLogWeek(searchParams.get("week"));
  const [day, setDay] = useState(initialDay);
  const [week, setWeek] = useState(initialWeek);
  const [maxWeek, setMaxWeek] = useState(() =>
    Math.min(MAX_WORKOUT_LOG_WEEK, Math.max(initialWeek, readStoredMaxWeek(user.id)))
  );
  const [deletingWeek, setDeletingWeek] = useState(false);
  const { cache, mutate } = useSWRConfig();
  const { data } = useWorkoutWeek(week);
  const previousWeek = week > 1 ? week - 1 : null;
  const { data: previousWeekData } = useWorkoutWeek(previousWeek);

  useEffect(() => {
    setDay(parseDay(searchParams.get("day"), user));
    setWeek(parseWorkoutLogWeek(searchParams.get("week")));
  }, [searchParams, user]);

  useEffect(() => {
    const stored = readStoredMaxWeek(user.id);
    const logged = data?.maxLoggedWeek ?? 1;
    setMaxWeek(Math.min(MAX_WORKOUT_LOG_WEEK, Math.max(stored, logged, week)));
  }, [data?.maxLoggedWeek, user.id, week]);

  useEffect(() => {
    void preload(workoutWeekKey(week), fetcher);
    if (previousWeek) void preload(workoutWeekKey(previousWeek), fetcher);
  }, [previousWeek, week]);

  const navigate = useCallback(
    (nextDay: number, nextWeek = week) => {
      setDay(nextDay);
      setWeek(nextWeek);
      replaceAppUrl("/workouts", { week: nextWeek, day: nextDay });
    },
    [week]
  );

  const selectWeek = useCallback(
    (nextWeek: number) => {
      navigate(day, nextWeek);
    },
    [day, navigate]
  );

  const addWeek = useCallback(() => {
    const nextWeek = Math.min(MAX_WORKOUT_LOG_WEEK, maxWeek + 1);
    setMaxWeek(nextWeek);
    writeStoredMaxWeek(user.id, nextWeek);
    navigate(day, nextWeek);
  }, [day, maxWeek, navigate, user.id]);

  const deleteWeek = useCallback(async () => {
    if (maxWeek <= 1 || deletingWeek) return;
    if (!window.confirm(t("workouts.deleteWeekConfirm", { n: week }))) return;

    setDeletingWeek(true);
    try {
      await api(`workouts/week/${week}`, { method: "DELETE" });
      await mutate(workoutWeekKey(week));
      const nextMax = week >= maxWeek ? Math.max(1, maxWeek - 1) : maxWeek;
      writeStoredMaxWeek(user.id, nextMax);
      setMaxWeek(nextMax);
      navigate(day, week >= maxWeek ? nextMax : week);
    } finally {
      setDeletingWeek(false);
    }
  }, [day, deletingWeek, maxWeek, mutate, navigate, t, user.id, week]);

  const weekData = resolveWorkoutWeekData(week, data, cache);
  const prevWeekResolved = previousWeek
    ? resolveWorkoutWeekData(previousWeek, previousWeekData, cache)
    : undefined;
  const slice = weekData?.byDay[day];
  const previousLogs = prevWeekResolved?.byDay[day]?.logs ?? {};
  const activeProgramName = weekData?.activeProgram
    ? weekData.activeProgram.id === DEFAULT_WORKOUT_PROGRAM_ID && !weekData.activeProgram.name.trim()
      ? t("workouts.programEditorTitle")
      : weekData.activeProgram.name.trim() || t("workouts.programEditorTitle")
    : null;
  const emptyLogs = useMemo(() => ({}), []);
  const emptyCardio = useMemo(
    () => ({
      duration_minutes: "",
      distance_km: "",
      calories_burned: "",
    }),
    []
  );
  const weeks = useMemo(
    () => Array.from({ length: maxWeek }, (_, index) => index + 1),
    [maxWeek]
  );

  return (
    <WorkoutClient
      userId={weekData?.userId ?? user.id}
      week={week}
      day={day}
      days={slice?.days ?? []}
      initialLogs={slice?.logs ?? emptyLogs}
      initialCardioLog={slice?.cardioLog ?? emptyCardio}
      initialFormChecks={slice?.formChecks ?? []}
      previousLogs={previousLogs}
      contentReady={Boolean(slice)}
      activeProgramName={activeProgramName}
      weeks={weeks}
      deletingWeek={deletingWeek}
      onNavigate={(nextDay) => navigate(nextDay)}
      onSelectWeek={selectWeek}
      onAddWeek={addWeek}
      onDeleteWeek={() => void deleteWeek()}
    />
  );
}
