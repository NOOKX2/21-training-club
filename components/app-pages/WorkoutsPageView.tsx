"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WorkoutClient } from "@/components/WorkoutClient";
import { useAppUser } from "@/components/AppUserProvider";
import { useWorkoutsPage } from "@/lib/hooks/use-app-page";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "@/lib/program-schedule";
import { replaceAppUrl } from "@/lib/sync-url";

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
  const { data } = useWorkoutsPage(week, day);

  useEffect(() => {
    const next = parseWeekDay(
      searchParams.get("week"),
      searchParams.get("day"),
      user
    );
    setWeek(next.week);
    setDay(next.day);
  }, [searchParams, user]);

  const navigate = useCallback((nextWeek: number, nextDay: number) => {
    setWeek(nextWeek);
    setDay(nextDay);
    replaceAppUrl("/workouts", { week: nextWeek, day: nextDay });
  }, []);

  if (!data || data.week !== week || data.day !== day) return null;

  return (
    <WorkoutClient
      key={`${week}-${day}`}
      userId={data.userId}
      week={week}
      day={day}
      days={data.days}
      initialLogs={data.logs}
      initialCardioLog={data.cardioLog}
      initialFormChecks={data.formChecks}
      onNavigate={navigate}
    />
  );
}
