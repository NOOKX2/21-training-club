import { NutritionSubmitClient } from "@/components/NutritionSubmitClient";
import { parsePastOrTodayDateKey } from "@/lib/date-utils";
import { requireAppUser } from "@/lib/session";

export default async function NutritionAddPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const mealDate = parsePastOrTodayDateKey(params.date ?? null);
  return <NutritionSubmitClient userId={user.id} mealDate={mealDate} />;
}
