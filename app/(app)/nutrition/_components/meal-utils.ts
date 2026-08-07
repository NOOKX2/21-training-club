import type { MealSubmission } from "@/lib/data";
import { hasEffectiveMealMacros } from "@/lib/nutrition-utils";

export function macroSourceLabel(
  meal: MealSubmission,
  aiEstimateLabel: string,
  manualEstimateLabel: string
): string | null {
  if (meal.coach_reviewed) return null;
  if (!hasEffectiveMealMacros(meal)) return null;
  return meal.ai_source === "manual" ? manualEstimateLabel : aiEstimateLabel;
}
