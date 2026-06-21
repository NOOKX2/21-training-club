"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkoutClient } from "@/components/WorkoutClient";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";
import { useAppUser } from "@/components/AppUserProvider";
import { api } from "@/lib/api-client";
import type { CardioLog, FormCheckSubmission, WorkoutDay, WorkoutLog } from "@/lib/data";

type WorkoutsPageData =
  | {
      needsRedirect: true;
      week: number;
      day: number;
    }
  | {
      needsRedirect?: false;
      week: number;
      day: number;
      days: WorkoutDay[];
      logs: Record<string, WorkoutLog>;
      cardioLog: CardioLog;
      formChecks: FormCheckSubmission[];
    };

export function WorkoutsPageLoader() {
  const user = useAppUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = searchParams.get("week");
  const dayParam = searchParams.get("day");
  const query = weekParam || dayParam ? `?week=${weekParam ?? "1"}&day=${dayParam ?? "1"}` : "";
  const [data, setData] = useState<Extract<WorkoutsPageData, { days: WorkoutDay[] }> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    setData(null);
    api<WorkoutsPageData>(`app-pages/workouts${query}`)
      .then((payload) => {
        if (cancelled) return;
        if (payload.needsRedirect) {
          router.replace(`/workouts?week=${payload.week}&day=${payload.day}`);
          return;
        }
        setData(payload);
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
    <WorkoutClient
      key={`${data.week}-${data.day}`}
      userId={user.id}
      week={data.week}
      day={data.day}
      days={data.days}
      initialLogs={data.logs}
      initialCardioLog={data.cardioLog}
      initialFormChecks={data.formChecks}
    />
  );
}
