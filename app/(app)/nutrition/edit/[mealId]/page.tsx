import { NutritionSubmitClient } from "@/components/NutritionSubmitClient";
import { getMealById } from "@/lib/data";
import { requireAppUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

export default async function NutritionEditPage({
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
  return <NutritionSubmitClient userId={user.id} meal={meal} />;
}
