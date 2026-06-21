import { NutritionRepromptClient } from "@/components/NutritionRepromptClient";
import { buildMealPrompt, isDifyConfigured } from "@/lib/dify";
import { getMealById } from "@/lib/data";
import { requireAppUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

export default async function NutritionRepromptPage({
  params,
}: {
  params: Promise<{ mealId: string }>;
}) {
  const user = await requireAppUser();
  const { mealId } = await params;
  const meal = await getMealById(mealId, user.id);
  if (!meal) notFound();
  if (meal.coach_reviewed) {
    redirect("/nutrition");
  }

  const defaultPrompt = buildMealPrompt({
    meal_number: meal.meal_number,
    custom_name: meal.custom_name,
    description: meal.description,
    weight: meal.weight,
  });

  return (
    <NutritionRepromptClient
      meal={meal}
      defaultPrompt={defaultPrompt}
      difyConfigured={isDifyConfigured()}
    />
  );
}
