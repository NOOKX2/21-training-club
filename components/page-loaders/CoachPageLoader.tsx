"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CoachClient } from "@/components/CoachClient";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";
import { useAppUser } from "@/components/AppUserProvider";
import { api } from "@/lib/api-client";
import type { Coach, Message, WeeklyReport } from "@/lib/data";

type CoachPageData = {
  coaches: Coach[];
  coachId: string;
  messages: Message[];
  weeklyReports: WeeklyReport[];
  programStartDate: string;
};

export function CoachPageLoader() {
  const user = useAppUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachParam = searchParams.get("coach");
  const query = coachParam ? `?coach=${encodeURIComponent(coachParam)}` : "";
  const [data, setData] = useState<CoachPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    api<CoachPageData>(`app-pages/coach${query}`)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) router.refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [query, router]);

  if (!data) {
    return <AppPageSkeleton />;
  }

  return (
    <CoachClient
      userId={user.id}
      coaches={data.coaches}
      coachId={data.coachId}
      initialMessages={data.messages}
      initialReports={data.weeklyReports}
      programStartDate={data.programStartDate}
    />
  );
}
