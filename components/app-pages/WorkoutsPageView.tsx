"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { preload, useSWRConfig } from "swr";
import { WorkoutClient } from "@/components/WorkoutClient";
import { useAppUser } from "@/components/AppUserProvider";
import {
  resolveWorkoutWeekData,
  useWorkoutWeek,
  workoutWeekKey,
} from "@/lib/hooks/use-app-page";
import { api } from "@/lib/api-client";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "@/lib/program-schedule";
import { replaceAppUrl } from "@/lib/sync-url";

const fetcher = <T,>(path: string) => api<T>(path);

function parseWeekDay(
  rawWeek: string | null,
  rawDay: string | null,
  user: ReturnType<typeof useAppUser>
) {
  const hasWeek = rawWeek !== null && rawWeek !== "";
  const hasDay = rawDay !== null && rawDay !== "";
  if (!hasWeek && !hasDay) {
    return getProgramWeekDay(resolveProgramStartDate(user));
  }
  return {
    week: Math.min(4, Math.max(1, parseInt(rawWeek ?? "1", 10) || 1)),
    day: Math.min(7, Math.max(1, parseInt(rawDay ?? "1", 10) || 1)),
  };
}

export function WorkoutsPageView() {
  const user = useAppUser();
  const searchParams = useSearchParams();
  const initial = parseWeekDay(
    searchParams.get("week"),
    searchParams.get("day"),
    user
  );
  const [week, setWeek] = useState(initial.week);
  const [day, setDay] = useState(initial.day);
  const { cache } = useSWRConfig();
  const { data } = useWorkoutWeek(week);

  useEffect(() => {
    const next = parseWeekDay(
      searchParams.get("week"),
      searchParams.get("day"),
      user
    );
    setWeek(next.week);
    setDay(next.day);
  }, [searchParams, user]);

  useEffect(() => {
    for (let w = 1; w <= 4; w += 1) {
      void preload(workoutWeekKey(w), fetcher);
    }
  }, []);

  const navigate = useCallback((nextWeek: number, nextDay: number) => {
    void preload(workoutWeekKey(nextWeek), fetcher);
    setWeek(nextWeek);
    setDay(nextDay);
    replaceAppUrl("/workouts", { week: nextWeek, day: nextDay });
  }, []);

  const weekData = resolveWorkoutWeekData(week, data, cache);
  const slice = weekData?.byDay[day];
  const emptyCardio = {
    duration_minutes: "",
    distance_km: "",
    calories_burned: "",
  };

  return (
    <WorkoutClient
      userId={weekData?.userId ?? user.id}
      week={week}
      day={day}
      days={slice?.days ?? []}
      initialLogs={slice?.logs ?? {}}
      initialCardioLog={slice?.cardioLog ?? emptyCardio}
      initialFormChecks={slice?.formChecks ?? []}
      contentReady={Boolean(slice)}
      onNavigate={navigate}
    />
  );
}
