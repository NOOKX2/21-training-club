"use client";

import { MealActionLinks, MealPhoto } from "@/app/(app)/nutrition/_components/MealPhoto";
import { macroSourceLabel } from "@/app/(app)/nutrition/_components/meal-utils";
import type { MealSubmission } from "@/lib/data";
import { coachRatingStyle, formatMealMacros, mealDisplayName } from "@/lib/nutrition-utils";

export function MealListRow({
  meal,
  analyzing,
  canEdit,
  editNutritionLabel,
  promptAgainLabel,
  deleteMealLabel,
  deletingMealLabel,
  deleting,
  onDelete,
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
  deleteMealLabel: string;
  deletingMealLabel: string;
  deleting: boolean;
  onDelete: () => void;
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
            deleteMealLabel={deleteMealLabel}
            deletingMealLabel={deletingMealLabel}
            deleting={deleting}
            onDelete={onDelete}
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
