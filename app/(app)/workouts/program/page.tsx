import { WorkoutProgramList } from "@/app/(app)/workouts/program/_components/WorkoutProgramList";
import { requireAppUser } from "@/lib/session";
import {
  filterWorkoutProgramListItems,
  getWorkoutProgramListPageData,
  parseWorkoutProgramListFilter,
} from "@/lib/user-workout-program";

export const revalidate = 60;

export default async function WorkoutProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const filter = parseWorkoutProgramListFilter(params.filter);
  const { items } = await getWorkoutProgramListPageData(user.id);
  const filteredItems = filterWorkoutProgramListItems(items, filter);

  return <WorkoutProgramList items={filteredItems} filter={filter} />;
}
