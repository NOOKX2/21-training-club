import { NextRequest } from "next/server";
import { getCurrentUser } from "../auth";
import { json, error, handleAuthError } from "../api-helpers";
import { localDateKey } from "../date-utils";
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
import { getProgramWeekDay, resolveProgramStartDate } from "../program-schedule";

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
  try {
    const user = await getCurrentUser(req);
    const page = segments[1];

    if (page === "nutrition" && req.method === "GET") {
      const selectedDate = parseNutritionDate(req.nextUrl.searchParams.get("date"));
      const today = localDateKey(new Date());
      const [meals, scoreTrend, limits] = await Promise.all([
        getMealsForUser(user.id, selectedDate),
        getNutritionScoreTrend(user.id, 7, selectedDate),
        getNutritionLimits(user.email),
      ]);
      return json({ meals, scoreTrend, limits, selectedDate, isToday: selectedDate === today });
    }

    if (page === "workouts" && req.method === "GET") {
      const params = req.nextUrl.searchParams;
      const hasWeekParam = params.has("week");
      const hasDayParam = params.has("day");
      const programStartDate = resolveProgramStartDate({
        access_starts_at: user.access_starts_at ?? null,
      });
      const defaultSchedule = getProgramWeekDay(programStartDate);

      if (!hasWeekParam && !hasDayParam) {
        return json({
          needsRedirect: true,
          week: defaultSchedule.week,
          day: defaultSchedule.day,
        });
      }

      const week = Math.min(4, Math.max(1, parseInt(params.get("week") ?? "1", 10) || 1));
      const day = Math.min(7, Math.max(1, parseInt(params.get("day") ?? "1", 10) || 1));
      const [{ days, logs, cardioLog }, formChecks] = await Promise.all([
        getWorkoutPageData(user.id, user.email, week, day),
        getFormChecksForUserWeekDay(user.id, week, day),
      ]);
      return json({ week, day, days, logs, cardioLog, formChecks });
    }

    if (page === "progress" && req.method === "GET") {
      const [history, photos, height] = await Promise.all([
        getWeightHistory(user.id),
        getProgressPhotos(user.id),
        getUserHeight(user.id),
      ]);
      return json({ history, photos, height });
    }

    if (page === "coach" && req.method === "GET") {
      const coaches = await getCoaches();
      const coachParam = req.nextUrl.searchParams.get("coach");
      const coachId =
        coachParam && coaches.some((coach) => coach.id === coachParam)
          ? coachParam
          : (coaches[0]?.id ?? "");
      const [messages, weeklyReports] = await Promise.all([
        coachId ? getMessages(user.id, coachId) : Promise.resolve([]),
        getWeeklyReports(user.id),
      ]);
      const programStartDate = resolveProgramStartDate({
        access_starts_at: user.access_starts_at ?? null,
      });
      return json({ coaches, coachId, messages, weeklyReports, programStartDate });
    }
  } catch (e) {
    return handleAuthError(e);
  }
  return error("Not found", 404);
}
