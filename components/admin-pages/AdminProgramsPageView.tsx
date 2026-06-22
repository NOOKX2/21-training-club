"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProgramBuilder } from "@/components/admin/ProgramBuilder";
import { parseDay, parseProgramTrack } from "@/lib/admin-page-keys";
import { useAdminProgramsPage } from "@/lib/hooks/use-admin-page";

export function AdminProgramsPageView() {
  const searchParams = useSearchParams();
  const [track, setTrack] = useState(() =>
    parseProgramTrack(searchParams.get("track"))
  );
  const [day, setDay] = useState(() => parseDay(searchParams.get("day")));
  const { data } = useAdminProgramsPage(track, day);

  useEffect(() => {
    setTrack(parseProgramTrack(searchParams.get("track")));
    setDay(parseDay(searchParams.get("day")));
  }, [searchParams]);

  if (!data || data.track !== track || data.day !== day) return null;

  return (
    <ProgramBuilder
      key={`${data.track}-${data.day}`}
      track={data.track}
      day={data.day}
      program={data.program}
      videos={data.videos}
    />
  );
}
