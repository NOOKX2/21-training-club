import { NutritionClient } from "@/components/NutritionClient";
import {
  getAdminClientById,
  getMealsForUser,
  getNutritionLimits,
  getNutritionScoreTrend,
} from "@/lib/data";
import { localDateKey } from "@/lib/date-utils";
import { notFound } from "next/navigation";

function parseNutritionDate(raw?: string): string {
  const today = localDateKey(new Date());
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return today;
  if (raw > today) return today;
  return raw;
}

export default async function AdminClientNutritionPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { clientId } = await params;
  const client = await getAdminClientById(clientId);
  if (!client) notFound();

  const query = await searchParams;
  const selectedDate = parseNutritionDate(query.date);
  const today = localDateKey(new Date());
  const [meals, scoreTrend, limits] = await Promise.all([
    getMealsForUser(clientId, selectedDate),
    getNutritionScoreTrend(clientId, 7, selectedDate),
    getNutritionLimits(client.email),
  ]);

  return (
    <NutritionClient
      key={selectedDate}
      meals={meals}
      scoreTrend={scoreTrend}
      limits={limits}
      selectedDate={selectedDate}
      isToday={selectedDate === today}
      showAddButton={false}
      dateBasePath={`/admin/clients/${clientId}/nutrition`}
    />
  );
}
