import { WorkoutProgramEditor } from "@/app/(app)/workouts/program/edit/_components/WorkoutProgramEditor";
import { requireAppUser } from "@/lib/session";
import {
  getWorkoutProgramEditorPageData,
  parseWorkoutProgramDay,
  parseWorkoutProgramId,
} from "@/lib/user-workout-program";

export const dynamic = "force-dynamic";

export default async function WorkoutProgramEditPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; program?: string }>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const returnDay = parseWorkoutProgramDay(params.day);
  const programId = parseWorkoutProgramId(params.program);
  const { programId: resolvedProgramId, programName, days, videos } =
    await getWorkoutProgramEditorPageData(user.id, programId);

  return (
    <WorkoutProgramEditor
      programId={resolvedProgramId}
      programName={programName}
      returnDay={returnDay}
      initialDays={days}
      initialVideos={videos}
    />
  );
}
