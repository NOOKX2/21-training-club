"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { NutritionHeader } from "@/app/(app)/nutrition/_components/NutritionHeader";
import { NutritionScoreChart } from "@/app/(app)/nutrition/_components/NutritionScoreChart";
import { MealGridCard } from "@/app/(app)/nutrition/_components/MealGridCard";
import { MealListRow } from "@/app/(app)/nutrition/_components/MealListRow";
import { NutritionDailyTotals } from "@/app/(app)/nutrition/_components/NutritionDailyTotals";
import type { DailyNutritionScore, MealSubmission, NutritionLimits } from "@/lib/data";
import { useNutritionClient } from "@/lib/hooks/use-nutrition-client";
import { clientCard, clientSectionLabel } from "@/lib/client-ui";
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
  const { t } = useLanguage();
  const nutrition = useNutritionClient({
    userId,
    initialMeals,
    scoreTrend,
    limits,
    selectedDate,
    t,
  });

  const mealLabels = {
    editNutrition: t("nutrition.editNutrition"),
    promptAgain: t("nutrition.promptAgain"),
    deleteMeal: t("nutrition.deleteMeal"),
    deletingMeal: t("nutrition.deletingMeal"),
    manualEstimate: t("nutrition.manualEstimate"),
    unsupportedPhoto: t("nutrition.unsupportedPhotoFormat"),
    analyzing: t("nutrition.analyzingMeal"),
    aiEstimate: t("nutrition.aiEstimate"),
  };

  return (
    <div className="space-y-6">
      <NutritionHeader
        selectedDate={selectedDate}
        isToday={isToday}
        showAddButton={showAddButton}
        dateBasePath={dateBasePath}
        onDateChange={onDateChange}
      />

      {nutrition.showDailyTotals ? (
        <NutritionDailyTotals
          analyzing={nutrition.analyzing}
          totalKcal={nutrition.totalKcal}
          overallScore={nutrition.overallScore}
          totals={nutrition.totals}
          limits={limits}
          labels={{
            dailyTotals: t("nutrition.dailyTotals"),
            analyzingMeals: t("nutrition.analyzingMeals"),
            totalKcal: t("nutrition.totalKcal"),
            overallFoodScore: t("nutrition.overallFoodScore"),
            protein: t("nutrition.protein"),
            carb: t("nutrition.carb"),
            fat: t("nutrition.fat"),
          }}
        />
      ) : null}

      <div>
        <p className={cn(clientSectionLabel, "mb-4")}>{t("nutrition.todaysMeals")}</p>
        {nutrition.meals.length === 0 ? (
          <div className={cn(clientCard, "overflow-hidden")}>
            <p className="p-8 text-center text-white/45">
              {isToday ? t("nutrition.noMealsToday") : t("nutrition.noMealsDay")}
            </p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:hidden">
              {nutrition.meals.map((meal) => (
                <MealGridCard
                  key={meal.id}
                  meal={meal}
                  analyzing={nutrition.analyzing}
                  canEdit={showAddButton && !meal.coach_reviewed}
                  editNutritionLabel={mealLabels.editNutrition}
                  promptAgainLabel={mealLabels.promptAgain}
                  deleteMealLabel={mealLabels.deleteMeal}
                  deletingMealLabel={mealLabels.deletingMeal}
                  deleting={nutrition.deletingMealId === meal.id}
                  onDelete={() => void nutrition.deleteMeal(meal.id)}
                  manualEstimateLabel={mealLabels.manualEstimate}
                  unsupportedPhotoLabel={mealLabels.unsupportedPhoto}
                  analyzingLabel={mealLabels.analyzing}
                  aiEstimateLabel={mealLabels.aiEstimate}
                />
              ))}
            </ul>
            <div className={cn(clientCard, "hidden overflow-hidden lg:block")}>
              <ul className="divide-y divide-white/10">
                {nutrition.meals.map((meal) => (
                  <MealListRow
                    key={meal.id}
                    meal={meal}
                    analyzing={nutrition.analyzing}
                    canEdit={showAddButton && !meal.coach_reviewed}
                    editNutritionLabel={mealLabels.editNutrition}
                    promptAgainLabel={mealLabels.promptAgain}
                    deleteMealLabel={mealLabels.deleteMeal}
                    deletingMealLabel={mealLabels.deletingMeal}
                    deleting={nutrition.deletingMealId === meal.id}
                    onDelete={() => void nutrition.deleteMeal(meal.id)}
                    manualEstimateLabel={mealLabels.manualEstimate}
                    unsupportedPhotoLabel={mealLabels.unsupportedPhoto}
                    analyzingLabel={mealLabels.analyzing}
                    aiEstimateLabel={mealLabels.aiEstimate}
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
          <NutritionScoreChart dailyScores={nutrition.chartScores} />
        </div>
      </div>
    </div>
  );
}
