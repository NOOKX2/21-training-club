"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CoachClient } from "@/components/CoachClient";
import { useMainTabNav } from "@/components/MainTabNav";
import { useCoachPage } from "@/lib/hooks/use-app-page";
import { replaceAppUrl } from "@/lib/sync-url";

export function CoachPageView() {
  const { activePath } = useMainTabNav();
  const isCoachActive = activePath === "/coach";
  const searchParams = useSearchParams();
  const coachParam = searchParams.get("coach") ?? undefined;
  const [coachId, setCoachId] = useState<string | undefined>(coachParam);
  const { data } = useCoachPage(coachId);

  useEffect(() => {
    setCoachId(searchParams.get("coach") ?? undefined);
  }, [searchParams]);

  useEffect(() => {
    if (!isCoachActive || !data?.coachId || data.coachId === coachId) return;
    setCoachId(data.coachId);
    replaceAppUrl("/coach", { coach: data.coachId });
  }, [isCoachActive, coachId, data?.coachId]);

  if (!data) return null;

  return (
    <CoachClient
      userId={data.userId}
      coaches={data.coaches}
      coachId={data.coachId}
      initialMessages={data.messages}
      initialReports={data.weeklyReports}
      programStartDate={data.programStartDate}
    />
  );
}
