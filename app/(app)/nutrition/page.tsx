import { NutritionClient } from "@/components/NutritionClient";
import {
  getMealsForUser,
  getNutritionLimits,
  getNutritionScoreTrend,
} from "@/lib/data";
import { localDateKey } from "@/lib/date-utils";
import { requireAppUser } from "@/lib/session";

export default async function NutritionPage() {
  const user = await requireAppUser();
  const today = localDateKey(new Date());
  const [meals, scoreTrend, limits] = await Promise.all([
    getMealsForUser(user.id, today),
    getNutritionScoreTrend(user.id, 7),
    getNutritionLimits(user.email),
  ]);
  return (
    <NutritionClient meals={meals} scoreTrend={scoreTrend} limits={limits} />
  );
}
