import { NextRequest } from "next/server";
import {
  getCoaches,
  getLiftRecords,
  getMealsForUser,
  getMessages,
  getNutritionLimits,
  getNutritionScoreTrend,
  getProgressPhotos,
  getUserHeight,
  getUserProfilePhotoUrl,
  getUserTdee,
  getWeeklyReports,
  getWeightHistory,
  getWorkoutWeekPageData,
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

      if (!params.has("week")) {
        week = getProgramWeekDay(resolveProgramStartDate(user)).week;
      }

      const byDay = await getWorkoutWeekPageData(user.id, user.email, week);
      const defaultDay = params.has("day")
        ? Math.min(7, Math.max(1, parseInt(params.get("day") ?? "1", 10) || 1))
        : getProgramWeekDay(resolveProgramStartDate(user)).day;

      return json({
        userId: user.id,
        week,
        defaultDay,
        byDay,
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

    if (page === "profile") {
      const [records, profilePhotoUrl, tdee] = await Promise.all([
        getLiftRecords(user.id),
        getUserProfilePhotoUrl(user.id),
        getUserTdee(user.id),
      ]);

      return json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          tier_level: user.tier_level,
          created_at: user.created_at,
          access_expires_at: user.access_expires_at ?? null,
          profile_photo_url: profilePhotoUrl,
          tdee,
        },
        records,
      });
    }

    return error("Not found", 404);
  } catch (e) {
    return handleAuthError(e);
  }
}
