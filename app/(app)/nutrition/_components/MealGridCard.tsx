"use client";

import { MealActionLinks, MealPhoto } from "@/app/(app)/nutrition/_components/MealPhoto";
import { macroSourceLabel } from "@/app/(app)/nutrition/_components/meal-utils";
import { clientCard } from "@/lib/client-ui";
import type { MealSubmission } from "@/lib/data";
import { coachRatingStyle, formatMealMacros, mealDisplayName } from "@/lib/nutrition-utils";
import { cn } from "@/lib/utils";

export function MealGridCard({
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
            deleteMealLabel={deleteMealLabel}
            deletingMealLabel={deletingMealLabel}
            deleting={deleting}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    </li>
  );
}
