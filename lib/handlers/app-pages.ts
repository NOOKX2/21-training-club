import { NextRequest } from "next/server";
import {
  getCoaches,
  getFormChecksForUserWeekDay,
  getMealsForUser,
  getMessages,
  getNutritionLimits,
  getNutritionScoreTrend,
  getProgressPhotos,
  getUserHeight,
  getWeeklyReports,
  getWeightHistory,
  getWorkoutPageData,
} from "../data";
import { localDateKey } from "../date-utils";
import { getCurrentUser } from "../auth";
import { json, error, handleAuthError } from "../api-helpers";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "../program-schedule";

function parseNutritionDate(raw: string | null): string {
  const today = localDateKey(new Date());
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return today;
  if (raw > today) return today;
  return raw;
}

export async function handleAppPages(
  req: NextRequest,
  segments: string[]
): Promise<Response> {
  if (req.method !== "GET") {
    return error("Method not allowed", 405);
  }

  try {
    const user = await getCurrentUser(req);
    const page = segments[1];

    if (page === "workouts") {
      const params = req.nextUrl.searchParams;
      let week = Math.min(
        4,
        Math.max(1, parseInt(params.get("week") ?? "0", 10) || 1)
      );
      let day = Math.min(
        7,
        Math.max(1, parseInt(params.get("day") ?? "0", 10) || 1)
      );

      if (!params.has("week") && !params.has("day")) {
        const programDay = getProgramWeekDay(resolveProgramStartDate(user));
        week = programDay.week;
        day = programDay.day;
      }

      const [{ days, logs, cardioLog }, formChecks] = await Promise.all([
        getWorkoutPageData(user.id, user.email, week, day),
        getFormChecksForUserWeekDay(user.id, week, day),
      ]);

      return json({
        userId: user.id,
        week,
        day,
        days,
        logs,
        cardioLog,
        formChecks,
      });
    }

    if (page === "nutrition") {
      const selectedDate = parseNutritionDate(req.nextUrl.searchParams.get("date"));
      const today = localDateKey(new Date());
      const [meals, scoreTrend, limits] = await Promise.all([
        getMealsForUser(user.id, selectedDate),
        getNutritionScoreTrend(user.id, 7, selectedDate),
        getNutritionLimits(user.email),
      ]);

      return json({
        userId: user.id,
        selectedDate,
        isToday: selectedDate === today,
        meals,
        scoreTrend,
        limits,
      });
    }

    if (page === "progress") {
      const [history, photos, height] = await Promise.all([
        getWeightHistory(user.id),
        getProgressPhotos(user.id),
        getUserHeight(user.id),
      ]);

      return json({
        userId: user.id,
        history,
        photos,
        height,
      });
    }

    if (page === "coach") {
      const coachParam = req.nextUrl.searchParams.get("coach") ?? undefined;
      const coaches = await getCoaches();
      const coachId =
        coachParam && coaches.some((c) => c.id === coachParam)
          ? coachParam
          : (coaches[0]?.id ?? "");
      const [messages, weeklyReports] = await Promise.all([
        coachId ? getMessages(user.id, coachId) : Promise.resolve([]),
        getWeeklyReports(user.id),
      ]);

      return json({
        userId: user.id,
        coachId,
        coaches,
        messages,
        weeklyReports,
        programStartDate: resolveProgramStartDate(user),
      });
    }

    return error("Not found", 404);
  } catch (e) {
    return handleAuthError(e);
  }
}
