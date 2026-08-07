import { ExercisePickerClient } from "@/app/(app)/workouts/program/edit/exercises/_components/ExercisePickerClient";
import { listExercisePickerItemsForUser } from "@/lib/user-exercises";
import { getDb } from "@/lib/db";
import { requireAppUser } from "@/lib/session";
import {
  parseWorkoutProgramDay,
  parseWorkoutProgramId,
} from "@/lib/workout-program-shared";

export const dynamic = "force-dynamic";

export default async function WorkoutExercisePickerPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; program?: string; focus?: string }>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const day = parseWorkoutProgramDay(params.day);
  const programId = parseWorkoutProgramId(params.program);
  const focusId = params.focus?.trim() || undefined;
  const db = await getDb();
  const exercises = await listExercisePickerItemsForUser(db, user.id);

  return (
    <ExercisePickerClient
      programId={programId}
      day={day}
      exercises={exercises}
      focusId={focusId}
    />
  );
}
