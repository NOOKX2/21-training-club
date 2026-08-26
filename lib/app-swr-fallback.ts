import { headers } from "next/headers";
import type { User } from "@/lib/api-client";
import { parseWorkoutLogWeek, progressPageKey, workoutWeekKey } from "@/lib/app-page-keys";
import { getProgressPageData, getUserMaxWorkoutLogWeek, getWorkoutWeekPageData } from "@/lib/data";
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
  const { searchParams } = await parseRequestUrl();
  const programWeekDay = getProgramWeekDay(resolveProgramStartDate(user));
  const week = parseWorkoutLogWeek(searchParams.get("week"));
  const [{ byDay, activeProgram }, maxLoggedWeek] = await Promise.all([
    getWorkoutWeekPageData(user.id, user.email, week),
    getUserMaxWorkoutLogWeek(user.id),
  ]);

  return {
    [workoutWeekKey(week)]: {
      userId: user.id,
      week,
      maxLoggedWeek,
      defaultDay: programWeekDay.day,
      byDay,
      activeProgram,
    },
  };
}
