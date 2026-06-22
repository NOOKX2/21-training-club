"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClientResults } from "@/components/admin/ClientResults";
import { parseDay, parseWeek } from "@/lib/admin-page-keys";
import { useAdminResultsPage } from "@/lib/hooks/use-admin-page";

export function AdminResultsPageView() {
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState(() => searchParams.get("client") ?? "");
  const [week, setWeek] = useState(() => parseWeek(searchParams.get("week")));
  const [day, setDay] = useState(() => parseDay(searchParams.get("day")));
  const { data } = useAdminResultsPage(clientId, week, day);

  useEffect(() => {
    setClientId(searchParams.get("client") ?? "");
    setWeek(parseWeek(searchParams.get("week")));
    setDay(parseDay(searchParams.get("day")));
  }, [searchParams]);

  if (
    !data ||
    data.selectedClientId !== clientId ||
    data.week !== week ||
    data.day !== day
  ) {
    return null;
  }

  return (
    <ClientResults
      clients={data.clients}
      selectedClientId={data.selectedClientId}
      week={data.week}
      day={data.day}
      logs={data.logs}
      formChecks={data.formChecks}
    />
  );
}
