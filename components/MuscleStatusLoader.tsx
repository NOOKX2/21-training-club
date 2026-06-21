import { MuscleStreakStatusSync } from "@/components/MuscleStreakContext";
import { getDailyMuscleStatus } from "@/lib/muscle-streak";

export async function MuscleStatusLoader({ userId }: { userId: string }) {
  const status = await getDailyMuscleStatus(userId);
  return <MuscleStreakStatusSync status={status} />;
}
