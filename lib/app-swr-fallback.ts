import { headers } from "next/headers";
import type { User } from "@/lib/api-client";
import { getWorkoutWeekPageData } from "@/lib/data";
import { workoutWeekKey } from "@/lib/hooks/use-app-page";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "@/lib/program-schedule";

async function parseRequestUrl() {
  const headersList = await headers();
  const rawUrl = headersList.get("x-url") ?? "/workouts";
  return new URL(rawUrl, "http://localhost");
}

export async function buildWorkoutsSwrFallback(
  user: User
): Promise<Record<string, unknown>> {
  const { pathname } = await parseRequestUrl();
  const programWeekDay = getProgramWeekDay(resolveProgramStartDate(user));
  const onWorkouts =
    pathname === "/workouts" || pathname.startsWith("/workouts/");
  const weeks = onWorkouts ? [1, 2, 3, 4] : [programWeekDay.week];
  const fallback: Record<string, unknown> = {};

  await Promise.all(
    weeks.map(async (week) => {
      const byDay = await getWorkoutWeekPageData(user.id, user.email, week);
      fallback[workoutWeekKey(week)] = {
        userId: user.id,
        week,
        defaultDay: programWeekDay.day,
        byDay,
      };
    })
  );

  return fallback;
}
