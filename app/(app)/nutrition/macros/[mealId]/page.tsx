import { redirect } from "next/navigation";

export default async function NutritionMacrosRedirectPage({
  params,
}: {
  params: Promise<{ mealId: string }>;
}) {
  const { mealId } = await params;
  redirect(`/nutrition/edit/${mealId}`);
}
