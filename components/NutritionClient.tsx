"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, RefreshCw } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { NutritionHeader } from "@/components/NutritionHeader";
import { NutritionScoreChart } from "@/components/NutritionScoreChart";
import type { DailyNutritionScore, MealSubmission, NutritionLimits } from "@/lib/data";
import { api } from "@/lib/api-client";
import { clientCard, clientCardInner, clientSectionLabel } from "@/lib/client-ui";
import {
  averageMealRating,
  coachRatingStyle,
  formatMealMacros,
  hasEffectiveMealMacros,
  limitValueClass,
  macrosToKcal,
  mealDisplayName,
  sumMealMacros,
} from "@/lib/nutrition-utils";
import { browserDisplayableImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

export function NutritionClient({
  userId,
  meals: initialMeals,
  scoreTrend,
  limits,
  selectedDate,
  isToday,
  showAddButton = true,
  dateBasePath,
  onDateChange,
}: {
  userId: string;
  meals: MealSubmission[];
  scoreTrend: DailyNutritionScore[];
  limits: NutritionLimits;
  selectedDate: string;
  isToday: boolean;
  showAddButton?: boolean;
  dateBasePath?: string;
  onDateChange?: (date: string) => void;
}) {
  const [meals, setMeals] = useState(initialMeals);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setMeals(initialMeals);
  }, [initialMeals]);

  useEffect(() => {
    const needsAnalysis = initialMeals.some(
      (meal) => !meal.coach_reviewed && !meal.ai_analyzed_at
    );
    if (!needsAnalysis) return;

    let cancelled = false;
    setAnalyzing(true);
    api<MealSubmission[]>("nutrition/analyze-meals", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, date: selectedDate }),
    })
      .then((updated) => {
        if (!cancelled) setMeals(updated);
      })
      .catch(() => {
        // Keep server-rendered meals if analysis fails.
      })
      .finally(() => {
        if (!cancelled) setAnalyzing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialMeals, selectedDate, userId]);

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
  const hasMacroTotals =
    analyzing || totals.protein > 0 || totals.carbs > 0 || totals.fat > 0;
  const hasLimits =
    (limits.calories ?? 0) > 0 ||
    (limits.protein ?? 0) > 0 ||
    (limits.carbs ?? 0) > 0 ||
    (limits.fat ?? 0) > 0;
  const showDailyTotals = meals.length > 0 || hasLimits;
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <NutritionHeader
        selectedDate={selectedDate}
        isToday={isToday}
        showAddButton={showAddButton}
        dateBasePath={dateBasePath}
        onDateChange={onDateChange}
      />

      {showDailyTotals && (
        <div className={cn(clientCard, "p-4 sm:p-5")}>
          <div className="flex items-center justify-between gap-3">
            <p className={clientSectionLabel}>{t("nutrition.dailyTotals")}</p>
            {analyzing ? (
              <p className="text-xs text-white/45">{t("nutrition.analyzingMeals")}</p>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            <div className={cn(clientCardInner, "px-4 py-4 text-center")}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                {t("nutrition.totalKcal")}
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
                {t("nutrition.overallFoodScore")}
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
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
            <MacroLimitBox label={t("nutrition.protein")} consumed={totals.protein} limit={limits.protein} />
            <MacroLimitBox label={t("nutrition.carb")} consumed={totals.carbs} limit={limits.carbs} />
            <MacroLimitBox label={t("nutrition.fat")} consumed={totals.fat} limit={limits.fat} />
          </div>
        </div>
      )}

      <div>
        <p className={cn(clientSectionLabel, "mb-4")}>{t("nutrition.todaysMeals")}</p>
        {meals.length === 0 ? (
          <div className={cn(clientCard, "overflow-hidden")}>
            <p className="p-8 text-center text-white/45">
              {isToday ? t("nutrition.noMealsToday") : t("nutrition.noMealsDay")}
            </p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:hidden">
              {meals.map((m) => (
                <MealGridCard
                  key={m.id}
                  meal={m}
                  analyzing={analyzing}
                  canEdit={showAddButton && !m.coach_reviewed}
                  editNutritionLabel={t("nutrition.editNutrition")}
                  promptAgainLabel={t("nutrition.promptAgain")}
                  manualEstimateLabel={t("nutrition.manualEstimate")}
                  unsupportedPhotoLabel={t("nutrition.unsupportedPhotoFormat")}
                  analyzingLabel={t("nutrition.analyzingMeal")}
                  aiEstimateLabel={t("nutrition.aiEstimate")}
                />
              ))}
            </ul>
            <div className={cn(clientCard, "hidden overflow-hidden lg:block")}>
              <ul className="divide-y divide-white/10">
                {meals.map((m) => (
                  <MealListRow
                    key={m.id}
                    meal={m}
                    analyzing={analyzing}
                    canEdit={showAddButton && !m.coach_reviewed}
                    editNutritionLabel={t("nutrition.editNutrition")}
                    promptAgainLabel={t("nutrition.promptAgain")}
                    manualEstimateLabel={t("nutrition.manualEstimate")}
                    unsupportedPhotoLabel={t("nutrition.unsupportedPhotoFormat")}
                    analyzingLabel={t("nutrition.analyzingMeal")}
                    aiEstimateLabel={t("nutrition.aiEstimate")}
                  />
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className={cn(clientCard, "p-4 sm:p-5")}>
        <p className={clientSectionLabel}>{t("nutrition.foodScore7Day")}</p>
        <div className="mt-4">
          <NutritionScoreChart dailyScores={chartScores} />
        </div>
      </div>
    </div>
  );
}

function MealPhoto({
  meal,
  className,
  unsupportedLabel,
}: {
  meal: MealSubmission;
  className?: string;
  unsupportedLabel: string;
}) {
  const src = browserDisplayableImageSrc(meal.photo_base64);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`Meal ${meal.meal_number}`} className={className} />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-black/40 px-2 text-center text-white/30",
        className
      )}
    >
      {meal.photo_base64 ? unsupportedLabel : "No photo"}
    </div>
  );
}

function MealActionLinks({
  mealId,
  editNutritionLabel,
  promptAgainLabel,
}: {
  mealId: string;
  editNutritionLabel: string;
  promptAgainLabel: string;
}) {
  const linkClass =
    "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/45 transition-colors hover:text-white sm:text-xs";

  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      <Link href={`/nutrition/edit/${mealId}`} className={linkClass}>
        <Pencil className="h-3 w-3" />
        {editNutritionLabel}
      </Link>
      <Link href={`/nutrition/reprompt/${mealId}`} className={linkClass}>
        <RefreshCw className="h-3 w-3" />
        {promptAgainLabel}
      </Link>
    </div>
  );
}

function macroSourceLabel(
  meal: MealSubmission,
  aiEstimateLabel: string,
  manualEstimateLabel: string
): string | null {
  if (meal.coach_reviewed) return null;
  if (!hasEffectiveMealMacros(meal)) return null;
  return meal.ai_source === "manual" ? manualEstimateLabel : aiEstimateLabel;
}

function MealGridCard({
  meal,
  analyzing,
  canEdit,
  editNutritionLabel,
  promptAgainLabel,
  manualEstimateLabel,
  unsupportedPhotoLabel,
  analyzingLabel,
  aiEstimateLabel,
}: {
  meal: MealSubmission;
  analyzing: boolean;
  canEdit: boolean;
  editNutritionLabel: string;
  promptAgainLabel: string;
  manualEstimateLabel: string;
  unsupportedPhotoLabel: string;
  analyzingLabel: string;
  aiEstimateLabel: string;
}) {
  const ratingStyle = meal.coach_rating != null ? coachRatingStyle(meal.coach_rating) : null;
  const macroText = formatMealMacros(meal);
  const sourceLabel = macroSourceLabel(meal, aiEstimateLabel, manualEstimateLabel);
  const showAnalyzing = analyzing && !meal.coach_reviewed && !meal.ai_analyzed_at;

  return (
    <li className={cn(clientCard, "flex flex-col overflow-hidden p-2.5 sm:p-3")}>
      <MealPhoto
        meal={meal}
        unsupportedLabel={unsupportedPhotoLabel}
        className="aspect-square w-full rounded-lg object-cover text-[10px]"
      />
      <div className="mt-2 min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{mealDisplayName(meal)}</p>
        {meal.description ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] text-white/45">{meal.description}</p>
        ) : null}
        <p className="mt-1 text-[10px] text-white/35">
          {meal.coach_reviewed ? "Reviewed" : "Pending"}
        </p>
        {showAnalyzing ? (
          <p className="mt-1 text-[11px] text-white/45">{analyzingLabel}</p>
        ) : macroText ? (
          <p className="mt-1 text-[11px] text-white/45">
            {macroText}
            {sourceLabel ? <span className="text-white/30"> · {sourceLabel}</span> : null}
          </p>
        ) : null}
        {meal.coach_reviewed && meal.coach_feedback ? (
          <p className="mt-1 line-clamp-2 text-[11px] text-white/60">{meal.coach_feedback}</p>
        ) : null}
        {meal.coach_reviewed && meal.coach_rating != null && ratingStyle ? (
          <p className={`mt-1 text-[10px] font-semibold ${ratingStyle.className}`}>
            {meal.coach_rating}/5 — {ratingStyle.label}
          </p>
        ) : null}
        {canEdit ? (
          <MealActionLinks
            mealId={meal.id}
            editNutritionLabel={editNutritionLabel}
            promptAgainLabel={promptAgainLabel}
          />
        ) : null}
      </div>
    </li>
  );
}

function MealListRow({
  meal,
  analyzing,
  canEdit,
  editNutritionLabel,
  promptAgainLabel,
  manualEstimateLabel,
  unsupportedPhotoLabel,
  analyzingLabel,
  aiEstimateLabel,
}: {
  meal: MealSubmission;
  analyzing: boolean;
  canEdit: boolean;
  editNutritionLabel: string;
  promptAgainLabel: string;
  manualEstimateLabel: string;
  unsupportedPhotoLabel: string;
  analyzingLabel: string;
  aiEstimateLabel: string;
}) {
  const ratingStyle = meal.coach_rating != null ? coachRatingStyle(meal.coach_rating) : null;
  const macroText = formatMealMacros(meal);
  const sourceLabel = macroSourceLabel(meal, aiEstimateLabel, manualEstimateLabel);
  const showAnalyzing = analyzing && !meal.coach_reviewed && !meal.ai_analyzed_at;

  return (
    <li className="flex gap-4 px-6 py-5">
      <MealPhoto
        meal={meal}
        unsupportedLabel={unsupportedPhotoLabel}
        className="h-20 w-20 shrink-0 rounded-xl object-cover text-xs"
      />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-white">{mealDisplayName(meal)}</p>
        {meal.description ? (
          <p className="mt-1 text-sm text-white/45">{meal.description}</p>
        ) : null}
        <p className="mt-2 text-xs text-white/35">
          {meal.coach_reviewed ? "Reviewed by coach" : "Pending coach review"}
        </p>
        {showAnalyzing ? (
          <p className="mt-2 text-sm text-white/45">{analyzingLabel}</p>
        ) : macroText ? (
          <p className="mt-2 text-sm text-white/45">
            {macroText}
            {sourceLabel ? <span className="text-white/30"> · {sourceLabel}</span> : null}
          </p>
        ) : null}
        {meal.coach_reviewed && meal.coach_feedback ? (
          <p className="mt-1 text-sm text-white/60">{meal.coach_feedback}</p>
        ) : null}
        {canEdit ? (
          <MealActionLinks
            mealId={meal.id}
            editNutritionLabel={editNutritionLabel}
            promptAgainLabel={promptAgainLabel}
          />
        ) : null}
      </div>
      {meal.coach_reviewed && meal.coach_rating != null && ratingStyle ? (
        <div className="shrink-0 text-right">
          <p className={`text-sm font-semibold ${ratingStyle.className}`}>
            {meal.coach_rating}/5 — {ratingStyle.label}
          </p>
        </div>
      ) : null}
    </li>
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
