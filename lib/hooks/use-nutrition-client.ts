"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import type { DailyNutritionScore, MealSubmission, NutritionLimits } from "@/lib/data";
import { api } from "@/lib/api-client";
import {
  averageMealRating,
  macrosToKcal,
  sumMealMacros,
} from "@/lib/nutrition-utils";

export function useNutritionClient({
  userId,
  initialMeals,
  scoreTrend,
  limits,
  selectedDate,
  t,
}: {
  userId: string;
  initialMeals: MealSubmission[];
  scoreTrend: DailyNutritionScore[];
  limits: NutritionLimits;
  selectedDate: string;
  t: (key: string) => string;
}) {
  const [meals, setMeals] = useState(initialMeals);
  const [analyzing, setAnalyzing] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

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

  const deleteMeal = useCallback(
    async (mealId: string) => {
      if (deletingMealId || !window.confirm(t("nutrition.confirmDeleteMeal"))) return;

      setDeletingMealId(mealId);
      try {
        await api(`nutrition/meals-v2/${mealId}`, { method: "DELETE" });
        setMeals((current) => current.filter((meal) => meal.id !== mealId));
        void mutate(
          `app-pages/nutrition?date=${selectedDate}`,
          (current?: { meals: MealSubmission[] }) =>
            current
              ? { ...current, meals: current.meals.filter((meal) => meal.id !== mealId) }
              : current,
          { revalidate: false }
        );
      } catch {
        // Keep current list if delete fails.
      } finally {
        setDeletingMealId(null);
      }
    },
    [deletingMealId, mutate, selectedDate, t]
  );

  const totals = sumMealMacros(meals);
  const totalKcal = macrosToKcal(totals);
  const overallScore = averageMealRating(meals);
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

  const hasLimits =
    (limits.calories ?? 0) > 0 ||
    (limits.protein ?? 0) > 0 ||
    (limits.carbs ?? 0) > 0 ||
    (limits.fat ?? 0) > 0;
  const showDailyTotals = meals.length > 0 || hasLimits;

  return {
    meals,
    analyzing,
    deletingMealId,
    deleteMeal,
    totals,
    totalKcal,
    overallScore,
    chartScores,
    showDailyTotals,
  };
}
