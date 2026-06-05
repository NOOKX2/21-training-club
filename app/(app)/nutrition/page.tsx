import { NutritionClient } from "@/components/NutritionClient";
import { getMealsForUser } from "@/lib/data";
import { requireAppUser } from "@/lib/session";

export default async function NutritionPage() {
  const user = await requireAppUser();
  const today = new Date().toISOString().slice(0, 10);
  const meals = await getMealsForUser(user.id, today);
  return <NutritionClient meals={meals} />;
}
