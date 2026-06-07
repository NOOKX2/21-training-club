"use client";

import { useMemo } from "react";
import { NutritionHeader } from "@/components/NutritionHeader";
import { NutritionScoreChart } from "@/components/NutritionScoreChart";
import type { DailyNutritionScore, MealSubmission, NutritionLimits } from "@/lib/data";
import { clientCard, clientCardInner, clientSectionLabel } from "@/lib/client-ui";
import {
  averageMealRating,
  coachRatingStyle,
  formatMealMacros,
  limitValueClass,
  macrosToKcal,
  mealDisplayName,
  sumMealMacros,
} from "@/lib/nutrition-utils";
import { cn } from "@/lib/utils";

export function NutritionClient({
  meals,
  scoreTrend,
  limits,
  selectedDate,
  isToday,
}: {
  meals: MealSubmission[];
  scoreTrend: DailyNutritionScore[];
  limits: NutritionLimits;
  selectedDate: string;
  isToday: boolean;
}) {
  const totals = sumMealMacros(meals);
  const totalKcal = macrosToKcal(totals);
  const overallScore = averageMealRating(meals);
  const overallStyle = overallScore != null ? coachRatingStyle(overallScore) : null;
  const chartScores = useMemo(() => {
    const trend = scoreTrend.map((day) => ({ ...day }));
    if (trend.length > 0 && overallScore != null) {
      trend[trend.length - 1] = {
        ...trend[trend.length - 1],
        score: overallScore,
      };
    }
    return trend;
  }, [scoreTrend, overallScore]);
  const hasMacroTotals = totals.protein > 0 || totals.carbs > 0 || totals.fat > 0;
  const hasLimits =
    (limits.calories ?? 0) > 0 ||
    (limits.protein ?? 0) > 0 ||
    (limits.carbs ?? 0) > 0 ||
    (limits.fat ?? 0) > 0;
  const showDailyTotals = meals.length > 0 || hasLimits;

  return (
    <div className="space-y-6">
      <NutritionHeader selectedDate={selectedDate} isToday={isToday} />

      <div className={cn(clientCard, "p-5")}>
        <p className={clientSectionLabel}>7-Day Food Score</p>
        <div className="mt-4">
          <NutritionScoreChart dailyScores={chartScores} />
        </div>
      </div>

      {showDailyTotals && (
        <div className={cn(clientCard, "p-5")}>
          <p className={clientSectionLabel}>Daily Totals</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className={cn(clientCardInner, "px-4 py-4 text-center")}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Total Kcal
              </p>
              <p
                className={`mt-1 text-3xl font-bold ${limitValueClass(totalKcal, limits.calories)}`}
              >
                {totalKcal}
                {limits.calories ? (
                  <span className="text-sm font-normal text-white/45"> / {limits.calories}</span>
                ) : null}
                <span className="ml-1 text-sm font-normal text-white/45">kcal</span>
              </p>
            </div>
            <div className={cn(clientCardInner, "px-4 py-4 text-center")}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Overall Food Score
              </p>
              {overallScore != null && overallStyle ? (
                <p className={`mt-1 text-3xl font-bold ${overallStyle.className}`}>
                  {overallScore.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-white/45">/5</span>
                </p>
              ) : (
                <p className="mt-1 text-3xl font-bold text-white/25">—</p>
              )}
              {overallStyle && (
                <p className={`mt-1 text-xs font-semibold ${overallStyle.className}`}>
                  {overallStyle.label}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <MacroLimitBox label="Protein" consumed={totals.protein} limit={limits.protein} />
            <MacroLimitBox label="Carb" consumed={totals.carbs} limit={limits.carbs} />
            <MacroLimitBox label="Fat" consumed={totals.fat} limit={limits.fat} />
          </div>
        </div>
      )}

      <div>
        <p className={cn(clientSectionLabel, "mb-4")}>Today&apos;s Meals</p>
        <div className={cn(clientCard, "overflow-hidden")}>
          {meals.length === 0 ? (
            <p className="p-8 text-center text-white/45">
              {isToday
                ? "No meals logged today. Tap + Add Meal to submit to your coach."
                : "No meals logged on this day."}
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {meals.map((m) => {
                const ratingStyle =
                  m.coach_rating != null ? coachRatingStyle(m.coach_rating) : null;
                return (
                  <li key={m.id} className="flex gap-4 px-6 py-5">
                    {m.photo_base64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo_base64}
                        alt={`Meal ${m.meal_number}`}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-black/40 text-xs text-white/30">
                        No photo
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white">{mealDisplayName(m)}</p>
                      {m.description && (
                        <p className="mt-1 text-sm text-white/45">{m.description}</p>
                      )}
                      <p className="mt-2 text-xs text-white/35">
                        {m.coach_reviewed ? "Reviewed by coach" : "Pending coach review"}
                      </p>
                      {m.coach_reviewed && formatMealMacros(m) && (
                        <p className="mt-2 text-sm text-white/45">{formatMealMacros(m)}</p>
                      )}
                      {m.coach_reviewed && m.coach_feedback && (
                        <p className="mt-1 text-sm text-white/60">{m.coach_feedback}</p>
                      )}
                    </div>
                    {m.coach_reviewed && m.coach_rating != null && ratingStyle && (
                      <div className="shrink-0 text-right">
                        <p className={`text-sm font-semibold ${ratingStyle.className}`}>
                          {m.coach_rating}/5 — {ratingStyle.label}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function MacroLimitBox({
  label,
  consumed,
  limit,
}: {
  label: string;
  consumed: number;
  limit?: number;
}) {
  return (
    <div className={cn(clientCardInner, "px-4 py-3 text-center")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${limitValueClass(consumed, limit)}`}>
        {consumed}
        {limit ? <span className="text-sm font-normal text-white/45"> / {limit}</span> : null}
        <span className="ml-1 text-sm font-normal text-white/45">g</span>
      </p>
    </div>
  );
}
