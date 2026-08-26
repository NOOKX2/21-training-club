import { WorkoutWeekCompareClient } from "@/app/(app)/workouts/compare/_components/WorkoutWeekCompareClient";
import { getWorkoutWeekComparison } from "@/lib/data";
import { requireAppUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WorkoutWeekComparePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const day = Math.min(7, Math.max(1, parseInt(params.day ?? "1", 10) || 1));
  const data = await getWorkoutWeekComparison(user.id, day);
  return <WorkoutWeekCompareClient data={data} />;
}
