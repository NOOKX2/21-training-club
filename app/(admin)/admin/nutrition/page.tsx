import { NutritionReview } from "@/components/admin/NutritionReview";
import { getAdminClients, getNutritionMealsForUser } from "@/lib/data";

export default async function AdminNutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; date?: string }>;
}) {
  const params = await searchParams;
  const clients = await getAdminClients();
  const selectedClientId =
    params.client && clients.some((c) => c.id === params.client)
      ? params.client
      : (clients[0]?.id ?? "");
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const meals = selectedClientId
    ? await getNutritionMealsForUser(selectedClientId, date)
    : [];
  return (
    <NutritionReview
      clients={clients}
      selectedClientId={selectedClientId}
      date={date}
      meals={meals}
    />
  );
}
