"use client";

import { MacroLimitBox } from "@/app/(app)/nutrition/_components/MacroLimitBox";
import { clientCard, clientCardInner, clientSectionLabel } from "@/lib/client-ui";
import type { NutritionLimits } from "@/lib/data";
import {
  averageMealRating,
  coachRatingStyle,
  limitValueClass,
  macrosToKcal,
} from "@/lib/nutrition-utils";
import { cn } from "@/lib/utils";

export function NutritionDailyTotals({
  analyzing,
  totalKcal,
  overallScore,
  totals,
  limits,
  labels,
}: {
  analyzing: boolean;
  totalKcal: number;
  overallScore: number | null;
  totals: { protein: number; carbs: number; fat: number };
  limits: NutritionLimits;
  labels: {
    dailyTotals: string;
    analyzingMeals: string;
    totalKcal: string;
    overallFoodScore: string;
    protein: string;
    carb: string;
    fat: string;
  };
}) {
  const overallStyle = overallScore != null ? coachRatingStyle(overallScore) : null;

  return (
    <div className={cn(clientCard, "p-4 sm:p-5")}>
      <div className="flex items-center justify-between gap-3">
        <p className={clientSectionLabel}>{labels.dailyTotals}</p>
        {analyzing ? (
          <p className="text-xs text-white/45">{labels.analyzingMeals}</p>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <div className={cn(clientCardInner, "px-4 py-4 text-center")}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
            {labels.totalKcal}
          </p>
          <p className={`mt-1 text-3xl font-bold ${limitValueClass(totalKcal, limits.calories)}`}>
            {totalKcal}
            {limits.calories ? (
              <span className="text-sm font-normal text-white/45"> / {limits.calories}</span>
            ) : null}
            <span className="ml-1 text-sm font-normal text-white/45">kcal</span>
          </p>
        </div>
        <div className={cn(clientCardInner, "px-4 py-4 text-center")}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
            {labels.overallFoodScore}
          </p>
          {overallScore != null && overallStyle ? (
            <p className={`mt-1 text-3xl font-bold ${overallStyle.className}`}>
              {overallScore.toFixed(1)}
              <span className="ml-1 text-sm font-normal text-white/45">/5</span>
            </p>
          ) : (
            <p className="mt-1 text-3xl font-bold text-white/25">—</p>
          )}
          {overallStyle ? (
            <p className={`mt-1 text-xs font-semibold ${overallStyle.className}`}>
              {overallStyle.label}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
        <MacroLimitBox label={labels.protein} consumed={totals.protein} limit={limits.protein} />
        <MacroLimitBox label={labels.carb} consumed={totals.carbs} limit={limits.carbs} />
        <MacroLimitBox label={labels.fat} consumed={totals.fat} limit={limits.fat} />
      </div>
    </div>
  );
}
