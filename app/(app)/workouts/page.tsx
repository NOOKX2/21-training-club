import { Suspense } from "react";
import { AppPageLoading } from "@/components/AppPageLoading";
import { WorkoutClient } from "@/components/WorkoutClient";
import { getFormChecksForUserWeekDay, getWorkoutPageData } from "@/lib/data";
import {
  getProgramWeekDay,
  resolveProgramStartDate,
} from "@/lib/program-schedule";
import { requireAppUser } from "@/lib/session";

async function WorkoutsPageContent({
  week,
  day,
}: {
  week: number;
  day: number;
}) {
  const user = await requireAppUser();
  const { days, logs, cardioLog } = await getWorkoutPageData(
    user.id,
    user.email,
    week,
    day
  );
  const formChecks = await getFormChecksForUserWeekDay(user.id, week, day);
  return (
    <WorkoutClient
      key={`${week}-${day}`}
      userId={user.id}
      week={week}
      day={day}
      days={days}
      initialLogs={logs}
      initialCardioLog={cardioLog}
      initialFormChecks={formChecks}
    />
  );
}

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const hasWeekParam = params.week !== undefined;
  const hasDayParam = params.day !== undefined;

  let week = Math.min(4, Math.max(1, parseInt(params.week ?? "1", 10) || 1));
  let day = Math.min(7, Math.max(1, parseInt(params.day ?? "1", 10) || 1));

  if (!hasWeekParam && !hasDayParam) {
    const startDate = resolveProgramStartDate(user);
    const programDay = getProgramWeekDay(startDate);
    week = programDay.week;
    day = programDay.day;
  }

  return (
    <Suspense key={`${week}-${day}`} fallback={<AppPageLoading />}>
      <WorkoutsPageContent week={week} day={day} />
    </Suspense>
  );
}
