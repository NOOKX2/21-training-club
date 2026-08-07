import { headers } from "next/headers";
import type { User } from "@/lib/api-client";
import {
  CLIENT_WORKOUT_LOG_WEEK,
  progressPageKey,
  workoutWeekKey,
} from "@/lib/app-page-keys";
import { getProgressPageData, getWorkoutWeekPageData } from "@/lib/data";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "@/lib/program-schedule";

async function parseRequestUrl() {
  const headersList = await headers();
  const rawUrl = headersList.get("x-url") ?? "/workouts";
  return new URL(rawUrl, "http://localhost");
}

export async function buildAppSwrFallback(
  user: User
): Promise<Record<string, unknown>> {
  const { pathname } = await parseRequestUrl();
  const fallback = await buildWorkoutsSwrFallback(user);

  if (pathname === "/progress" || pathname.startsWith("/progress/")) {
    fallback[progressPageKey()] = await getProgressPageData(user.id);
  }

  return fallback;
}

export async function buildWorkoutsSwrFallback(
  user: User
): Promise<Record<string, unknown>> {
  const programWeekDay = getProgramWeekDay(resolveProgramStartDate(user));
  const week = CLIENT_WORKOUT_LOG_WEEK;
  const byDay = await getWorkoutWeekPageData(user.id, user.email, week);

  return {
    [workoutWeekKey(week)]: {
      userId: user.id,
      week,
      defaultDay: programWeekDay.day,
      byDay: byDay.byDay,
      activeProgram: byDay.activeProgram,
    },
  };
}
