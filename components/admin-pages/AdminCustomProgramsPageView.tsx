"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CustomPrograms } from "@/components/admin/CustomPrograms";
import { parseDay, parseWeek } from "@/lib/admin-page-keys";
import { useAdminCustomProgramsPage } from "@/lib/hooks/use-admin-page";

export function AdminCustomProgramsPageView() {
  const searchParams = useSearchParams();
  const [client, setClient] = useState(() => searchParams.get("client") ?? "");
  const [week, setWeek] = useState(() => parseWeek(searchParams.get("week")));
  const [day, setDay] = useState(() => parseDay(searchParams.get("day")));
  const { data } = useAdminCustomProgramsPage(client, week, day);

  useEffect(() => {
    setClient(searchParams.get("client") ?? "");
    setWeek(parseWeek(searchParams.get("week")));
    setDay(parseDay(searchParams.get("day")));
  }, [searchParams]);

  if (
    !data ||
    data.selectedEmail !== client ||
    data.week !== week ||
    data.day !== day
  ) {
    return null;
  }

  return (
    <CustomPrograms
      key={`${data.selectedEmail}-${data.week}-${data.day}`}
      clients={data.clients}
      selectedEmail={data.selectedEmail}
      week={data.week}
      day={data.day}
      initialExercises={data.initialExercises}
      initialCardio={data.initialCardio}
      initialRestDay={data.initialRestDay}
      initialLimits={data.initialLimits}
      videos={data.videos}
    />
  );
}
