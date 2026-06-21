import type { MealSubmission } from "./data";

const MEAL_LABELS: Record<number, string> = {
  1: "Meal 1",
  2: "Meal 2",
  3: "Meal 3",
  4: "Meal 4",
};

export function mealDisplayName(meal: MealSubmission): string {
  if (meal.custom_name?.trim()) return meal.custom_name.trim();
  return MEAL_LABELS[meal.meal_number] ?? `Meal ${meal.meal_number}`;
}

const RATING_LABELS: Record<number, string> = {
  5: "Excellent",
  4: "Good",
  3: "Fair",
  2: "Needs work",
  1: "Poor",
};

export type MealMacroFields = {
  coach_reviewed?: boolean;
  protein?: number;
  carbs?: number;
  fat?: number;
  ai_protein?: number;
  ai_carbs?: number;
  ai_fat?: number;
};

export function getEffectiveMealMacros(
  meal: MealMacroFields
): { protein: number; carbs: number; fat: number } {
  if (meal.coach_reviewed) {
    return {
      protein: meal.protein ?? 0,
      carbs: meal.carbs ?? 0,
      fat: meal.fat ?? 0,
    };
  }
  return {
    protein: meal.ai_protein ?? 0,
    carbs: meal.ai_carbs ?? 0,
    fat: meal.ai_fat ?? 0,
  };
}

export function hasEffectiveMealMacros(meal: MealMacroFields): boolean {
  const macros = getEffectiveMealMacros(meal);
  return macros.protein > 0 || macros.carbs > 0 || macros.fat > 0;
}

export function sumMealMacros(
  meals: Array<MealMacroFields>
): { protein: number; carbs: number; fat: number } {
  return meals.reduce<{ protein: number; carbs: number; fat: number }>(
    (acc, meal) => {
      const macros = getEffectiveMealMacros(meal);
      return {
        protein: acc.protein + macros.protein,
        carbs: acc.carbs + macros.carbs,
        fat: acc.fat + macros.fat,
      };
    },
    { protein: 0, carbs: 0, fat: 0 }
  );
}

export function macrosToKcal(macros: {
  protein: number;
  carbs: number;
  fat: number;
}): number {
  return macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
}

export function limitMacrosToKcal(macros: {
  protein: number;
  carbs: number;
  fat: number;
}): number {
  return macros.protein * 4 + macros.carbs * 4 + macros.fat * 8;
}

export function formatMealMacros(meal: MealMacroFields): string | null {
  const macros = getEffectiveMealMacros(meal);
  const parts: string[] = [];
  if (macros.protein > 0) parts.push(`P ${macros.protein}g`);
  if (macros.carbs > 0) parts.push(`C ${macros.carbs}g`);
  if (macros.fat > 0) parts.push(`F ${macros.fat}g`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function averageMealRating(
  meals: Array<{ coach_reviewed?: boolean; coach_rating?: number }>
): number | null {
  const ratings = meals
    .filter((meal) => meal.coach_reviewed && meal.coach_rating != null)
    .map((meal) => meal.coach_rating!);
  if (!ratings.length) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function limitValueClass(consumed: number, limit?: number): string {
  if (limit == null || limit <= 0) return "text-white";
  return consumed >= limit ? "text-red-400" : "text-white";
}

export function formatLimitValue(
  consumed: number,
  limit?: number,
  unit = ""
): string {
  if (limit == null || limit <= 0) {
    return `${consumed}${unit ? ` ${unit}` : ""}`;
  }
  return `${consumed}/${limit}${unit ? ` ${unit}` : ""}`;
}

export function coachRatingStyle(rating: number): {
  label: string;
  className: string;
} {
  const rounded = Math.min(5, Math.max(1, Math.round(rating)));
  const label = RATING_LABELS[rounded] ?? String(rating);
  if (rating >= 4) return { label, className: "text-[#6B93B8]" };
  if (rating >= 3) return { label, className: "text-amber-400" };
  return { label, className: "text-red-400" };
}
