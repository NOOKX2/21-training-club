"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { preload, useSWRConfig } from "swr";
import { WorkoutClient } from "@/app/(app)/workouts/_components/WorkoutClient";
import { useAppUser } from "@/components/AppUserProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { CLIENT_WORKOUT_LOG_WEEK, workoutWeekKey } from "@/lib/app-page-keys";
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
  const [day, setDay] = useState(initialDay);
  const { cache } = useSWRConfig();
  const { data } = useWorkoutWeek(CLIENT_WORKOUT_LOG_WEEK);

  useEffect(() => {
    setDay(parseDay(searchParams.get("day"), user));
  }, [searchParams, user]);

  useEffect(() => {
    void preload(workoutWeekKey(CLIENT_WORKOUT_LOG_WEEK), fetcher);
  }, []);

  const navigate = useCallback((nextDay: number) => {
    setDay(nextDay);
    replaceAppUrl("/workouts", { day: nextDay });
  }, []);

  const weekData = resolveWorkoutWeekData(CLIENT_WORKOUT_LOG_WEEK, data, cache);
  const slice = weekData?.byDay[day];
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

  return (
    <WorkoutClient
      userId={weekData?.userId ?? user.id}
      day={day}
      days={slice?.days ?? []}
      initialLogs={slice?.logs ?? emptyLogs}
      initialCardioLog={slice?.cardioLog ?? emptyCardio}
      initialFormChecks={slice?.formChecks ?? []}
      contentReady={Boolean(slice)}
      activeProgramName={activeProgramName}
      onNavigate={navigate}
    />
  );
}
