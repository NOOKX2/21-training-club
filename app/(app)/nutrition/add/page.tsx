import { NutritionSubmitClient } from "@/components/NutritionSubmitClient";
import { requireAppUser } from "@/lib/session";

export default async function NutritionAddPage() {
  const user = await requireAppUser();
  return <NutritionSubmitClient userId={user.id} />;
}
