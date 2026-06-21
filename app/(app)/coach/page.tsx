import { Suspense } from "react";
import { AppPageLoading } from "@/components/AppPageLoading";
import { CoachClient } from "@/components/CoachClient";
import { getCoaches, getMessages, getWeeklyReports } from "@/lib/data";
import { resolveProgramStartDate } from "@/lib/program-schedule";
import { requireAppUser } from "@/lib/session";

async function CoachPageContent({
  coachIdParam,
}: {
  coachIdParam?: string;
}) {
  const user = await requireAppUser();
  const coaches = await getCoaches();
  const coachId =
    coachIdParam && coaches.some((c) => c.id === coachIdParam)
      ? coachIdParam
      : (coaches[0]?.id ?? "");
  const messages = coachId ? await getMessages(user.id, coachId) : [];
  const weeklyReports = await getWeeklyReports(user.id);
  return (
    <CoachClient
      userId={user.id}
      coaches={coaches}
      coachId={coachId}
      initialMessages={messages}
      initialReports={weeklyReports}
      programStartDate={resolveProgramStartDate(user)}
    />
  );
}

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ coach?: string }>;
}) {
  const params = await searchParams;

  return (
    <Suspense key={params.coach ?? "default"} fallback={<AppPageLoading />}>
      <CoachPageContent coachIdParam={params.coach} />
    </Suspense>
  );
}
